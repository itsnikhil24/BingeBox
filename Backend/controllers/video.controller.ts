import { Request, Response } from "express";
import fs from "fs";
import { supabaseAdmin } from "../config/supabase.js";
import { processVideo } from "../services/ffmpeg.service";
import { uploadFolder } from "../services/storage.service";

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

    // Process video using FFmpeg
    const result = await processVideo(file.path);

    const folderName = result.folderName;
    outputDir = result.outputDir;

    // Upload HLS folder to Supabase Storage
const streamUrl = await uploadFolder(outputDir, folderName);



// Insert into videos table
const { data: videoRow, error: dbError } = await supabaseAdmin
  .from("videos")
  .insert([
    {
      user_id: userId,
      title,
      description,
      thumbnail_url: null,
      master_playlist: streamUrl,
      duration: null,
      status: "ready",
      visibility: "public",
    },
  ])
  .select()
  .single();

console.log("Video Insert Error:", dbError);

if (dbError) {
  throw dbError;
}

// Base URL
const baseUrl = streamUrl.replace("/master.m3u8", "");

// Insert variants
const { error: variantError } = await supabaseAdmin
  .from("video_variants")
  .insert([
    {
      video_id: videoRow.id,
      resolution: "360p",
      playlist_url: `${baseUrl}/360p.m3u8`,
      bitrate: 800000,
    },
    {
      video_id: videoRow.id,
      resolution: "480p",
      playlist_url: `${baseUrl}/480p.m3u8`,
      bitrate: 1400000,
    },
    {
      video_id: videoRow.id,
      resolution: "720p",
      playlist_url: `${baseUrl}/720p.m3u8`,
      bitrate: 2800000,
    },
    {
      video_id: videoRow.id,
      resolution: "1080p",
      playlist_url: `${baseUrl}/1080p.m3u8`,
      bitrate: 5000000,
    },
  ]);

console.log("Variant Insert Error:", variantError);

if (variantError) {
  throw variantError;
}



    // Cleanup temporary files
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
        variants: [
          {
            resolution: "360p",
            playlist: `${baseUrl}/360p.m3u8`,
          },
          {
            resolution: "480p",
            playlist: `${baseUrl}/480p.m3u8`,
          },
          {
            resolution: "720p",
            playlist: `${baseUrl}/720p.m3u8`,
          },
          {
            resolution: "1080p",
            playlist: `${baseUrl}/1080p.m3u8`,
          },
        ],
        streamUrl,
      },
    });
  } catch (error) {
    console.error("Upload Error:", error);

    if (inputFilePath && fs.existsSync(inputFilePath)) {
      fs.unlinkSync(inputFilePath);
    }

    if (outputDir && fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, {
        recursive: true,
        force: true,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Video processing failed",
      error: error instanceof Error ? error.message : error,
    });
  }
};