import { describe, expect, it } from 'vitest';
import { QueueService } from './queue.service';
import { IStorage } from '../../storage/interfaces';
import { IQueueItem } from '../queue-item';
import { HttpMethod, SyncStatus } from '../../core';


class FakeStorage implements IStorage<IQueueItem> {
  private readonly items = new Map<string, IQueueItem>();

  async save(value: IQueueItem): Promise<void> {
    this.items.set(value.id, value);
  }

  async get(id: string): Promise<IQueueItem | undefined> {
    return this.items.get(id);
  }

  async getAll(): Promise<IQueueItem[]> {
    return [...this.items.values()];
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }

  async clear(): Promise<void> {
    this.items.clear();
  }
}

describe('QueueService', () => {
  it('should enqueue an item', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);

    const item: IQueueItem = {
      id: 'queue-item-1',
      request: {
        id: 'request-1',
        method: HttpMethod.POST,
        url: '/posts',
        body: {
          title: 'Hello',
        },
      },
      status: SyncStatus.PENDING,
      attempts: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await queue.enqueue(item);

    const result = await queue.getPending();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(item);
  });
});
