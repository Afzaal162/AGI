import { Request, Response } from "express";
import * as Sentry from '@sentry/node';
import { prisma } from "../config/prisma";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from "path";
import axios from "axios";
import ai from "../config/ai";
import FormData from 'form-data';
import { getAuth } from "@clerk/express";

// Helper function to convert local Multer files into Gemini inline data objects
const fileToGenerativePart = (filePath: string, mimeType: string) => {
    return {
        inlineData: {
            data: fs.readFileSync(filePath).toString('base64'),
            mimeType
        }
    };
};

/* ==========================================================================
   1. CREATE PROJECT (IMAGE GENERATION)
   ========================================================================== */
export const createProject = async (req: Request, res: Response): Promise<any> => {
    const { userId } = getAuth(req);

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    let tempProjectId: string | undefined;
    let isCreditDeducted = false;

    const {
        name = 'New Project',
        aspectRatio,
        userPrompt,
        productName,
        productDescription,
        targetLength = 5
    } = req.body;

    const images = req.files as Express.Multer.File[] | undefined;

    if (!images || images.length < 2 || !productName) {
        return res.status(400).json({ message: 'Please Upload Atleast 2 Images and provide a Product Name' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || user.credits < 5) {
            return res.status(401).json({ message: 'Insufficient Credits' });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 5 } }
        });
        isCreditDeducted = true;

        const uploadedImages = await Promise.all(
            images.map(async (file) => {
                const result = await cloudinary.uploader.upload(file.path, {
                    resource_type: 'image'
                });
                return result.secure_url;
            })
        );

        const project = await prisma.project.create({
            data: {
                name,
                userId,
                productName,
                productDescription,
                userPrompt,
                aspectRatio,
                targetLength: parseInt(targetLength as string) || 5,
                uploadedImages,
                isGenerating: true
            }
        });

        tempProjectId = project.id;

        const personFile = images[1];
        const productFile = images[0];

        const formPayload = new FormData();

        formPayload.append('init_image', fs.readFileSync(personFile.path), {
            filename: personFile.originalname,
            contentType: personFile.mimetype
        });
        formPayload.append(
            'text_prompts[0][text]',
            `Person naturally holding and showcasing ${productName}. ${productDescription || ''}. ${userPrompt || ''}. Professional studio lighting, ecommerce quality, photorealistic.`
        );
        formPayload.append('text_prompts[0][weight]', '1');
        formPayload.append('text_prompts[1][text]', 'blurry, cartoon, painting, unrealistic, low quality');
        formPayload.append('text_prompts[1][weight]', '-1');
        formPayload.append('cfg_scale', '7');
        formPayload.append('samples', '1');
        formPayload.append('steps', '30');
        formPayload.append('image_strength', '0.40');

        const stabilityResponse = await axios.post(
            'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
            formPayload,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
                    'Accept': 'application/json',
                    ...formPayload.getHeaders()
                },
                timeout: 120000
            }
        );

        const stabilityData = stabilityResponse.data as any;

        if (!stabilityData?.artifacts?.[0]?.base64) {
            throw new Error('No image returned from Stability AI');
        }

        const base64Image = `data:image/png;base64,${stabilityData.artifacts[0].base64}`;
        const uploadResult = await cloudinary.uploader.upload(base64Image, { resource_type: 'image' });

        await prisma.project.update({
            where: { id: project.id },
            data: {
                generatedImage: uploadResult.secure_url,
                isGenerating: false
            }
        });

        return res.status(201).json({
            message: "Project creation completed successfully.",
            projectId: tempProjectId
        });

    } catch (error: any) {
        console.error('CREATE PROJECT ERROR:', error);

        if (tempProjectId) {
            await prisma.project.update({
                where: { id: tempProjectId },
                data: { isGenerating: false, error: error.message }
            }).catch((err: any) => Sentry.captureException(err));
        }

        if (isCreditDeducted) {
            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: 5 } }
            }).catch((err: any) => Sentry.captureException(err));
        }

        Sentry.captureException(error);
        return res.status(500).json({ message: error.message });
    }
};

