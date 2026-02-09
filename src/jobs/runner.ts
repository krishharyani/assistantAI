// Pluggable job runner interface
// Swap the implementation to use cron, BullMQ, Inngest, Trigger.dev, etc.

export interface Job {
  name: string;
  /** Run the job. Return a summary string for logging. */
  execute(): Promise<string>;
}

export interface JobRunner {
  /** Register a job to run on a schedule */
  schedule(job: Job, intervalMs: number): void;
  /** Start all scheduled jobs */
  start(): void;
  /** Stop all scheduled jobs */
  stop(): void;
}

// Simple interval-based runner for development
export class IntervalJobRunner implements JobRunner {
  private timers: Map<string, ReturnType<typeof setInterval>> = new Map();
  private jobs: Map<string, { job: Job; intervalMs: number }> = new Map();

  schedule(job: Job, intervalMs: number): void {
    this.jobs.set(job.name, { job, intervalMs });
  }

  start(): void {
    for (const [name, { job, intervalMs }] of this.jobs) {
      const timer = setInterval(async () => {
        try {
          const result = await job.execute();
          console.log(`[Job:${name}] ${result}`);
        } catch (err) {
          console.error(`[Job:${name}] Failed:`, err);
        }
      }, intervalMs);
      this.timers.set(name, timer);
    }
  }

  stop(): void {
    for (const timer of this.timers.values()) {
      clearInterval(timer);
    }
    this.timers.clear();
  }
}
