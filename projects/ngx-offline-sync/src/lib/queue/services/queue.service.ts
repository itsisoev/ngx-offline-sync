import { IQueue } from '../interfaces';
import { IStorage } from '../../storage/interfaces';
import { IQueueItem } from '../queue-item';

export class QueueService implements IQueue {
  constructor(private readonly storage: IStorage<IQueueItem>) {}

  async enqueue(item: IQueueItem): Promise<void> {
    await this.storage.save(item);
  }

  async dequeue(): Promise<IQueueItem | undefined> {
    const item = await this.peek();

    if (!item) {
      return undefined;
    }

    await this.storage.delete(item.id);

    return item;
  }

  async peek(): Promise<IQueueItem | undefined> {
    const items = await this.getPending();

    return items[0];
  }

  async remove(id: string): Promise<void> {
    await this.storage.delete(id);
  }

  async getPending(): Promise<IQueueItem[]> {
    const items = await this.storage.getAll();

    return items
      .filter((item) => item.status === 'PENDING')
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  async clear(): Promise<void> {
    await this.storage.clear();
  }

  async size(): Promise<number> {
    const items = await this.getPending();

    return items.length;
  }
}
