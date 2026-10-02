import express from "express";
import multer from "multer";
import {
  uploadVideo,
  getAllVideos,
  getVideoById,
} from "../controllers/video.controller";
import { authenticateUser } from "../middleware/auth.middleware";

const router = express.Router();

// Multer keeps the upload in memory (req.file.buffer); the controller
// streams it straight to Supabase Storage — nothing is written to local disk.
const upload = multer({
  storage: multer.memoryStorage(),
});

// Upload route
router.post("/upload", authenticateUser, upload.single("video"), uploadVideo);
router.get("/", getAllVideos);

// Single video route — must come after "/" since both are GET
router.get("/:id", getVideoById);

export default router;