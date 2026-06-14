import express from "express";
import { getAllProject, getProjectById, getUserCredits, toggleProjectPublic } 
from "../controllers/userController";
import { protect } from "../middleware/auth";


const userRouter = express.Router();
userRouter.get('/credits', protect, getUserCredits)
userRouter.get('/projects', protect, getAllProject)
userRouter.get('/projects/:projectid', protect, getProjectById)
userRouter.get('/publish/:projectid', protect, toggleProjectPublic)

export default userRouter;



