import { exec } from "child_process";
import path from "path";
import fs from "fs";

export const processVideo = (inputPath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            // Unique folder for each video
            const folderName = `video_${Date.now()}`;
            const outputDir = path.join("output", folderName);

            // Create output directory
            fs.mkdirSync(outputDir, { recursive: true });

            // FFmpeg command (HLS + multiple quality)
            const command = `
ffmpeg -i "${inputPath}" \
-preset fast \
-g 48 -sc_threshold 0 \
-map 0:v:0 -map 0:a:0 \
-map 0:v:0 -map 0:a:0 \
-b:v:0 800k -s:v:0 640x360 \
-b:v:1 1400k -s:v:1 1280x720 \
-c:v libx264 -c:a aac \
-f hls \
-hls_time 6 \
-hls_playlist_type vod \
-hls_segment_filename "${outputDir}/v%v/segment_%03d.ts" \
-master_pl_name master.m3u8 \
-var_stream_map "v:0,a:0 v:1,a:1" \
"${outputDir}/v%v/index.m3u8"
`;

            console.log("Running FFmpeg...");

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error("FFmpeg Error:", error);
                    return reject("Video processing failed");
                }

                console.log("FFmpeg Completed");
                resolve(folderName);
            });
        } catch (err) {
            console.error(err);
            reject("Something went wrong");
        }
    });
};