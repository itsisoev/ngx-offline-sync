import { IQueueItem } from '../queue-item';

export interface IQueue {
  enqueue(item: IQueueItem): Promise<void>;
  dequeue(): Promise<IQueueItem | undefined>;
  peek(): Promise<IQueueItem | undefined>;
  remove(id: string): Promise<void>;
  getPending(): Promise<IQueueItem[]>;
  clear(): Promise<void>;
  size(): Promise<number>;
}
