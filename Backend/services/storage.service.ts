import fs from "fs";
import path from "path";
import { supabaseAdmin } from "../config/supabase";

export const uploadFolder = async (folderPath: string, folderName: string) => {
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const fullPath = path.join(folderPath, file);

    if (!fs.statSync(fullPath).isFile()) continue;

    const fileBuffer = fs.readFileSync(fullPath);
    const storagePath = `${folderName}/${file}`;

    const { error } = await supabaseAdmin.storage.from("videos").upload(storagePath, fileBuffer, {
      contentType: getContentType(file),
      upsert: true,
    });

    if (error) throw error;
  }

  const { data } = supabaseAdmin.storage
    .from("videos")
    .getPublicUrl(`${folderName}/master.m3u8`);

  return data.publicUrl;
};

function getContentType(file: string) {
  if (file.endsWith(".m3u8")) return "application/vnd.apple.mpegurl";
  if (file.endsWith(".ts")) return "video/mp2t";
  if (file.endsWith(".jpg")) return "image/jpeg";
  return "application/octet-stream";
}