import { IQueueItem } from '../queue-item/interfaces/queue-item.interface';
import { EnqueueStatus } from '../enums/enqueue-status.enum';

export interface IQueue {
  enqueue(item: IQueueItem): Promise<EnqueueStatus>;
  dequeue(): Promise<IQueueItem | undefined>;
  peek(): Promise<IQueueItem | undefined>;
  remove(id: string): Promise<void>;
  update(id: string, changes: unknown): Promise<void>;
  getPending(): Promise<IQueueItem[]>;
  getNextRetryAt(): Promise<number | undefined>;
  clear(): Promise<void>;
  size(): Promise<number>;
  dequeueBatch(size: number): Promise<IQueueItem[]>;
  getTotalSize(): Promise<number>;
}
