import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export const processVideo = (
  inputPath: string
): Promise<{
  folderName: string;
  outputDir: string;
}> => {
  return new Promise((resolve, reject) => {
    try {
      const folderName = `video_${Date.now()}`;
      const outputDir = path.join("output", folderName);

      fs.mkdirSync(outputDir, { recursive: true });

      const args = [
        "-hide_banner",
        "-y",
        "-i",
        inputPath,

        "-filter_complex",
        "[0:v]split=4[v1][v2][v3][v4];" +
        "[v1]scale=w=640:h=360:force_original_aspect_ratio=decrease[v360];" +
        "[v2]scale=w=842:h=480:force_original_aspect_ratio=decrease[v480];" +
        "[v3]scale=w=1280:h=720:force_original_aspect_ratio=decrease[v720];" +
        "[v4]scale=w=1920:h=1080:force_original_aspect_ratio=decrease[v1080]",

        // 360p 
        "-map",
        "[v360]",
        "-map",
        "0:a:0",

        "-c:v:0",
        "libx264",

        "-c:a:0",
        "aac",

        "-b:v:0",
        "800k",

        "-maxrate:v:0",
        "856k",

        "-bufsize:v:0",
        "1200k",

        "-b:a:0",
        "96k",

        // 480p 
        "-map",
        "[v480]",
        "-map",
        "0:a:0",

        "-c:v:1",
        "libx264",

        "-c:a:1",
        "aac",

        "-b:v:1",
        "1400k",

        "-maxrate:v:1",
        "1498k",

        "-bufsize:v:1",
        "2100k",

        "-b:a:1",
        "128k",

        // 720p 
        "-map",
        "[v720]",
        "-map",
        "0:a:0",

        "-c:v:2",
        "libx264",

        "-c:a:2",
        "aac",

        "-b:v:2",
        "2800k",

        "-maxrate:v:2",
        "2996k",

        "-bufsize:v:2",
        "4200k",

        "-b:a:2",
        "128k",

        // 1080p 
        "-map",
        "[v1080]",
        "-map",
        "0:a:0",

        "-c:v:3",
        "libx264",

        "-c:a:3",
        "aac",

        "-b:v:3",
        "5000k",

        "-maxrate:v:3",
        "5350k",

        "-bufsize:v:3",
        "7500k",

        "-b:a:3",
        "192k",


        "-preset",
        "veryfast",

        "-hls_time",
        "4",

        "-hls_playlist_type",
        "vod",


        "-master_pl_name",
        "master.m3u8",


        "-var_stream_map",
        "v:0,a:0 v:1,a:1 v:2,a:2 v:3,a:3",

        "-hls_segment_filename",
        `${outputDir}/%v_segment_%03d.ts`,

        `${outputDir}/%v.m3u8`,
      ];

     

      const ffmpeg = spawn("ffmpeg", args);

      ffmpeg.stderr.on("data", (data) => {
        console.log(data.toString());
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) {
      

          const names = ["360p", "480p", "720p", "1080p"];

          names.forEach((name, index) => {
            const oldPath = path.join(outputDir, `${index}.m3u8`);
            const newPath = path.join(outputDir, `${name}.m3u8`);

            if (fs.existsSync(oldPath)) {
              fs.renameSync(oldPath, newPath);
            }
          });

          // update master playlist references
          const masterPath = path.join(outputDir, "master.m3u8");

          let masterContent = fs.readFileSync(masterPath, "utf-8");

          masterContent = masterContent
            .replace("0.m3u8", "360p.m3u8")
            .replace("1.m3u8", "480p.m3u8")
            .replace("2.m3u8", "720p.m3u8")
            .replace("3.m3u8", "1080p.m3u8");

          fs.writeFileSync(masterPath, masterContent);

          resolve({
            folderName,
            outputDir,
          });
        } else {
          reject("Video processing failed");
        }
      });
    } catch (err) {
      console.error(err);
      reject("Something went wrong");
    }
  });
};