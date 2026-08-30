import { describe, expect, it } from 'vitest';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { SyncService } from './sync.service';
import { QueueService, createQueueItem } from '../../queue';
import { IQueueItem } from '../../queue';
import { IStorage } from '../../storage';
import { HttpMethod, SyncStatus } from '../../core';
import { RetryPolicy } from '../policies/retry.policy';
import { ILogger, LogEvent } from '../../logging';
import { SyncResult } from '../enums/sync-result.enum';

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

class FakeLogger implements ILogger {
  info(_event: LogEvent, _context?: Record<string, unknown>): void {}

  success(_event: LogEvent, _context?: Record<string, unknown>): void {}

  warning(_event: LogEvent, _context?: Record<string, unknown>): void {}

  error(_event: LogEvent, _context?: Record<string, unknown>): void {}
}

describe('SyncService', () => {
  it('should remove item and return SUCCESS when request succeeds', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);
    const http = new FakeHttpClient();
    const logger = new FakeLogger();

    const syncService = new SyncService(queue, http as HttpClient, new RetryPolicy(), logger);

    const item = createQueueItem({
      id: 'request-1',
      method: HttpMethod.POST,
      url: '/posts',
      body: {
        title: 'Hello',
      },
    });

    await queue.enqueue(item);

    const result = await syncService.sync(item);

    expect(result).toBe(SyncResult.SUCCESS);

    const storedItem = await storage.get(item.id);

    expect(storedItem).toBeUndefined();
  });

  it('should mark item as failed and return FAILED when request returns a client error', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);
    const http = new FakeHttpClient();
    const logger = new FakeLogger();

    http.error = new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request',
    });

    const syncService = new SyncService(queue, http as HttpClient, new RetryPolicy(), logger);

    const item = createQueueItem({
      id: 'request-1',
      method: HttpMethod.POST,
      url: '/posts',
    });

    await queue.enqueue(item);

    const result = await syncService.sync(item);

    expect(result).toBe(SyncResult.FAILED);

    const storedItem = await storage.get(item.id);

    expect(storedItem?.status).toBe(SyncStatus.FAILED);
    expect(storedItem?.attempts).toBe(1);
    expect(storedItem?.error).toBeDefined();
  });

  it('should return RETRY and schedule next attempt when request returns a server error', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);
    const http = new FakeHttpClient();
    const logger = new FakeLogger();

    http.error = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
    });

    const syncService = new SyncService(
      queue,
      http as HttpClient,
      new RetryPolicy(3, 1000),
      logger,
    );

    const item = createQueueItem({
      id: 'request-1',
      method: HttpMethod.POST,
      url: '/posts',
    });

    await queue.enqueue(item);

    const result = await syncService.sync(item);

    expect(result).toBe(SyncResult.RETRY);

    const storedItem = await storage.get(item.id);

    expect(storedItem?.status).toBe(SyncStatus.PENDING);
    expect(storedItem?.attempts).toBe(1);
    expect(storedItem?.nextRetryAt).toBeDefined();
  });

  it('should return RETRY when a network error occurs', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);
    const http = new FakeHttpClient();
    const logger = new FakeLogger();

    http.error = new HttpErrorResponse({
      status: 0,
    });

    const syncService = new SyncService(
      queue,
      http as HttpClient,
      new RetryPolicy(3, 1000),
      logger,
    );

    const item = createQueueItem({
      id: 'request-1',
      method: HttpMethod.POST,
      url: '/posts',
    });

    await queue.enqueue(item);

    const result = await syncService.sync(item);

    expect(result).toBe(SyncResult.RETRY);

    const storedItem = await storage.get(item.id);

    expect(storedItem?.status).toBe(SyncStatus.PENDING);
    expect(storedItem?.attempts).toBe(1);
    expect(storedItem?.nextRetryAt).toBeDefined();
  });

  it('should return FAILED after maximum attempts', async () => {
    const storage = new FakeStorage();
    const queue = new QueueService(storage);
    const http = new FakeHttpClient();
    const logger = new FakeLogger();

    http.error = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
    });

    const syncService = new SyncService(
      queue,
      http as HttpClient,
      new RetryPolicy(3, 1000),
      logger,
    );

    const item = createQueueItem({
      id: 'request-1',
      method: HttpMethod.POST,
      url: '/posts',
    });

    item.attempts = 2;

    await queue.enqueue(item);

    const result = await syncService.sync(item);

    expect(result).toBe(SyncResult.FAILED);

    const storedItem = await storage.get(item.id);

    expect(storedItem?.status).toBe(SyncStatus.FAILED);
    expect(storedItem?.attempts).toBe(3);
    expect(storedItem?.nextRetryAt).toBeUndefined();
  });
});
