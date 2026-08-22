import { Request, Response } from "express";
import fs from "fs";
import { supabaseAdmin } from "../config/supabase";
import { videoQueue } from "../queues/video.queue";

export const uploadVideo = async (req: Request, res: Response) => {
  let filePath = "";

  try {
    const file = req.file as Express.Multer.File | undefined;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No video file uploaded",
      });
    }

    filePath = file.path;

    const userId = req.user?.id;

    if (!userId) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const title = req.body.title || "Untitled Video";
    const description = req.body.description || null;

    const { data: videoRow, error: dbError } =
      await supabaseAdmin
        .from("videos")
        .insert({
          user_id: userId,
          title,
          description,
          thumbnail_url: null,
          master_playlist: null,
          duration: null,
          status: "processing",
          visibility: "public",
        })
        .select()
        .single();

    if (dbError) {
      console.error("DATABASE ERROR:", dbError);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.status(500).json({
        success: false,
        message: "Failed to create video record",
        error: dbError.message,
      });
    }

    try {
      await videoQueue.add(
        "transcode",
        {
          videoId: videoRow.id,
          inputPath: filePath,
        },
        {
          jobId: videoRow.id,
        }
      );
    } catch (queueError) {
      console.error("QUEUE ERROR:", queueError);

      await supabaseAdmin
        .from("videos")
        .update({
          status: "failed",
        })
        .eq("id", videoRow.id);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.status(500).json({
        success: false,
        message: "Failed to add video processing job",
        error:
          queueError instanceof Error
            ? queueError.message
            : String(queueError),
      });
    }

    return res.status(202).json({
      success: true,
      message: "Video uploaded successfully and is being processed",
      video: videoRow,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(500).json({
      success: false,
      message: "Failed to queue video processing",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};

export const getAllVideos = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("videos")
      .select(`
        id,
        title,
        description,
        thumbnail_url,
        master_playlist,
        duration,
        visibility,
        status,
        created_at,
        profiles!videos_user_id_fkey(
          id,
          username,
          full_name
        )
      `)
      .eq("status", "ready")
      .eq("visibility", "public")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      videos: data,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch videos",
    });
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("videos")
      .select(`
        id,
        title,
        description,
        thumbnail_url,
        master_playlist,
        duration,
        visibility,
        status,
        created_at,
        profiles!videos_user_id_fkey(
          id,
          username,
          full_name
        ),
        video_variants(
          resolution,
          playlist_url,
          bitrate
        )
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    return res.status(200).json({
      success: true,
      video: data,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch video",
    });
  }
};