import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { SyncCoordinatorService } from './sync-coordinator.service';
import { SyncService } from './sync.service';
import { RetrySchedulerService } from './retry-scheduler.service';
import { NetworkStatusService } from '../../network';
import { OFFLINE_SYNC_CONFIG } from '../../config';
import { IQueueItem, QueueService } from '../../queue';
import { ILogger, LogEvent, LoggerService } from '../../logging';
import { SyncResult } from '../enums/sync-result.enum';

class FakeLogger implements ILogger {
  readonly logs: {
    level: 'info' | 'success' | 'warning' | 'error';
    event: LogEvent;
    context?: Record<string, unknown>;
  }[] = [];

  info(event: LogEvent, context?: Record<string, unknown>): void {
    this.logs.push({
      level: 'info',
      event,
      context,
    });
  }

  success(event: LogEvent, context?: Record<string, unknown>): void {
    this.logs.push({
      level: 'success',
      event,
      context,
    });
  }

  warning(event: LogEvent, context?: Record<string, unknown>): void {
    this.logs.push({
      level: 'warning',
      event,
      context,
    });
  }

  error(event: LogEvent, context?: Record<string, unknown>): void {
    this.logs.push({
      level: 'error',
      event,
      context,
    });
  }
}

describe('SyncCoordinatorService', () => {
  function createCoordinator() {
    const online$ = new Subject<boolean>();

    const networkStatus = {
      online$,
      isOnline: vi.fn(),
    };

    const queue = {
      size: vi.fn(),
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

    const logger = new FakeLogger();

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
          provide: LoggerService,
          useValue: logger,
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
      logger,
      parentInjector,
    };
  }

  it('should sync the queue when network becomes online', async () => {
    const { coordinator, online$, queue, syncService, parentInjector } = createCoordinator();

    const items = [{ id: '1' } as IQueueItem, { id: '2' } as IQueueItem];

    queue.size.mockResolvedValue(2);

    queue.dequeueBatch.mockResolvedValueOnce(items).mockResolvedValueOnce([]);

    syncService.sync
      .mockResolvedValueOnce(SyncResult.SUCCESS)
      .mockResolvedValueOnce(SyncResult.SUCCESS);

    syncService.getNextRetryAt.mockResolvedValue(undefined);

    coordinator.start();

    online$.next(true);

    await vi.waitFor(() => {
      expect(queue.dequeueBatch).toHaveBeenCalledTimes(2);
    });

    expect(queue.size).toHaveBeenCalledTimes(1);

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

    expect(queue.size).not.toHaveBeenCalled();
    expect(queue.dequeueBatch).not.toHaveBeenCalled();
    expect(syncService.sync).not.toHaveBeenCalled();

    parentInjector.destroy();
  });

  it('should log when queue is empty', async () => {
    const { coordinator, online$, queue, logger, parentInjector } = createCoordinator();

    queue.size.mockResolvedValue(0);

    coordinator.start();

    online$.next(true);

    await vi.waitFor(() => {
      expect(logger.logs).toContainEqual({
        level: 'info',
        event: LogEvent.QUEUE_EMPTY,
        context: undefined,
      });
    });

    expect(queue.dequeueBatch).not.toHaveBeenCalled();

    parentInjector.destroy();
  });

  it('should schedule the next retry', async () => {
    const { coordinator, online$, queue, syncService, schedule, parentInjector } =
      createCoordinator();

    queue.size.mockResolvedValue(1);

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

    queue.size.mockResolvedValue(0);
    syncService.getNextRetryAt.mockResolvedValue(undefined);

    coordinator.start();
    coordinator.stop();

    online$.next(true);

    await Promise.resolve();

    expect(queue.size).not.toHaveBeenCalled();
    expect(queue.dequeueBatch).not.toHaveBeenCalled();
    expect(syncService.sync).not.toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledTimes(1);

    parentInjector.destroy();
  });

  it('should respect the configured batch size limit', async () => {
    const { coordinator, online$, queue, syncService, parentInjector } = createCoordinator();

    const firstBatch = [{ id: '1' } as IQueueItem, { id: '2' } as IQueueItem];

    const secondBatch = [{ id: '3' } as IQueueItem, { id: '4' } as IQueueItem];

    queue.size.mockResolvedValue(4);

    queue.dequeueBatch
      .mockResolvedValueOnce(firstBatch)
      .mockResolvedValueOnce(secondBatch)
      .mockResolvedValueOnce([]);

    syncService.sync.mockResolvedValue(SyncResult.SUCCESS);

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

    let resolveFirst!: (value: SyncResult) => void;
    let resolveSecond!: (value: SyncResult) => void;

    const firstSync = new Promise<SyncResult>((resolve) => {
      resolveFirst = resolve;
    });

    const secondSync = new Promise<SyncResult>((resolve) => {
      resolveSecond = resolve;
    });

    queue.size.mockResolvedValue(4);

    queue.dequeueBatch
      .mockResolvedValueOnce(firstBatch)
      .mockResolvedValueOnce(secondBatch)
      .mockResolvedValueOnce([]);

    syncService.sync.mockReturnValueOnce(firstSync).mockReturnValueOnce(secondSync);

    syncService.getNextRetryAt.mockResolvedValue(undefined);

    coordinator.start();

    online$.next(true);

    await vi.waitFor(() => {
      expect(queue.dequeueBatch).toHaveBeenCalledTimes(1);
      expect(syncService.sync).toHaveBeenCalledTimes(2);
    });

    expect(queue.dequeueBatch).toHaveBeenCalledTimes(1);
    expect(syncService.sync).toHaveBeenCalledTimes(2);

    resolveFirst(SyncResult.SUCCESS);
    resolveSecond(SyncResult.SUCCESS);

    await vi.waitFor(() => {
      expect(queue.dequeueBatch).toHaveBeenCalledTimes(3);
    });

    expect(queue.dequeueBatch).toHaveBeenNthCalledWith(1, 2);
    expect(queue.dequeueBatch).toHaveBeenNthCalledWith(2, 2);
    expect(queue.dequeueBatch).toHaveBeenNthCalledWith(3, 2);

    parentInjector.destroy();
  });

  it('should collect synchronization statistics', async () => {
    const { coordinator, online$, queue, syncService, logger, parentInjector } =
      createCoordinator();

    const items = [{ id: '1' } as IQueueItem, { id: '2' } as IQueueItem, { id: '3' } as IQueueItem];

    queue.size.mockResolvedValue(3);

    queue.dequeueBatch.mockResolvedValueOnce(items).mockResolvedValueOnce([]);

    syncService.sync
      .mockResolvedValueOnce(SyncResult.SUCCESS)
      .mockResolvedValueOnce(SyncResult.RETRY)
      .mockResolvedValueOnce(SyncResult.FAILED);

    syncService.getNextRetryAt.mockResolvedValue(undefined);

    coordinator.start();

    online$.next(true);

    await vi.waitFor(() => {
      expect(logger.logs.some((log) => log.event === LogEvent.SYNC_STATS)).toBe(true);
    });

    const statsLog = logger.logs.find((log) => log.event === LogEvent.SYNC_STATS);

    expect(statsLog?.context).toMatchObject({
      processed: 3,
      successful: 1,
      failed: 1,
      retried: 1,
    });

    expect(statsLog?.context?.['duration']).toBeTypeOf('number');

    parentInjector.destroy();
  });

  it('should log synchronization progress', async () => {
    const { coordinator, online$, queue, syncService, logger, parentInjector } =
      createCoordinator();

    const items = [{ id: '1' } as IQueueItem, { id: '2' } as IQueueItem];

    queue.size.mockResolvedValue(2);

    queue.dequeueBatch.mockResolvedValueOnce(items).mockResolvedValueOnce([]);

    syncService.sync
      .mockResolvedValueOnce(SyncResult.SUCCESS)
      .mockResolvedValueOnce(SyncResult.SUCCESS);

    syncService.getNextRetryAt.mockResolvedValue(undefined);

    coordinator.start();

    online$.next(true);

    await vi.waitFor(() => {
      expect(logger.logs.some((log) => log.event === LogEvent.SYNC_PROGRESS)).toBe(true);
    });

    const progressLog = logger.logs.find((log) => log.event === LogEvent.SYNC_PROGRESS);

    expect(progressLog?.context).toMatchObject({
      processed: 2,
      total: 2,
      successful: 2,
      failed: 0,
      retried: 0,
    });

    parentInjector.destroy();
  });

  it('should log synchronization lifecycle', async () => {
    const { coordinator, online$, queue, syncService, logger, parentInjector } =
      createCoordinator();

    const items = [{ id: '1' } as IQueueItem];

    queue.size.mockResolvedValue(1);

    queue.dequeueBatch.mockResolvedValueOnce(items).mockResolvedValueOnce([]);

    syncService.sync.mockResolvedValue(SyncResult.SUCCESS);
    syncService.getNextRetryAt.mockResolvedValue(undefined);

    coordinator.start();

    online$.next(true);

    await vi.waitFor(() => {
      expect(logger.logs.some((log) => log.event === LogEvent.SYNC_COMPLETED)).toBe(true);
    });

    const events = logger.logs.map((log) => log.event);

    expect(events).toContain(LogEvent.SYNC_STARTED);
    expect(events).toContain(LogEvent.SYNC_PROCESSING);
    expect(events).toContain(LogEvent.SYNC_PROGRESS);
    expect(events).toContain(LogEvent.SYNC_COMPLETED);
    expect(events).toContain(LogEvent.SYNC_STATS);

    parentInjector.destroy();
  });
});
