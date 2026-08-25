import { IQueue } from '../interfaces';
import { IStorage } from '../../storage/interfaces';
import { IQueueItem } from '../queue-item';
import { IQueueItemUpdate } from '../queue-item/interfaces/queue-item-update.interface';
import { SyncStatus } from '../../core';

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

    await this.update(item.id, {
      status: SyncStatus.SYNCING,
    });

    return {
      ...item,
      status: SyncStatus.SYNCING,
    };
  }

  async peek(): Promise<IQueueItem | undefined> {
    const items = await this.getPending();

    return items[0];
  }

  async remove(id: string): Promise<void> {
    await this.storage.delete(id);
  }

  async update(id: string, changes: IQueueItemUpdate): Promise<void> {
    const item = await this.storage.get(id);

    if (!item) {
      return;
    }

    const updatedItem: IQueueItem = {
      ...item,
      ...changes,
      updatedAt: Date.now(),
    };

    await this.storage.save(updatedItem);
  }

  async getPending(): Promise<IQueueItem[]> {
    const items = await this.storage.getAll();

    return items
      .filter((item) => item.status === SyncStatus.PENDING)
      .sort((a, b) => {
        const createdAtDiff = a.createdAt - b.createdAt;

        if (createdAtDiff !== 0) {
          return createdAtDiff;
        }

        return a.sequence - b.sequence;
      });
  }

  async clear(): Promise<void> {
    await this.storage.clear();
  }

  async size(): Promise<number> {
    const items = await this.getPending();

    return items.length;
  }
}
