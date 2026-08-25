import {
  createEnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { SyncCoordinatorService } from './sync-coordinator.service';
import { SyncService } from './sync.service';
import { RetrySchedulerService } from './retry-scheduler.service';
import { NetworkStatusService } from '../../network';

describe('SyncCoordinatorService', () => {
  function createCoordinator() {
    const online$ = new Subject<boolean>();

    const networkStatus = {
      online$,
      isOnline: vi.fn(),
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
          provide: SyncService,
          useValue: syncService,
        },
        {
          provide: RetrySchedulerService,
          useValue: retryScheduler,
        },
      ],
      null as never,
    );

    const coordinator = runInInjectionContext(parentInjector, () => new SyncCoordinatorService());

    return {
      coordinator,
      online$,
      syncService,
      schedule,
      cancel,
      parentInjector,
    };
  }

  it('should sync the queue when network becomes online', async () => {
    const { coordinator, online$, syncService, parentInjector } = createCoordinator();

    syncService.sync.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    syncService.getNextRetryAt.mockResolvedValue(undefined);

    coordinator.start();

    online$.next(true);

    await vi.waitFor(() => {
      expect(syncService.sync).toHaveBeenCalledTimes(2);
    });

    expect(syncService.sync).toHaveBeenNthCalledWith(1);
    expect(syncService.sync).toHaveBeenNthCalledWith(2);

    parentInjector.destroy();
  });

  it('should not sync when network is offline', async () => {
    const { coordinator, online$, syncService, parentInjector } = createCoordinator();

    coordinator.start();

    online$.next(false);

    await Promise.resolve();

    expect(syncService.sync).not.toHaveBeenCalled();

    parentInjector.destroy();
  });

  it('should schedule the next retry', async () => {
    const { coordinator, online$, syncService, schedule, parentInjector } = createCoordinator();

    syncService.sync.mockResolvedValue(false);

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
    const { coordinator, online$, syncService, cancel, parentInjector } = createCoordinator();

    syncService.sync.mockResolvedValue(false);

    syncService.getNextRetryAt.mockResolvedValue(undefined);

    coordinator.start();
    coordinator.stop();

    online$.next(true);

    await Promise.resolve();

    expect(syncService.sync).not.toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledTimes(1);

    parentInjector.destroy();
  });
});
