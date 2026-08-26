import { describe, expect, it } from 'vitest';
import { QueueService } from './queue.service';
import { IQueueItem } from '../queue-item';
import { createQueueItem } from '../queue-item';
import { HttpMethod, SyncStatus } from '../../core';
import { IStorage } from '../../storage';

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
  let queue: QueueService;
  let storage: FakeStorage;

  const createRequest = (id: string) => ({
    id,
    method: HttpMethod.POST,
    url: '/posts',
    body: {
      title: 'Hello',
    },
  });

  beforeEach(() => {
    storage = new FakeStorage();
    queue = new QueueService(storage);
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

  it('should mark the first pending item as syncing with dequeue', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);

    const first = createQueueItem(createRequest('request-1'));
    const second = createQueueItem(createRequest('request-2'));

    await queue.enqueue(first);
    await queue.enqueue(second);

    const result = await queue.dequeue();

    expect(result?.id).toBe(first.id);
    expect(result?.status).toBe(SyncStatus.SYNCING);

    const stored = await storage.get(first.id);

    expect(stored?.status).toBe(SyncStatus.SYNCING);

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


  it('should update an item', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);

    const item = createQueueItem(createRequest('request-1'));

    await queue.enqueue(item);

    await queue.update(item.id, {
      status: SyncStatus.SYNCING,
      attempts: 1,
    });

    const result = await storage.get(item.id);

    expect(result?.status).toBe(SyncStatus.SYNCING);
    expect(result?.attempts).toBe(1);
  });

  it('should do nothing when updating a non-existent item', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);

    await queue.update('unknown-id', {
      status: SyncStatus.SYNCING,
    });

    const result = await storage.get('unknown-id');

    expect(result).toBeUndefined();
  });

  it('should mark an item as completed', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);

    const item = createQueueItem(createRequest('request-1'));

    await queue.enqueue(item);

    const syncingItem = await queue.dequeue();

    expect(syncingItem?.status).toBe(SyncStatus.SYNCING);

    await queue.update(item.id, {
      status: SyncStatus.COMPLETED,
    });

    const result = await storage.get(item.id);

    expect(result?.status).toBe(SyncStatus.COMPLETED);
  });

  it('should mark an item as failed', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);

    const item = createQueueItem(createRequest('request-1'));

    await queue.enqueue(item);

    const syncingItem = await queue.dequeue();

    expect(syncingItem?.status).toBe(SyncStatus.SYNCING);

    await queue.update(item.id, {
      status: SyncStatus.FAILED,
      attempts: 1,
      error: 'Network error',
    });

    const result = await storage.get(item.id);

    expect(result?.status).toBe(SyncStatus.FAILED);
    expect(result?.attempts).toBe(1);
    expect(result?.error).toBe('Network error');
  });

  it('should preserve item data when updating its status', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);

    const item = createQueueItem(createRequest('request-1'));

    await queue.enqueue(item);

    await queue.update(item.id, {
      status: SyncStatus.SYNCING,
    });

    const result = await storage.get(item.id);

    expect(result?.id).toBe(item.id);
    expect(result?.request).toEqual(item.request);
    expect(result?.status).toBe(SyncStatus.SYNCING);
    expect(result?.attempts).toBe(0);
    expect(result?.createdAt).toBe(item.createdAt);
  });

  it('should return undefined when dequeuing an empty queue', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);

    const result = await queue.dequeue();

    expect(result).toBeUndefined();
  });

  it('should not return an item before its retry time', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);

    const item = createQueueItem(createRequest('request-1'));

    item.status = SyncStatus.PENDING;
    item.nextRetryAt = Date.now() + 60_000;

    await queue.enqueue(item);

    const result = await queue.getPending();

    expect(result).toHaveLength(0);
  });

  it('should return an item when its retry time has passed', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);

    const item = createQueueItem(createRequest('request-1'));

    item.status = SyncStatus.PENDING;
    item.nextRetryAt = Date.now() - 1;

    await queue.enqueue(item);

    const result = await queue.getPending();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(item);
  });

  it('should return the earliest retry time', async () => {
    const now = Date.now();

    const first = createQueueItem(createRequest('request-1'));
    const second = createQueueItem(createRequest('request-2'));
    const third = createQueueItem(createRequest('request-3'));

    first.nextRetryAt = now + 5000;
    second.nextRetryAt = now + 1000;
    third.nextRetryAt = now + 3000;

    await queue.enqueue(first);
    await queue.enqueue(second);
    await queue.enqueue(third);

    const result = await queue.getNextRetryAt();

    expect(result).toBe(second.nextRetryAt);
  });

  it('should return undefined when there are no scheduled retries', async () => {
    const item = createQueueItem(createRequest('request-1'));

    await queue.enqueue(item);

    const result = await queue.getNextRetryAt();

    expect(result).toBeUndefined();
  });

  it('should dequeue different items when called concurrently', async () => {
    const first = createQueueItem(createRequest('request-1'));
    const second = createQueueItem(createRequest('request-2'));
    const third = createQueueItem(createRequest('request-3'));

    await queue.enqueue(first);
    await queue.enqueue(second);
    await queue.enqueue(third);

    const results = await Promise.all([queue.dequeue(), queue.dequeue(), queue.dequeue()]);

    const ids = results.map((item) => item?.id);

    expect(ids).toEqual([first.id, second.id, third.id]);
    expect(new Set(ids).size).toBe(3);
  });

  it('should release an item reservation when updating it back to pending', async () => {
    const item = createQueueItem(createRequest('request-1'));

    await queue.enqueue(item);

    const syncingItem = await queue.dequeue();

    expect(syncingItem?.status).toBe(SyncStatus.SYNCING);

    await queue.update(item.id, {
      status: SyncStatus.PENDING,
    });

    const result = await queue.dequeue();

    expect(result?.id).toBe(item.id);
    expect(result?.status).toBe(SyncStatus.SYNCING);
  });
});
