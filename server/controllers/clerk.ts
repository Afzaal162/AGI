import 'dotenv/config'; 
import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { Webhook } from "svix";
import * as Sentry from '@sentry/node'

const verifyWebhook = async (req: Request): Promise<any> => {
    // ✅ Change this line to look for 'CLERK_WEBHOOK_SIGNING_SECRET'
    const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    if (!CLERK_WEBHOOK_SECRET) {
        throw new Error("Missing CLERK_WEBHOOK_SIGNING_SECRET in environment variables");
    }

    const svix_id = req.headers["svix-id"] as string;
    const svix_timestamp = req.headers["svix-timestamp"] as string;
    const svix_signature = req.headers["svix-signature"] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
        throw new Error("Missing svix headers");
    }

    const payload = req.body.toString('utf8'); 
    const wh = new Webhook(CLERK_WEBHOOK_SECRET);
    
    return wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
    });
};

const clerkWebHooks = async (req: Request, res: Response) => {
    console.log("🚀 Webhook received! Verifying raw payload..."); 

    try {
        const evt = await verifyWebhook(req);
        
        // ✅ FIX 2: Parse the event structure manually since express.raw() doesn't auto-parse JSON
        const parsedEvt = typeof evt === 'string' ? JSON.parse(evt) : evt;
        const { data, type } = parsedEvt;
        
        console.log(`Verified event type: ${type}`); 
        
        switch (type) {
            case "user.created": {
                console.log("Creating user in DB with ID:", data.id); 
                await prisma.user.create({
                    data: {
                        id: data.id,
                        email: data?.email_addresses?.[0]?.email_address || "",
                        name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
                        image: data?.image_url || "",
                    }
                });
                console.log("User successfully created in DB!"); 
                break;
            }
            
            case "user.updated": {
                console.log("Updating user in DB with ID:", data.id);
                await prisma.user.update({
                    where: { id: data.id },
                    data: {
                        email: data?.email_addresses?.[0]?.email_address,
                        name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
                        image: data?.image_url,
                    }
                });
                console.log("User successfully updated in DB!");
                break;
            }
            
            case "user.deleted": {
                console.log("Deleting user from DB with ID:", data.id);
                await prisma.user.delete({ where: { id: data.id } });
                console.log("User successfully deleted from DB!");
                break;
            }
            
            case "PaymentAttempt.updated": {
                console.log("Processing payment attempt...");
                if ((data.charge_type === "recurring" || data.charge_type === "checkout") && data.status === "paid") {
                    const credits = { pro: 80, premium: 240 };
                    const clerkUserId = data?.payer?.user_id;
                    const planId: keyof typeof credits = data?.subscription_items?.[0]?.plan?.slug;
                    
                    if (planId !== 'pro' && planId !== 'premium') {
                        return res.status(400).json({ message: 'Invalid Plan' });
                    }
                    
                    await prisma.user.update({
                        where: { id: clerkUserId },
                        data: {
                            credits: { 
                                increment: credits[planId] 
                            }
                        }
                    });
                    console.log(`Successfully added ${credits[planId]} credits to user ${clerkUserId}`);
                }
                break;
            }
            
            default:
                console.log(`Unhandled Webhook Event type: ${type}`);
                break;
        }
        
        return res.status(200).json({ message: "Webhook processed successfully", type });

    } catch (error: any) {
        Sentry.captureException(error)
        console.error("🔴 Webhook Processing Error:", error.message);
        return res.status(400).json({ message: error.message || "Webhook verification failed" });
    }
};

export default clerkWebHooks;