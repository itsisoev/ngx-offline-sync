import { Service } from '@angular/core';
import {IQueue} from '../interfaces';
import {IQueueItem} from '../queue-item';

@Service()
export class QueueService implements IQueue {
  async enqueue(item: IQueueItem): Promise<void> {
    throw new Error('Not implemented');
  }

  async dequeue(): Promise<IQueueItem | undefined> {
    throw new Error('Not implemented');
  }

  async peek(): Promise<IQueueItem | undefined> {
    throw new Error('Not implemented');
  }

  async remove(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async getPending(): Promise<IQueueItem[]> {
    throw new Error('Not implemented');
  }

  async clear(): Promise<void> {
    throw new Error('Not implemented');
  }

  async size(): Promise<number> {
    throw new Error('Not implemented');
  }
}
