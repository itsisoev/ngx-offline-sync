import { IQueue } from '../interfaces';
import { IQueueItem } from '../queue-item';
import { IQueueItemUpdate } from '../queue-item/interfaces/queue-item-update.interface';
import { SyncStatus } from '../../core';
import { IStorage } from '../../storage';

export class QueueService implements IQueue {
  private readonly reservedIds = new Set<string>();

  constructor(private readonly storage: IStorage<IQueueItem>) {}

  async enqueue(item: IQueueItem): Promise<void> {
    await this.storage.save(item);
  }

  async dequeue(): Promise<IQueueItem | undefined> {
    const items = await this.getPending();

    const item = items.find((item) => !this.reservedIds.has(item.id));

    if (!item) {
      return undefined;
    }

    this.reservedIds.add(item.id);

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

    if (updatedItem.status !== SyncStatus.SYNCING) {
      this.reservedIds.delete(id);
    }
  }

  async getPending(): Promise<IQueueItem[]> {
    const items = await this.storage.getAll();
    const now = Date.now();

    return items
      .filter((item) => {
        if (item.status !== SyncStatus.PENDING) {
          return false;
        }

        if (item.nextRetryAt !== undefined && item.nextRetryAt > now) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const createdAtDiff = a.createdAt - b.createdAt;

        if (createdAtDiff !== 0) {
          return createdAtDiff;
        }

        return a.sequence - b.sequence;
      });
  }

  async getNextRetryAt(): Promise<number | undefined> {
    const items = await this.storage.getAll();

    const retryTimes = items
      .filter((item) => item.status === SyncStatus.PENDING && item.nextRetryAt !== undefined)
      .map((item) => item.nextRetryAt!);

    if (retryTimes.length === 0) {
      return undefined;
    }

    return Math.min(...retryTimes);
  }

  async clear(): Promise<void> {
    await this.storage.clear();
  }

  async size(): Promise<number> {
    const items = await this.getPending();

    return items.length;
  }
}
