/**
 * Job Queue Service using Bull
 * Handles background job processing
 */

import Queue, { Job, JobOptions } from 'bull';

export interface ExportJobData {
  designId: string;
  format: 'pdf' | 'png' | 'jpg' | 'svg';
  options: Record<string, any>;
  userId: string;
}

export interface ThumbnailJobData {
  objectId: string;
  designId: string;
  size: 'small' | 'medium' | 'large';
}

export interface RenderJobData {
  designId: string;
  outputFormat: string;
  quality: number;
}

export class QueueService {
  private exportQueue: Queue.Queue<ExportJobData>;
  private thumbnailQueue: Queue.Queue<ThumbnailJobData>;
  private renderQueue: Queue.Queue<RenderJobData>;

  constructor(redisUrl: string) {
    // Initialize queues
    this.exportQueue = new Queue('exports', redisUrl, {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: false,
      },
    });

    this.thumbnailQueue = new Queue('thumbnails', redisUrl, {
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 1000,
        },
        removeOnComplete: 50,
      },
    });

    this.renderQueue = new Queue('renders', redisUrl, {
      defaultJobOptions: {
        attempts: 2,
        timeout: 30000, // 30 seconds
      },
    });

    this.setupProcessors();
  }

  /**
   * Setup job processors
   */
  private setupProcessors(): void {
    // Export processor
    this.exportQueue.process(async (job: Job<ExportJobData>) => {
      console.log(`Processing export job ${job.id} for design ${job.data.designId}`);
      
      // Update progress
      await job.progress(10);

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      await job.progress(50);

      await new Promise(resolve => setTimeout(resolve, 2000));
      await job.progress(90);

      // Return result
      return {
        fileUrl: `https://cdn.example.com/exports/${job.data.designId}.${job.data.format}`,
        format: job.data.format,
        timestamp: Date.now(),
      };
    });

    // Thumbnail processor
    this.thumbnailQueue.process(async (job: Job<ThumbnailJobData>) => {
      console.log(`Processing thumbnail job ${job.id} for object ${job.data.objectId}`);
      
      // Simulate thumbnail generation
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        thumbnailUrl: `https://cdn.example.com/thumbnails/${job.data.objectId}_${job.data.size}.png`,
        size: job.data.size,
      };
    });

    // Render processor
    this.renderQueue.process(async (job: Job<RenderJobData>) => {
      console.log(`Processing render job ${job.id} for design ${job.data.designId}`);
      
      // Simulate rendering
      await new Promise(resolve => setTimeout(resolve, 3000));

      return {
        renderUrl: `https://cdn.example.com/renders/${job.data.designId}.${job.data.outputFormat}`,
        quality: job.data.quality,
      };
    });
  }

  /**
   * Add export job
   */
  async addExportJob(data: ExportJobData, options?: JobOptions): Promise<Job<ExportJobData>> {
    const job = await this.exportQueue.add(data, {
      priority: 1,
      ...options,
    });

    console.log(`Added export job ${job.id}`);
    return job;
  }

  /**
   * Add thumbnail generation job
   */
  async addThumbnailJob(data: ThumbnailJobData, options?: JobOptions): Promise<Job<ThumbnailJobData>> {
    const job = await this.thumbnailQueue.add(data, {
      priority: 2,
      ...options,
    });

    return job;
  }

  /**
   * Add render job
   */
  async addRenderJob(data: RenderJobData, options?: JobOptions): Promise<Job<RenderJobData>> {
    const job = await this.renderQueue.add(data, options);
    return job;
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string, queueType: 'export' | 'thumbnail' | 'render'): Promise<any> {
    let queue: Queue.Queue;
    
    switch (queueType) {
      case 'export':
        queue = this.exportQueue;
        break;
      case 'thumbnail':
        queue = this.thumbnailQueue;
        break;
      case 'render':
        queue = this.renderQueue;
        break;
    }

    const job = await queue.getJob(jobId);
    
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress();
    const result = job.returnvalue;

    return {
      id: job.id,
      state,
      progress,
      result,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId: string, queueType: 'export' | 'thumbnail' | 'render'): Promise<void> {
    let queue: Queue.Queue;
    
    switch (queueType) {
      case 'export':
        queue = this.exportQueue;
        break;
      case 'thumbnail':
        queue = this.thumbnailQueue;
        break;
      case 'render':
        queue = this.renderQueue;
        break;
    }

    const job = await queue.getJob(jobId);
    
    if (job) {
      await job.remove();
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueType: 'export' | 'thumbnail' | 'render'): Promise<any> {
    let queue: Queue.Queue;
    
    switch (queueType) {
      case 'export':
        queue = this.exportQueue;
        break;
      case 'thumbnail':
        queue = this.thumbnailQueue;
        break;
      case 'render':
        queue = this.renderQueue;
        break;
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * Clean old jobs
   */
  async cleanQueue(queueType: 'export' | 'thumbnail' | 'render', grace: number = 3600000): Promise<void> {
    let queue: Queue.Queue;
    
    switch (queueType) {
      case 'export':
        queue = this.exportQueue;
        break;
      case 'thumbnail':
        queue = this.thumbnailQueue;
        break;
      case 'render':
        queue = this.renderQueue;
        break;
    }

    await queue.clean(grace, 'completed');
    await queue.clean(grace, 'failed');
  }

  /**
   * Close all queues
   */
  async close(): Promise<void> {
    await Promise.all([
      this.exportQueue.close(),
      this.thumbnailQueue.close(),
      this.renderQueue.close(),
    ]);
  }
}

