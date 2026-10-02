import fs from "fs";
import { supabaseAdmin } from "../config/supabase";
import { processVideo } from "./ffmpeg.service";
import { uploadFolder } from "./storage.service";

// ffmpeg may issue range requests late in a long transcode (e.g. an mp4
// whose moov atom is at the end), so the URL must outlive the whole job.
const SOURCE_URL_TTL_SECONDS = 6 * 60 * 60;

export const processVideoJob = async (
  videoId: string,
  storagePath: string
) => {
  let outputDir = "";

  try {
    // --------------------------------------------------
    // 1. Get a signed URL for the original in Supabase
    //    (ffmpeg streams it directly — no local copy)
    // --------------------------------------------------

    const { data: signedData, error: signedError } =
      await supabaseAdmin.storage
        .from("videos")
        .createSignedUrl(storagePath, SOURCE_URL_TTL_SECONDS);

    if (signedError || !signedData) {
      throw (
        signedError ||
        new Error("Failed to create signed URL for source video")
      );
    }

    console.log("Streaming source video from storage:", storagePath);

    // --------------------------------------------------
    // 2. Update status
    // --------------------------------------------------

    await supabaseAdmin
      .from("videos")
      .update({
        status: "processing",
      })
      .eq("id", videoId);

    // --------------------------------------------------
    // 3. Run FFmpeg
    // --------------------------------------------------

    console.log("Starting FFmpeg...");

    const result = await processVideo(signedData.signedUrl);

    outputDir = result.outputDir;

    console.log(
      "FFmpeg processing completed:",
      outputDir
    );

    // --------------------------------------------------
    // 4. Upload HLS output to Supabase
    // --------------------------------------------------

    const streamUrl = await uploadFolder(
      outputDir,
      result.folderName
    );

    console.log(
      "HLS uploaded:",
      streamUrl
    );

    // --------------------------------------------------
    // 5. Update video record
    // --------------------------------------------------

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

    // --------------------------------------------------
    // 6. Create video variants
    // --------------------------------------------------

    const baseUrl = streamUrl.replace(
      "/master.m3u8",
      ""
    );

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

    const { error: variantError } =
      await supabaseAdmin
        .from("video_variants")
        .insert(variants);

    if (variantError) {
      throw variantError;
    }

    return videoRow;
  } catch (error) {
    console.error(
      `Processing failed for video ${videoId}:`,
      error
    );

    await supabaseAdmin
      .from("videos")
      .update({
        status: "failed",
      })
      .eq("id", videoId);

    throw error;
  } finally {
    // Delete temporary FFmpeg output
    if (
      outputDir &&
      fs.existsSync(outputDir)
    ) {
      fs.rmSync(outputDir, {
        recursive: true,
        force: true,
      });
    }
  }
};