import { Queue, Worker, Processor } from 'bullmq';
import { redis } from './redis';

const queues = new Map<string, Queue>();

export function getQueue(queueName: string): Queue | null {
  if (!redis) {
    return null;
  }

  if (!queues.has(queueName)) {
    try {
      const q = new Queue(queueName, {
        connection: redis,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1500,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      });
      queues.set(queueName, q);
    } catch {
      return null;
    }
  }

  return queues.get(queueName) || null;
}

export const NOTIFICATIONS_HIGH_QUEUE = 'notifications-high';

/**
 * Enqueue a job into BullMQ, or execute fallback immediately if Redis is unreachable.
 */
export async function enqueueJob<T>(
  queueName: string,
  jobName: string,
  data: T,
  fallbackExecutor?: (data: T) => Promise<void>
): Promise<boolean> {
  const q = getQueue(queueName);
  if (q) {
    try {
      await q.add(jobName, data);
      return true;
    } catch {
      // Redis connection failed on add, run fallback
    }
  }

  if (fallbackExecutor) {
    try {
      await fallbackExecutor(data);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
