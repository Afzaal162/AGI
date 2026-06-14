import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import * as Sentry from '@sentry/node'
import { prisma } from "../config/prisma";

export const getUserCredits = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId } = getAuth(req);

        console.log("👉 CONTROLLER RUNNING - Clerk User ID found:", userId);

        if (!userId) {
            return res.status(401).json({ message: "This is unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        console.log("👉 DATABASE LOOKUP RESULT:", user);

        if (!user) {
            return res.status(404).json({ message: "User account not found" });
        }

        return res.json({ success: true, credits: user.credits });

    } catch (error: any) {
        Sentry.captureException(error);
        console.error("Get User Credits Error:", error);
        return res.status(500).json({ message: error.code || error.message });
    }
};

export const getAllProject = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const projects = await prisma.project.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return res.json({ projects });
    } catch (error: any) {
        Sentry.captureException(error);
        return res.status(500).json({ message: error.code || error.message });
    }
}

export const getProjectById = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId } = getAuth(req);
        const projectid = req.params.projectid as string;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectid, userId },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project Not Found' });
        }

        return res.json({ project });
    } catch (error: any) {
        Sentry.captureException(error);
        return res.status(500).json({ message: error.code || error.message });
    }
}

export const toggleProjectPublic = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId } = getAuth(req);
        const projectid = req.params.projectid as string;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectid, userId },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project Not Found' });
        }

        if (!project?.generatedImage && !project?.generatedVideo) {
            return res.status(400).json({ message: 'Image or Video Not Found' });
        }

        await prisma.project.update({
            where: { id: projectid },
            data: { isPublished: !project.isPublished }
        });

        return res.json({ isPublished: !project.isPublished });
    } catch (error: any) {
        Sentry.captureException(error);
        return res.status(500).json({ message: error.code || error.message });
    }
}