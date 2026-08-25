import { inject, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { NetworkStatusService } from '../../network';
import { SyncService } from './sync.service';
import { RetrySchedulerService } from './retry-scheduler.service';

@Injectable()
export class SyncCoordinatorService {
  private readonly networkStatus = inject(NetworkStatusService);
  private readonly syncService = inject(SyncService);
  private readonly retryScheduler = inject(RetrySchedulerService);

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

    try {
      while (true) {
        const processed = await this.syncService.sync();

        if (!processed) {
          break;
        }
      }

      await this.scheduleNextRetry();
    } finally {
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
}
