import fs from "fs";
import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { processVideoJob } from "../services/video-processing.service";
import type { VideoProcessingJob } from "../queues/video.queue";

const worker = new Worker<VideoProcessingJob>(
  "video-processing",
  async (job) => {
    const { videoId, inputPath } = job.data;

    try {
      await processVideoJob(videoId, inputPath);
    } catch (err) {
      const maxAttempts = job.opts.attempts ?? 1;
      const isLastAttempt = job.attemptsMade + 1 >= maxAttempts;

      // Delete the source file only when there are no retries left.
      if (isLastAttempt && inputPath && fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
      }

      // Re-throw so BullMQ records the failure and handles retries.
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1,
  }
);

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

worker.on("error", (error) => {
  console.error("Worker error:", error);
});

const shutdown = async () => {
  await worker.close();
  await redisConnection.quit();

  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);