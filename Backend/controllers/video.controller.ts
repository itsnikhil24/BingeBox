import { Request, Response } from "express";
import fs from "fs";
import { processVideo } from "../services/ffmpeg.service";
import { uploadFolder } from "../services/storage.service";
import { supabase } from "../config/supabase.js";

export const uploadVideo = async (req: Request, res: Response) => {
  let outputDir = "";
  let inputFilePath = "";

  try {
    const file = req.file as Express.Multer.File | undefined;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No video file uploaded",
      });
    }

    inputFilePath = file.path;

    const title = req.body.title || "Untitled Video";
    const description = req.body.description || null;

    
    const userId = req.body.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // 1) Process video with FFmpeg
    const result = await processVideo(file.path);
    const folderName = result.folderName;
    outputDir = result.outputDir;

    // 2) Upload generated HLS files to Supabase Storage
    const streamUrl = await uploadFolder(outputDir, folderName);

    // 3) Save video metadata in Supabase database
    const { data: videoRow, error: dbError } = await supabase
      .from("videos")
      .insert([
        {
          user_id: userId,
          title,
          description,
          thumbnail_url: null,
          master_playlist: `${folderName}/master.m3u8`,
          duration: null,
          status: "ready",
          visibility: "public",
        },
      ])
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    // 4) Clean up local files
    if (fs.existsSync(inputFilePath)) {
      fs.unlinkSync(inputFilePath);
    }

    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }

    return res.status(200).json({
      success: true,
      message: "Video uploaded & processed successfully",
      data: {
        video: videoRow,
        folder: folderName,
        streamUrl,
      },
    });
  } catch (error) {
    console.error("Upload Error:", error);

    if (inputFilePath && fs.existsSync(inputFilePath)) {
      fs.unlinkSync(inputFilePath);
    }

    if (outputDir && fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }

    return res.status(500).json({
      success: false,
      message: "Video processing failed",
    });
  }
};