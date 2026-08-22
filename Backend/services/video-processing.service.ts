import fs from "fs";
import { supabaseAdmin } from "../config/supabase";
import { processVideo } from "./ffmpeg.service";
import { uploadFolder } from "./storage.service";

export const processVideoJob = async (
  videoId: string,
  inputFilePath: string
) => {
  let outputDir = "";

  try {
  

    // Update status to processing
    await supabaseAdmin
      .from("videos")
      .update({
        status: "processing",
      })
      .eq("id", videoId);

    // 1. Run FFmpeg
    const result = await processVideo(inputFilePath);

    const folderName = result.folderName;
    outputDir = result.outputDir;

    

    // 2. Upload HLS files
    const streamUrl = await uploadFolder(outputDir, folderName);


    // 3. Update videos table
    const { data: videoRow, error: videoError } =
      await supabaseAdmin
        .from("videos")
        .update({
          master_playlist: streamUrl,
          status: "ready",
        })
        .eq("id", videoId)
        .select()
        .single();

    if (videoError) {
      throw videoError;
    }

    // 4. Generate variant URLs
    const baseUrl = streamUrl.replace("/master.m3u8", "");

    const variants = [
      {
        video_id: videoId,
        resolution: "360p",
        playlist_url: `${baseUrl}/360p.m3u8`,
        bitrate: 800000,
      },
      {
        video_id: videoId,
        resolution: "480p",
        playlist_url: `${baseUrl}/480p.m3u8`,
        bitrate: 1400000,
      },
      {
        video_id: videoId,
        resolution: "720p",
        playlist_url: `${baseUrl}/720p.m3u8`,
        bitrate: 2800000,
      },
      {
        video_id: videoId,
        resolution: "1080p",
        playlist_url: `${baseUrl}/1080p.m3u8`,
        bitrate: 5000000,
      },
    ];

    // 5. Insert variants
    const { error: variantError } = await supabaseAdmin
      .from("video_variants")
      .insert(variants);

    if (variantError) {
      await supabaseAdmin
        .from("videos")
        .update({ master_playlist: null })
        .eq("id", videoId);

      throw variantError;
    }

    return videoRow;
  } catch (error) {
    console.error(`Processing failed for video ${videoId}:`, error);

    // Mark failed
    await supabaseAdmin
      .from("videos")
      .update({
        status: "failed",
      })
      .eq("id", videoId);

    throw error;
  } finally {
    if (outputDir && fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, {
        recursive: true,
        force: true,
      });
    }
  }
};