import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { processVideoJob } from "../services/video-processing.service";
import type { VideoProcessingJob } from "../queues/video.queue";

const worker = new Worker<VideoProcessingJob>(
  "video-processing",

  async (job) => {
    const { videoId, storagePath } = job.data;

    console.log("Processing video job:", {
      jobId: job.id,
      videoId,
      storagePath,
    });

    await processVideoJob(videoId, storagePath);
  },

  {
    connection: redisConnection,
    concurrency: 1,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

worker.on("error", (error) => {
  console.error("Worker error:", error);
});

const shutdown = async () => {
  console.log("Shutting down worker...");

  await worker.close();
  await redisConnection.quit();

  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);