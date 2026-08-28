import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SyncCoordinatorService } from './sync-coordinator.service';
import { SyncService } from './sync.service';
import { RetrySchedulerService } from './retry-scheduler.service';
import { NetworkStatusService } from '../../network';
import { OFFLINE_SYNC_CONFIG } from '../../config';
import { IQueueItem, QueueService } from '../../queue';

describe('SyncCoordinatorService', () => {
  function createCoordinator() {
    const online$ = new Subject<boolean>();

    const networkStatus = {
      online$,
      isOnline: vi.fn(),
    };

    const queue = {
      dequeueBatch: vi.fn(),
    };

    const syncService = {
      sync: vi.fn(),
      getNextRetryAt: vi.fn(),
    };

    const schedule = vi.fn();
    const cancel = vi.fn();

    const retryScheduler = {
      schedule,
      cancel,
    };

    const parentInjector = createEnvironmentInjector(
      [
        {
          provide: NetworkStatusService,
          useValue: networkStatus,
        },
        {
          provide: QueueService,
          useValue: queue,
        },
        {
          provide: SyncService,
          useValue: syncService,
        },
        {
          provide: RetrySchedulerService,
          useValue: retryScheduler,
        },
        {
          provide: OFFLINE_SYNC_CONFIG,
          useValue: {
            batchSize: 2,
          },
        },
      ],
      null as never,
    );

    const coordinator = runInInjectionContext(parentInjector, () => new SyncCoordinatorService());

    return {
      coordinator,
      online$,
      queue,
      syncService,
      schedule,
      cancel,
      parentInjector,
    };
  }

  it('should sync the queue when network becomes online', async () => {
    const { coordinator, online$, queue, syncService, parentInjector } = createCoordinator();

    const items = [{ id: '1' } as IQueueItem, { id: '2' } as IQueueItem];

    queue.dequeueBatch.mockResolvedValueOnce(items).mockResolvedValueOnce([]);

    syncService.sync.mockResolvedValue(undefined);
    syncService.getNextRetryAt.mockResolvedValue(undefined);

    coordinator.start();

    online$.next(true);

    await vi.waitFor(() => {
      expect(queue.dequeueBatch).toHaveBeenCalledTimes(2);
    });

    expect(queue.dequeueBatch).toHaveBeenNthCalledWith(1, 2);
    expect(queue.dequeueBatch).toHaveBeenNthCalledWith(2, 2);

    expect(syncService.sync).toHaveBeenCalledTimes(2);
    expect(syncService.sync).toHaveBeenNthCalledWith(1, items[0]);
    expect(syncService.sync).toHaveBeenNthCalledWith(2, items[1]);

    parentInjector.destroy();
  });

  it('should not sync when network is offline', async () => {
    const { coordinator, online$, queue, syncService, parentInjector } = createCoordinator();

    coordinator.start();

    online$.next(false);

    await Promise.resolve();

    expect(queue.dequeueBatch).not.toHaveBeenCalled();
    expect(syncService.sync).not.toHaveBeenCalled();

    parentInjector.destroy();
  });

  it('should schedule the next retry', async () => {
    const { coordinator, online$, queue, syncService, schedule, parentInjector } =
      createCoordinator();

    queue.dequeueBatch.mockResolvedValue([]);

    syncService.getNextRetryAt.mockResolvedValue(Date.now() + 1000);

    coordinator.start();

    online$.next(true);

    await vi.waitFor(() => {
      expect(schedule).toHaveBeenCalledTimes(1);
    });

    const [delay] = schedule.mock.calls[0];

    expect(delay).toBeGreaterThanOrEqual(0);
    expect(delay).toBeLessThanOrEqual(1000);

    parentInjector.destroy();
  });

  it('should stop listening when stopped', async () => {
    const { coordinator, online$, queue, syncService, cancel, parentInjector } =
      createCoordinator();

    queue.dequeueBatch.mockResolvedValue([]);
    syncService.getNextRetryAt.mockResolvedValue(undefined);

    coordinator.start();
    coordinator.stop();

    online$.next(true);

    await Promise.resolve();

    expect(queue.dequeueBatch).not.toHaveBeenCalled();
    expect(syncService.sync).not.toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledTimes(1);

    parentInjector.destroy();
  });

  it('should respect the configured batch size limit', async () => {
    const { coordinator, online$, queue, syncService, parentInjector } = createCoordinator();

    const firstBatch = [{ id: '1' } as IQueueItem, { id: '2' } as IQueueItem];

    const secondBatch = [{ id: '3' } as IQueueItem, { id: '4' } as IQueueItem];

    queue.dequeueBatch
      .mockResolvedValueOnce(firstBatch)
      .mockResolvedValueOnce(secondBatch)
      .mockResolvedValueOnce([]);

    syncService.sync.mockResolvedValue(undefined);
    syncService.getNextRetryAt.mockResolvedValue(undefined);

    coordinator.start();

    online$.next(true);

    await vi.waitFor(() => {
      expect(queue.dequeueBatch).toHaveBeenCalledTimes(3);
    });

    expect(queue.dequeueBatch).toHaveBeenNthCalledWith(1, 2);
    expect(queue.dequeueBatch).toHaveBeenNthCalledWith(2, 2);
    expect(queue.dequeueBatch).toHaveBeenNthCalledWith(3, 2);

    expect(syncService.sync).toHaveBeenCalledTimes(4);

    parentInjector.destroy();
  });

  it('should not start the next batch before the current batch is completed', async () => {
    const { coordinator, online$, queue, syncService, parentInjector } = createCoordinator();

    const firstBatch = [{ id: '1' } as IQueueItem, { id: '2' } as IQueueItem];

    const secondBatch = [{ id: '3' } as IQueueItem, { id: '4' } as IQueueItem];

    let resolveFirst!: () => void;
    let resolveSecond!: () => void;

    const firstSync = new Promise<void>((resolve) => {
      resolveFirst = resolve;
    });

    const secondSync = new Promise<void>((resolve) => {
      resolveSecond = resolve;
    });

    queue.dequeueBatch
      .mockResolvedValueOnce(firstBatch)
      .mockResolvedValueOnce(secondBatch)
      .mockResolvedValueOnce([]);

    syncService.sync
      .mockReturnValueOnce(firstSync)
      .mockReturnValueOnce(secondSync)
      .mockResolvedValue(undefined);

    syncService.getNextRetryAt.mockResolvedValue(undefined);

    coordinator.start();

    online$.next(true);

    await vi.waitFor(() => {
      expect(queue.dequeueBatch).toHaveBeenCalledTimes(1);
      expect(syncService.sync).toHaveBeenCalledTimes(2);
    });

    expect(queue.dequeueBatch).toHaveBeenCalledTimes(1);
    expect(syncService.sync).toHaveBeenCalledTimes(2);

    resolveFirst();
    resolveSecond();

    await vi.waitFor(() => {
      expect(queue.dequeueBatch).toHaveBeenCalledTimes(3);
    });

    expect(queue.dequeueBatch).toHaveBeenNthCalledWith(1, 2);
    expect(queue.dequeueBatch).toHaveBeenNthCalledWith(2, 2);
    expect(queue.dequeueBatch).toHaveBeenNthCalledWith(3, 2);

    parentInjector.destroy();
  });
});
