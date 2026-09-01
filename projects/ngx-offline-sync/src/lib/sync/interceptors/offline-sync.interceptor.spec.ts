import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { offlineSyncInterceptor } from './offline-sync.interceptor';
import { IQueueItem, QueuePriority, QueueService } from '../../queue';
import { IStorage } from '../../storage';
import { HttpMethod, SyncStatus } from '../../core';
import { OFFLINE_SYNC_PRIORITY } from '../tokens/offline-sync-priority.token';
import { NetworkStatusService } from '../../network';
import { LoggerService } from '../../logging';
import { firstValueFrom } from 'rxjs';

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

describe('offlineSyncInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let storage: FakeStorage;
  let queue: QueueService;

  beforeEach(() => {
    storage = new FakeStorage();
    queue = new QueueService(storage);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([offlineSyncInterceptor])),
        provideHttpClientTesting(),

        {
          provide: QueueService,
          useValue: queue,
        },

        {
          provide: NetworkStatusService,
          useValue: {
            isOnline: () => false,
          },
        },

        {
          provide: LoggerService,
          useValue: {
            info: () => undefined,
            error: () => undefined,
            warn: () => undefined,
          },
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should use NORMAL priority by default', async () => {
    http
      .post('/products', {
        title: 'Product',
      })
      .subscribe();

    await Promise.resolve();

    const pending = await queue.getPending();

    expect(pending).toHaveLength(1);
    expect(pending[0].priority).toBe(QueuePriority.NORMAL);

    expect(pending[0].request.method).toBe(HttpMethod.POST);
    expect(pending[0].request.url).toBe('/products');
  });

  it('should use HIGH priority when specified', async () => {
    const context = new HttpContext().set(OFFLINE_SYNC_PRIORITY, QueuePriority.HIGH);

    http
      .post(
        '/products',
        {
          title: 'Important product',
        },
        { context },
      )
      .subscribe();

    await Promise.resolve();

    const pending = await queue.getPending();

    expect(pending).toHaveLength(1);
    expect(pending[0].priority).toBe(QueuePriority.HIGH);
  });

  it('should use LOW priority when specified', async () => {
    const context = new HttpContext().set(OFFLINE_SYNC_PRIORITY, QueuePriority.LOW);

    http
      .post(
        '/products',
        {
          title: 'Low priority product',
        },
        { context },
      )
      .subscribe();

    await Promise.resolve();

    const pending = await queue.getPending();

    expect(pending).toHaveLength(1);
    expect(pending[0].priority).toBe(QueuePriority.LOW);
  });

  it('should queue POST requests when offline', async () => {
    http
      .post('/products', {
        title: 'Product',
      })
      .subscribe();

    await Promise.resolve();

    const pending = await queue.getPending();

    expect(pending).toHaveLength(1);
  });

  it('should queue PUT requests when offline', async () => {
    http
      .put('/products/1', {
        title: 'Updated product',
      })
      .subscribe();

    await Promise.resolve();

    const pending = await queue.getPending();

    expect(pending).toHaveLength(1);
  });

  it('should queue PATCH requests when offline', async () => {
    http
      .patch('/products/1', {
        title: 'Updated product',
      })
      .subscribe();

    await Promise.resolve();

    const pending = await queue.getPending();

    expect(pending).toHaveLength(1);
  });

  it('should queue DELETE requests when offline', async () => {
    http.delete('/products/1').subscribe();

    await Promise.resolve();

    const pending = await queue.getPending();

    expect(pending).toHaveLength(1);
  });

  it('should not queue GET requests', async () => {
    http.get('/products').subscribe();

    const request = httpTesting.expectOne('/products');

    expect(request.request.method).toBe('GET');

    request.flush([]);

    await Promise.resolve();

    const pending = await queue.getPending();

    expect(pending).toHaveLength(0);
  });

  it('should return 202 when a request is queued', async () => {
    const response = await firstValueFrom(
      http.post('/products', {
        title: 'Product',
      }),
    );

    expect(response).toEqual({
      queued: true,
      id: expect.any(String),
    });
  });

  it('should preserve request body when queued', async () => {
    const body = {
      title: 'Product',
      price: 100,
    };

    http.post('/products', body).subscribe();

    await Promise.resolve();

    const pending = await queue.getPending();

    expect(pending[0].request.body).toEqual(body);
  });
});
