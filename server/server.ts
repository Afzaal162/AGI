import "dotenv/config";
import './config/instrument.mjs' // Sentry instrumentation must always stay at the absolute top
import express, { Request, Response } from 'express';
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import clerkWebHooks from "./controllers/clerk";
import * as Sentry from '@sentry/node'
import userRouter from "./routes/userRoute";
import projectRoute from "./routes/projectRoute";

const app = express();

// 1. Global CORS Setup
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Clerk Webhooks Endpoint (Bypasses express.json and clerkMiddleware entirely)
app.post('/api/clerk', express.raw({ type: 'application/json' }), clerkWebHooks);

// 3. Global Body Parsers 
app.use(express.json());

// 4. Global Auth Hydration Middleware
app.use(clerkMiddleware());

// 5. Base & Debug Routes
app.get('/', (req: Request, res: Response) => res.send('Server is Live!'));
app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
});

// 6. Application Routes (Now fully protected and hydrated)
app.use('/api/user', userRouter);
app.use('/api/projects', projectRoute);

// 7. Sentry Error Handler (Must stay below all routes)
Sentry.setupExpressErrorHandler(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running beautifully at http://localhost:${PORT}`);
});