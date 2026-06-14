import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authObject = (req as any).auth();  // ✅ call it as a function
        console.log("AUTH OBJECT:", authObject);
        
        const userId = authObject?.userId;
        
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        next();
    } catch (error: any) {
        Sentry.captureException(error);
        res.status(401).json({ message: error.code || error.message });
    }
};