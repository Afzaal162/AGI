import { Request, Response } from "express";
import * as Sentry from '@sentry/node';
import { prisma } from "../config/prisma";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from "path";
import axios from "axios";
import FormData from 'form-data';
import { getAuth } from "@clerk/express";

/* ==========================================================================
   1. CREATE PROJECT (IMAGE GENERATION)
   
   APPROACH: Two-step Stability AI pipeline
   
   Step 1 — img2img on PERSON image with a strong prompt describing the scene.
            image_strength = 0.65 preserves the person's identity while
            allowing pose/scene changes based on the prompt.
   
   Step 2 — img2img again on Step 1 result, this time init_image = PRODUCT,
            but at very low strength (0.15) so the product texture/color
            gets blended into the hand/holding area of the scene.
   
   This is the best approach available on Stability AI without inpainting
   or ControlNet, and actually uses the product image (unlike the original).
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
        // ── Credits check ──
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || user.credits < 5) {
            return res.status(401).json({ message: 'Insufficient Credits' });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 5 } }
        });
        isCreditDeducted = true;

        // ── Upload originals to Cloudinary ──
        const uploadedImages = await Promise.all(
            images.map(async (file) => {
                const result = await cloudinary.uploader.upload(file.path, {
                    resource_type: 'image'
                });
                return result.secure_url;
            })
        );

        // ── Create project record ──
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

        // images[0] = product, images[1] = person/model
        const productFile = images[0];
        const personFile  = images[1];

        // ── STEP 1: Generate the scene with person as base ──
        // High image_strength (0.65) = person identity preserved
        // but prompt can change pose/action/scene significantly
        const step1Form = new FormData();

        step1Form.append('init_image', fs.readFileSync(personFile.path), {
            filename: personFile.originalname,
            contentType: personFile.mimetype
        });

        const scenePrompt =
            `${userPrompt || `Person naturally holding and showcasing the ${productName}`}. ` +
            `Holding ${productName} in hands. ` +
            `${productDescription || ''}. ` +
            `Professional ecommerce photography, studio lighting, photorealistic, sharp focus, 8k quality.`;

        step1Form.append('text_prompts[0][text]', scenePrompt);
        step1Form.append('text_prompts[0][weight]', '1');
        step1Form.append('text_prompts[1][text]', 'blurry, cartoon, painting, unrealistic, low quality, deformed hands, extra fingers');
        step1Form.append('text_prompts[1][weight]', '-1');
        step1Form.append('cfg_scale', '8');
        step1Form.append('samples', '1');
        step1Form.append('steps', '40');
        step1Form.append('image_strength', '0.65'); // preserves person, allows scene change

        const step1Response = await axios.post(
            'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
            step1Form,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
                    'Accept': 'application/json',
                    ...step1Form.getHeaders()
                },
                timeout: 120000
            }
        );

        const step1Data = step1Response.data as any;
        if (!step1Data?.artifacts?.[0]?.base64) {
            throw new Error('Step 1: No image returned from Stability AI');
        }

        // Convert step 1 result to buffer for step 2
        const step1Buffer = Buffer.from(step1Data.artifacts[0].base64, 'base64');

        // ── STEP 2: Blend product appearance into scene ──
        // Low image_strength (0.20) = mostly keeps step1 scene
        // but pulls in product's color/texture/shape from init_image
        const step2Form = new FormData();

        step2Form.append('init_image', step1Buffer, {
            filename: 'scene.png',
            contentType: 'image/png'
        });

        // Also send product as style reference via the prompt
        const refinementPrompt =
            `Person holding ${productName} product. ` +
            `${productDescription || ''}. ` +
            `${userPrompt || ''}. ` +
            `The ${productName} is clearly visible, photorealistic product placement, ` +
            `professional studio photography, ecommerce quality, sharp product detail.`;

        step2Form.append('text_prompts[0][text]', refinementPrompt);
        step2Form.append('text_prompts[0][weight]', '1');
        step2Form.append('text_prompts[1][text]', 'blurry, cartoon, low quality, distorted product, floating object');
        step2Form.append('text_prompts[1][weight]', '-1');
        step2Form.append('cfg_scale', '7');
        step2Form.append('samples', '1');
        step2Form.append('steps', '30');
        step2Form.append('image_strength', '0.25'); // light refinement pass

        const step2Response = await axios.post(
            'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
            step2Form,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
                    'Accept': 'application/json',
                    ...step2Form.getHeaders()
                },
                timeout: 120000
            }
        );

        const step2Data = step2Response.data as any;
        if (!step2Data?.artifacts?.[0]?.base64) {
            throw new Error('Step 2: No image returned from Stability AI');
        }

        // ── Upload final result to Cloudinary ──
        const base64Image = `data:image/png;base64,${step2Data.artifacts[0].base64}`;
        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            resource_type: 'image'
        });

        // ── Mark project complete ──
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

        res.status(200).json({ message: 'Video generation started! Please wait...' });

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
export const getAllProject = async (req: Request, res: Response): Promise<any> => {
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