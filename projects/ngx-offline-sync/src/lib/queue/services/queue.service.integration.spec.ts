import { beforeEach, describe, expect, it } from 'vitest';
import 'fake-indexeddb/auto';
import { QueueService } from './queue.service';
import { IndexedDbStorage } from '../../storage/indexed-db';
import { createQueueItem, IQueueItem } from '../queue-item';
import { HttpMethod, SyncStatus } from '../../core';

describe('QueueService + IndexedDbStorage', () => {
  let queue: QueueService;
  let storage: IndexedDbStorage<IQueueItem>;

  beforeEach(async () => {
    storage = new IndexedDbStorage<IQueueItem>();

    await storage.clear();

    queue = new QueueService(storage);
  });

  it('should enqueue and retrieve an item from IndexedDB', async () => {
    const item = createQueueItem({
      id: 'request-1',
      method: HttpMethod.POST,
      url: '/posts',
      body: {
        title: 'Hello',
      },
    });

    await queue.enqueue(item);

    const result = await queue.peek();

    expect(result).toEqual(item);
  });

  it('should process items in FIFO order', async () => {
    const firstItem = createQueueItem({
      id: 'request-1',
      method: HttpMethod.POST,
      url: '/posts/1',
    });

    const secondItem = createQueueItem({
      id: 'request-2',
      method: HttpMethod.POST,
      url: '/posts/2',
    });

    const thirdItem = createQueueItem({
      id: 'request-3',
      method: HttpMethod.POST,
      url: '/posts/3',
    });

    firstItem.createdAt = 1000;
    secondItem.createdAt = 2000;
    thirdItem.createdAt = 3000;

    await queue.enqueue(firstItem);
    await queue.enqueue(secondItem);
    await queue.enqueue(thirdItem);

    const first = await queue.dequeue();
    const second = await queue.dequeue();
    const third = await queue.dequeue();

    expect(first?.id).toBe(firstItem.id);
    expect(first?.status).toBe(SyncStatus.SYNCING);

    expect(second?.id).toBe(secondItem.id);
    expect(second?.status).toBe(SyncStatus.SYNCING);

    expect(third?.id).toBe(thirdItem.id);
    expect(third?.status).toBe(SyncStatus.SYNCING);
  });

  it('should update an item in IndexedDB', async () => {
    const item = createQueueItem({
      id: 'request-1',
      method: HttpMethod.POST,
      url: '/posts',
    });

    await queue.enqueue(item);

    await queue.update(item.id, {
      status: SyncStatus.SYNCING,
      attempts: 1,
    });

    const result = await storage.get(item.id);

    expect(result?.status).toBe(SyncStatus.SYNCING);
    expect(result?.attempts).toBe(1);
  });

  it('should persist an item between storage instances', async () => {
    const firstStorage = new IndexedDbStorage<IQueueItem>();
    const firstQueue = new QueueService(firstStorage);

    const item = createQueueItem({
      id: 'request-1',
      method: HttpMethod.POST,
      url: '/posts',
    });

    await firstQueue.enqueue(item);

    const secondStorage = new IndexedDbStorage<IQueueItem>();

    const stored = await secondStorage.get(item.id);

    expect(stored).toEqual(item);
  });

  it('should preserve FIFO order when items have the same createdAt', async () => {
    const firstItem = createQueueItem({
      id: 'request-1',
      method: HttpMethod.POST,
      url: '/posts/1',
    });

    const secondItem = createQueueItem({
      id: 'request-2',
      method: HttpMethod.POST,
      url: '/posts/2',
    });

    const thirdItem = createQueueItem({
      id: 'request-3',
      method: HttpMethod.POST,
      url: '/posts/3',
    });

    firstItem.createdAt = 1000;
    secondItem.createdAt = 1000;
    thirdItem.createdAt = 1000;

    firstItem.sequence = 1;
    secondItem.sequence = 2;
    thirdItem.sequence = 3;

    await queue.enqueue(firstItem);
    await queue.enqueue(secondItem);
    await queue.enqueue(thirdItem);

    const result = await queue.getPending();

    expect(result.map((item) => item.id)).toEqual([firstItem.id, secondItem.id, thirdItem.id]);
  });
});
