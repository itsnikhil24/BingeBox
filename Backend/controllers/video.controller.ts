import { Request, Response } from "express";
import { processVideo } from "../services/ffmpeg.service";

export const uploadVideo = async (req: Request, res: Response) => {
  try {
    // Multer adds file to req
    const file = req.file as any;

    // Validation
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No video file uploaded",
      });
    }

    // Call FFmpeg service
    const folderName = await processVideo(file.path);

    // Response
    return res.status(200).json({
      success: true,
      message: "Video uploaded & processed successfully",
      data: {
        folder: folderName,
        streamUrl: `http://localhost:3000/videos/${folderName}/master.m3u8`,
      },
    });
  } catch (error) {
    console.error("Upload Error:", error);

    return res.status(500).json({
      success: false,
      message: "Video processing failed",
    });
  }
};