import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import * as Sentry from '@sentry/node'
import { prisma } from "../config/prisma";
export const getUserCredits = async (req: Request, res: Response) => {
    try {
        // 👈 2. FIXED: Use Clerk's official helper instead of (req as any).auth
        const { userId } = getAuth(req);

        console.log("👉 CONTROLLER RUNNING - Clerk User ID found:", userId);

        if (!userId) {
            return res.status(401).json({ message: "This is unauthorized" });
        }

        // Fetch user matching Clerk's userId from database
        const user = await prisma.user.findUnique({
            where: { id: userId } 
        });

        console.log("👉 DATABASE LOOKUP RESULT:", user);

        if (!user) {
            return res.status(404).json({ message: "User account not found" });
        }

        // Return the actual credits
        return res.json({ success: true, credits: user.credits });

    } catch (error: any) {
        Sentry.captureException(error);
        console.error("Get User Credits Error:", error);
        return res.status(500).json({ message: error.code || error.message });
    }
};
export const getAllProject = async (req: Request, res: Response) => {
    try {
const {userId} = req.auth();
const projects = await prisma.project.findMany({
    where:{userId},
    orderBy:{createdAt:'desc'}
})
res.json({projects})
    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).res.json({ message: error.code || error.message })
    }
}
export const getProjectById = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId } = req.auth();
        const { projectid } = req.params;
        
        const project = await prisma.project.findUnique({
            where: { id: projectid, userId },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project Not Found' }); // ✅ added return
        }

        return res.json({ project }); // ✅ changed 'projects' to 'project'
    } catch (error: any) {
        Sentry.captureException(error);
        return res.status(500).json({ message: error.code || error.message }); // ✅ fixed res.status(500).res.json
    }
}
export const toggleProjectPublic = async (req: Request, res: Response) => {
    try {
const {userId} = req.auth();
const {projectid} = req.params;
const projects = await prisma.project.findUnique({
    where:{id:projectid,userId},
})
if(!projects){
    res.status(404).json({message: 'Projects Not Found'})
}
if(!projects?.generatedImage && !projects?.generatedVideo){
    return res.status(404).json({message:'Image or Video Not Found'})
}
await prisma.project.update({
    where:{id:projectid},
    data:{isPublished:!projects.isPublished}
})
res.json({isPublished: !projects.isPublished})
    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).res.json({ message: error.code || error.message })
    }
}