/* ==========================================================================
   2. CREATE VIDEO (FAL.AI GENERATION)
   ========================================================================== */
export const createVideo = async (req: Request, res: Response): Promise<any> => {
    const { userId } = getAuth(req);

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { projectId } = req.body;
    let isCreditDeducted = false;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || user.credits < 10) {
            return res.status(401).json({ message: 'Insufficient Credits' });
        }

        const project = await prisma.project.findUnique({ where: { id: projectId, userId } });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.generatedVideo && project.generatedVideo.length > 0) {
            return res.status(400).json({ message: 'Video already generated' });
        }

        if (!project.generatedImage || project.generatedImage.length === 0) {
            return res.status(400).json({ message: 'No image found' });
        }

        await prisma.user.update({ where: { id: userId }, data: { credits: { decrement: 10 } } });
        isCreditDeducted = true;

        await prisma.project.update({ where: { id: projectId }, data: { isGenerating: true } });

        // Respond immediately
        res.status(200).json({ message: 'Video generation started! Please wait...' });

        // Process in background
        (async () => {
            try {
                const { fal } = await import('@fal-ai/client');
                fal.config({ credentials: process.env.FAL_API_KEY });

                const result: any = await fal.subscribe('fal-ai/stable-video', {
                    input: {
                        image_url: project.generatedImage,
                        motion_bucket_id: 127,
                        cond_aug: 0.02,
                        fps: 6,
                    },
                    logs: true,
                    onQueueUpdate: (update: any) => {
                        console.log('Fal.ai queue status:', update.status);
                    },
                });

                if (!result?.data?.video?.url) throw new Error('No video returned from Fal.ai');

                const videoUrl = result.data.video.url;
                const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
                const videoBuffer = Buffer.from(videoResponse.data);

                const fileName = `${userId}-${Date.now()}.mp4`;
                const videosDir = path.join(__dirname, '../../videos');
                const filePath = path.join(videosDir, fileName);

                fs.mkdirSync(videosDir, { recursive: true });
                fs.writeFileSync(filePath, videoBuffer);

                const uploadResult = await cloudinary.uploader.upload(filePath, { resource_type: 'video' });

                await prisma.project.update({
                    where: { id: project.id },
                    data: { generatedVideo: uploadResult.secure_url, isGenerating: false }
                });

                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

                console.log('✅ Video generated successfully:', uploadResult.secure_url);
            } catch (error: any) {
                console.error('Background video error:', error.message);
                await prisma.project.update({
                    where: { id: projectId },
                    data: { isGenerating: false, error: error.message }
                });
                if (isCreditDeducted) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: { credits: { increment: 10 } }
                    });
                }
            }
        })();

    } catch (error: any) {
        Sentry.captureException(error);
        return res.status(500).json({ message: error.message });
    }
};

/* ==========================================================================
   3. UTILITY METHODS (GET / DELETE)
   ========================================================================== */
export const getAllProjectProjects = async (req: Request, res: Response): Promise<any> => {
    try {
        const projects = await prisma.project.findMany({
            where: { isPublished: true }
        });
        return res.json({ projects });
    } catch (error: any) {
        Sentry.captureException(error);
        return res.status(500).json({ message: error.message });
    }
};

export const deleteProjects = async (req: Request, res: Response): Promise<any> => {
    const { userId } = getAuth(req);

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // ✅ FIX: Cast to string to avoid string | string[] error
    const projectId = req.params.projectId as string;

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId, userId }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project Not Found' });
        }

        await prisma.project.delete({
            where: { id: projectId }
        });

        return res.json({ message: "Project deleted successfully" });
    } catch (error: any) {
        Sentry.captureException(error);
        return res.status(500).json({ message: error.message });
    }
};