import express from "express";
import multer from "multer";
import { uploadVideo } from "../controllers/video.controller";

const router = express.Router();

// Multer configuration (stores uploaded files in /uploads)
const upload = multer({
  dest: "uploads/",
});

// Upload route
router.post("/upload", upload.single("video"), uploadVideo);

export default router;