import { IQueueItem } from '../queue-item';
import { IQueueItemUpdate } from '../queue-item/interfaces/queue-item-update.interface';

export interface IQueue {
  enqueue(item: IQueueItem): Promise<void>;
  dequeue(): Promise<IQueueItem | undefined>;
  peek(): Promise<IQueueItem | undefined>;
  remove(id: string): Promise<void>;
  update(id: string, changes: IQueueItemUpdate): Promise<void>;
  getPending(): Promise<IQueueItem[]>;
  clear(): Promise<void>;
  size(): Promise<number>;
}
