import { IQueueItem } from '../queue-item/interfaces/queue-item.interface';

export interface IQueue {
  enqueue(item: IQueueItem): Promise<void>;
  dequeue(): Promise<IQueueItem | undefined>;
  peek(): Promise<IQueueItem | undefined>;
  remove(id: string): Promise<void>;
  update(id: string, changes: unknown): Promise<void>;
  getPending(): Promise<IQueueItem[]>;
  getNextRetryAt(): Promise<number | undefined>;
  clear(): Promise<void>;
  size(): Promise<number>;
  dequeueBatch(size: number): Promise<IQueueItem[]>;
}
