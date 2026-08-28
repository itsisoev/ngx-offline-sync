import { describe, expect, it } from 'vitest';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { SyncService } from './sync.service';
import { QueueService, createQueueItem } from '../../queue';
import { IQueueItem } from '../../queue';
import { IStorage } from '../../storage';
import { HttpMethod, SyncStatus } from '../../core';
import { RetryPolicy } from '../policies/retry.policy';

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

class FakeHttpClient {
  error?: unknown;

  request(
    method: string,
    url: string,
    options?: {
      body?: unknown;
    },
  ): Observable<unknown> {
    if (this.error) {
      return throwError(() => this.error);
    }

    return of({
      method,
      url,
      body: options?.body,
    });
  }
}

describe('SyncService', () => {
  it('should remove item when request succeeds', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);
    const http = new FakeHttpClient();

    const syncService = new SyncService(queue, http as HttpClient, new RetryPolicy());

    const item = createQueueItem({
      id: 'request-1',
      method: HttpMethod.POST,
      url: '/posts',
      body: {
        title: 'Hello',
      },
    });

    await queue.enqueue(item);

    await syncService.sync(item);

    const result = await storage.get(item.id);

    expect(result).toBeUndefined();
  });

  it('should mark item as failed when request returns a client error', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);
    const http = new FakeHttpClient();

    http.error = new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request',
    });

    const syncService = new SyncService(queue, http as HttpClient, new RetryPolicy());

    const item = createQueueItem({
      id: 'request-1',
      method: HttpMethod.POST,
      url: '/posts',
    });

    await queue.enqueue(item);

    await syncService.sync(item);

    const result = await storage.get(item.id);

    expect(result?.status).toBe(SyncStatus.FAILED);
    expect(result?.attempts).toBe(1);
    expect(result?.error).toBeDefined();
  });

  it('should return item to pending when request returns a server error', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);
    const http = new FakeHttpClient();

    http.error = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
    });

    const syncService = new SyncService(queue, http as HttpClient, new RetryPolicy());

    const item = createQueueItem({
      id: 'request-1',
      method: HttpMethod.POST,
      url: '/posts',
    });

    await queue.enqueue(item);
    await syncService.sync(item);

    const result = await storage.get(item.id);

    expect(result?.status).toBe(SyncStatus.PENDING);
    expect(result?.attempts).toBe(1);
  });

  it('should return item to pending when request returns a server error', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);
    const http = new FakeHttpClient();

    http.error = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
    });

    const syncService = new SyncService(queue, http as HttpClient, new RetryPolicy(3, 1000));

    const item = createQueueItem({
      id: 'request-1',
      method: HttpMethod.POST,
      url: '/posts',
    });

    await queue.enqueue(item);

    await syncService.sync(item);

    const result = await storage.get(item.id);

    expect(result?.status).toBe(SyncStatus.PENDING);
    expect(result?.attempts).toBe(1);
    expect(result?.nextRetryAt).toBeDefined();
  });

  it('should return item to pending when a network error occurs', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);
    const http = new FakeHttpClient();

    http.error = new HttpErrorResponse({
      status: 0,
    });

    const syncService = new SyncService(queue, http as HttpClient, new RetryPolicy(3, 1000));

    const item = createQueueItem({
      id: 'request-1',
      method: HttpMethod.POST,
      url: '/posts',
    });

    await queue.enqueue(item);

    await syncService.sync(item);

    const result = await storage.get(item.id);

    expect(result?.status).toBe(SyncStatus.PENDING);
    expect(result?.attempts).toBe(1);
    expect(result?.nextRetryAt).toBeDefined();
  });

  it('should mark item as failed after maximum attempts', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);
    const http = new FakeHttpClient();

    http.error = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
    });

    const syncService = new SyncService(queue, http as HttpClient, new RetryPolicy(3, 1000));

    const item = createQueueItem({
      id: 'request-1',
      method: HttpMethod.POST,
      url: '/posts',
    });

    item.attempts = 2;

    await queue.enqueue(item);

    await syncService.sync(item);

    const result = await storage.get(item.id);

    expect(result?.status).toBe(SyncStatus.FAILED);
    expect(result?.attempts).toBe(3);
    expect(result?.nextRetryAt).toBeUndefined();
  });
});
