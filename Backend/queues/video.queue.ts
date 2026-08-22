import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export interface VideoProcessingJob {
    videoId: string;
    inputPath: string;
}

export const videoQueue = new Queue<VideoProcessingJob>("video-processing", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
    },
});