import { Queue, Worker, type QueueOptions, type WorkerOptions, type Job } from "bullmq";
import IORedis from "ioredis";
import { EnvConfig } from "../config/env.config";
import { BackgroundJobRepository } from "./background-job.repository";
import { Logger } from "../logger/core/logger";

export type JobType = string;
export type JobPayload = Record<string, unknown>;

export interface JobProcessor {
  process(job: Job<JobPayload>): Promise<void>;
}

export class QueueManager {
  private static instance: QueueManager;
  private readonly connection: IORedis | null;
  private readonly prefix: string;
  private readonly queues: Map<string, Queue>;
  private readonly workers: Map<string, Worker>;
  private readonly processors: Map<string, JobProcessor>;
  private readonly jobRepo: BackgroundJobRepository;
  private readonly logger: Logger;

  private constructor() {
    const env = EnvConfig.getInstance();
    this.prefix = env.QUEUE_PREFIX;
    this.queues = new Map();
    this.workers = new Map();
    this.processors = new Map();
    this.jobRepo = new BackgroundJobRepository();
    this.logger = new Logger("queue-manager");

    if (!env.REDIS_URL && !env.REDIS_HOST) {
      this.logger.warn("Redis not configured — queue manager running without Redis");
      this.connection = null;
      return;
    }

    let redisConnection: IORedis;
    if (env.REDIS_URL) {
      redisConnection = new IORedis(env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });
    } else {
      const redisOpts: Record<string, unknown> = {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        db: env.REDIS_DB,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      };
      if (env.REDIS_PASSWORD) {
        redisOpts.password = env.REDIS_PASSWORD;
      }
      redisConnection = new IORedis(redisOpts);
    }
    this.connection = redisConnection;
  }

  static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  getConnection(): IORedis | null {
    return this.connection;
  }

  isAvailable(): boolean {
    return this.connection !== null;
  }

  createQueue(name: string): Queue | null {
    if (!this.connection) {
      this.logger.warn("Redis unavailable — skipping queue creation", { queue: name });
      return null;
    }
    if (this.queues.has(name)) {
      return this.queues.get(name)!;
    }
    const queue = new Queue(name, {
      connection: this.connection,
      prefix: this.prefix,
      defaultJobOptions: {
        attempts: EnvConfig.getInstance().JOB_ATTEMPTS,
        backoff: { type: "exponential", delay: EnvConfig.getInstance().JOB_BACKOFF_DELAY },
        timeout: EnvConfig.getInstance().JOB_TIMEOUT,
        removeOnComplete: { age: 86400, count: 100 },
        removeOnFail: { age: 604800, count: 50 },
      },
    } as QueueOptions);
    this.queues.set(name, queue);
    this.logger.info("Queue created", { queue: name });
    return queue;
  }

  getQueue(name: string): Queue | undefined {
    return this.queues.get(name);
  }

  registerProcessor(queueName: string, processor: JobProcessor): void {
    this.processors.set(queueName, processor);
  }

  createWorker(queueName: string): Worker | null {
    if (!this.connection) {
      this.logger.warn("Redis unavailable — skipping worker creation", { queue: queueName });
      return null;
    }
    const processor = this.processors.get(queueName);
    if (!processor) {
      throw new Error(`No processor registered for queue: ${queueName}`);
    }

    const worker = new Worker(
      queueName,
      async (job: Job<JobPayload>) => {
        await this.jobRepo.createOrUpdate({
          jobId: job.id!,
          queue: queueName,
          type: job.name,
          status: "PROCESSING",
          payload: job.data,
        });

        this.logger.info("Job started", { jobId: job.id, queue: queueName, type: job.name });

        try {
          await processor.process(job);

          await this.jobRepo.createOrUpdate({
            jobId: job.id!,
            queue: queueName,
            type: job.name,
            status: "COMPLETED",
            payload: job.data,
          });

          this.logger.info("Job completed", { jobId: job.id, queue: queueName, type: job.name });
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);

          await this.jobRepo.createOrUpdate({
            jobId: job.id!,
            queue: queueName,
            type: job.name,
            status: "FAILED",
            error: errMsg,
            payload: job.data,
          });

          this.logger.error("Job failed", { jobId: job.id, queue: queueName, type: job.name, error: errMsg });
          throw error;
        }
      },
      {
        connection: this.connection,
        prefix: this.prefix,
        concurrency: 5,
      } as WorkerOptions,
    );

    worker.on("failed", (job, err) => {
      this.logger.error("Worker job failed", { jobId: job?.id, error: err.message });
    });

    this.workers.set(queueName, worker);
    this.logger.info("Worker created", { queue: queueName });
    return worker;
  }

  async addJob(queueName: string, type: JobType, payload: JobPayload, opts?: Record<string, unknown>): Promise<string | undefined> {
    if (!this.connection) {
      this.logger.warn("Redis unavailable — job not queued", { queue: queueName, type });
      return undefined;
    }
    const queue = this.getQueue(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }
    const job = await queue.add(type, payload, {
      jobId: opts?.jobId as string | undefined,
      delay: opts?.delay as number | undefined,
      priority: opts?.priority as number | undefined,
    });
    this.logger.info("Job added", { jobId: job.id, queue: queueName, type });
    return job.id;
  }

  async addRepeatableJob(
    queueName: string,
    type: JobType,
    payload: JobPayload,
    pattern: string,
    opts?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.connection) {
      this.logger.warn("Redis unavailable — repeatable job not scheduled", { queue: queueName, type });
      return;
    }
    const queue = this.getQueue(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }
    await queue.add(type, payload, {
      repeat: { pattern },
      jobId: opts?.jobId as string | undefined,
    });
    this.logger.info("Repeatable job scheduled", { queue: queueName, type, pattern });
  }

  async getFailedJobs(queueName: string, start = 0, end = 20): Promise<Job<JobPayload>[]> {
    const queue = this.getQueue(queueName);
    if (!queue) return [];
    return queue.getJobs("failed", start, end) as Promise<Job<JobPayload>[]>;
  }

  async getCompletedJobs(queueName: string, start = 0, end = 20): Promise<Job<JobPayload>[]> {
    const queue = this.getQueue(queueName);
    if (!queue) return [];
    return queue.getJobs("completed", start, end) as Promise<Job<JobPayload>[]>;
  }

  async getWaitingJobs(queueName: string, start = 0, end = 20): Promise<Job<JobPayload>[]> {
    const queue = this.getQueue(queueName);
    if (!queue) return [];
    return queue.getJobs("waiting", start, end) as Promise<Job<JobPayload>[]>;
  }

  async getJobCounts(queueName: string): Promise<Record<string, number>> {
    const queue = this.getQueue(queueName);
    if (!queue) return {};
    return queue.getJobCounts();
  }

  async close(): Promise<void> {
    if (!this.connection) {
      this.logger.info("Queue manager closed (no Redis)");
      return;
    }
    for (const worker of this.workers.values()) {
      await worker.close();
    }
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    await this.connection.quit();
    this.logger.info("Queue manager closed");
  }
}
