import { describe, expect, it } from 'vitest';
import { QueueService } from './queue.service';
import { IQueueItem } from '../queue-item';
import { createQueueItem } from '../queue-item';
import { HttpMethod, SyncStatus } from '../../core';
import { IStorage } from '../../storage/interfaces';

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
  const createRequest = (id: string) => ({
    id,
    method: HttpMethod.POST,
    url: '/posts',
    body: {
      title: 'Hello',
    },
  });

  it('should enqueue an item', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);

    const item = createQueueItem(createRequest('request-1'));

    await queue.enqueue(item);

    const result = await queue.getPending();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(item);
  });

  it('should return the first pending item with peek', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);

    const first = createQueueItem(createRequest('request-1'));
    const second = createQueueItem(createRequest('request-2'));

    await queue.enqueue(first);
    await queue.enqueue(second);

    const result = await queue.peek();

    expect(result).toEqual(first);
  });

  it('should remove and return the first pending item with dequeue', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);

    const first = createQueueItem(createRequest('request-1'));
    const second = createQueueItem(createRequest('request-2'));

    await queue.enqueue(first);
    await queue.enqueue(second);

    const result = await queue.dequeue();

    expect(result).toEqual(first);

    const remaining = await queue.getPending();

    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toEqual(second);
  });

  it('should remove an item by id', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);

    const item = createQueueItem(createRequest('request-1'));

    await queue.enqueue(item);
    await queue.remove(item.id);

    const result = await queue.getPending();

    expect(result).toHaveLength(0);
  });

  it('should return only pending items', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);

    const pending = createQueueItem(createRequest('request-1'));

    const completed = createQueueItem(createRequest('request-2'));

    completed.status = SyncStatus.COMPLETED;

    await queue.enqueue(pending);
    await queue.enqueue(completed);

    const result = await queue.getPending();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(pending);
  });

  it('should return the number of pending items', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);

    const first = createQueueItem(createRequest('request-1'));
    const second = createQueueItem(createRequest('request-2'));

    await queue.enqueue(first);
    await queue.enqueue(second);

    expect(await queue.size()).toBe(2);
  });

  it('should clear the queue', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);

    const first = createQueueItem(createRequest('request-1'));
    const second = createQueueItem(createRequest('request-2'));

    await queue.enqueue(first);
    await queue.enqueue(second);

    await queue.clear();

    expect(await queue.size()).toBe(0);
  });
});
