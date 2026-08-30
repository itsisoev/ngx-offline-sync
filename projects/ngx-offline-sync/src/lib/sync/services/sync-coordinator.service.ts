import { inject, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { NetworkStatusService } from '../../network';
import { QueueService } from '../../queue';
import { SyncService } from './sync.service';
import { RetrySchedulerService } from './retry-scheduler.service';
import { OFFLINE_SYNC_CONFIG } from '../../config';
import { LogEvent, LoggerService } from '../../logging';
import { SyncResult } from '../enums/sync-result.enum';
import { ISyncStats } from '../interfaces/sync-stats.interface';

@Injectable()
export class SyncCoordinatorService {
  private readonly networkStatus = inject(NetworkStatusService);
  private readonly queue = inject(QueueService);
  private readonly syncService = inject(SyncService);
  private readonly retryScheduler = inject(RetrySchedulerService);
  private readonly logger = inject(LoggerService);

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

    const startedAt = Date.now();

    try {
      const total = await this.queue.size();

      if (total === 0) {
        this.logger.info(LogEvent.QUEUE_EMPTY);
        return;
      }

      const stats: ISyncStats = {
        total,
        processed: 0,
        successful: 0,
        failed: 0,
        retried: 0,
        startedAt,
      };

      this.logger.info(LogEvent.SYNC_STARTED, {
        startedAt,
      });

      this.logger.info(LogEvent.SYNC_PROCESSING, {
        count: total,
      });

      while (true) {
        const results = await this.syncBatch();

        if (results.length === 0) {
          break;
        }

        this.updateStats(stats, results);

        this.logger.info(LogEvent.SYNC_PROGRESS, {
          processed: stats.processed,
          total: stats.total,
          successful: stats.successful,
          failed: stats.failed,
          retried: stats.retried,
        });
      }

      await this.scheduleNextRetry();

      stats.completedAt = Date.now();
      stats.duration = stats.completedAt - stats.startedAt;

      this.logger.success(LogEvent.SYNC_COMPLETED, {
        duration: stats.duration,
      });

      this.logger.info(LogEvent.SYNC_STATS, {
        processed: stats.processed,
        successful: stats.successful,
        failed: stats.failed,
        retried: stats.retried,
        duration: stats.duration,
      });
    } finally {
      this.syncing = false;
    }
  }

  private updateStats(stats: ISyncStats, results: SyncResult[]): void {
    stats.processed += results.length;

    for (const result of results) {
      switch (result) {
        case SyncResult.SUCCESS:
          stats.successful++;
          break;

        case SyncResult.RETRY:
          stats.retried++;
          break;

        case SyncResult.FAILED:
          stats.failed++;
          break;
      }
    }
  }

  private async scheduleNextRetry(): Promise<void> {
    const nextRetryAt = await this.syncService.getNextRetryAt();

    if (nextRetryAt === undefined) {
      return;
    }

    const delay = Math.max(0, nextRetryAt - Date.now());

    this.logger.info(LogEvent.RETRY_SCHEDULED, {
      delay,
      nextRetryAt,
    });

    this.retryScheduler.schedule(delay, () => this.syncQueue());
  }

  private async syncBatch(): Promise<SyncResult[]> {
    const batchSize = this.config.batchSize ?? 1;

    const items = await this.queue.dequeueBatch(batchSize);

    if (items.length === 0) {
      return [];
    }

    return Promise.all(items.map((item) => this.syncService.sync(item)));
  }
}
