import express from "express";
import multer from "multer";
import {
  uploadVideo,
  getAllVideos,
  getVideoById,
} from "../controllers/video.controller";
import { authenticateUser } from "../middleware/auth.middleware";

const router = express.Router();

// Multer configuration (stores uploaded files in /uploads)
const upload = multer({
  dest: "uploads/",
});

// Upload route
router.post("/upload", authenticateUser, upload.single("video"), uploadVideo);
router.get("/", getAllVideos);

// Single video route — must come after "/" since both are GET
router.get("/:id", getVideoById);

export default router;