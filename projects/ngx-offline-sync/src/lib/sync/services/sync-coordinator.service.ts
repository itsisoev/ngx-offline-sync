import { inject, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { NetworkStatusService } from '../../network';
import { QueueService } from '../../queue';
import { SyncService } from './sync.service';
import { RetrySchedulerService } from './retry-scheduler.service';
import { OFFLINE_SYNC_CONFIG } from '../../config';

@Injectable()
export class SyncCoordinatorService {
  private readonly networkStatus = inject(NetworkStatusService);
  private readonly queue = inject(QueueService);
  private readonly syncService = inject(SyncService);
  private readonly retryScheduler = inject(RetrySchedulerService);

  private readonly config = inject(OFFLINE_SYNC_CONFIG);

  private subscription?: Subscription;
  private syncing = false;

  start(): void {
    if (this.subscription) {
      return;
    }

    this.subscription = this.networkStatus.online$.subscribe(async (isOnline) => {
      if (!isOnline) {
        return;
      }

      await this.syncQueue();
    });
  }

  stop(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;

    this.retryScheduler.cancel();
  }

  private async syncQueue(): Promise<void> {
    if (this.syncing) {
      return;
    }

    this.syncing = true;

    console.log('[OfflineSync] START:', new Date().toISOString());

    try {
      while (true) {
        const processed = await this.syncBatch();

        if (!processed) {
          break;
        }
      }

      await this.scheduleNextRetry();
    } finally {
      console.log('[OfflineSync] END:', new Date().toISOString());

      this.syncing = false;
    }
  }

  private async scheduleNextRetry(): Promise<void> {
    const nextRetryAt = await this.syncService.getNextRetryAt();

    if (nextRetryAt === undefined) {
      return;
    }

    const delay = Math.max(0, nextRetryAt - Date.now());

    this.retryScheduler.schedule(delay, () => this.syncQueue());
  }

  private async syncBatch(): Promise<boolean> {
    const batchSize = this.config.batchSize ?? 1;

    const items = await this.queue.dequeueBatch(batchSize);

    if (items.length === 0) {
      return false;
    }

    await Promise.all(items.map((item) => this.syncService.sync(item)));

    return true;
  }
}
