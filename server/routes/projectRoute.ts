import express from "express";
import { createProject, createVideo, deleteProjects } from "../controllers/projectController";
import { protect } from "../middleware/auth";
import { getAllProject } from "../controllers/userController";
import upload from "../config/multer";
const projectRoute = express.Router();
projectRoute.post('/create', upload.array('images', 2), protect, createProject)
projectRoute.post('/video',protect, createVideo)
projectRoute.get('/published',protect, getAllProject)
projectRoute.delete('/:projectId',protect, deleteProjects)
export default projectRoute;