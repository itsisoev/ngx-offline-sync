import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ISyncService } from '../interfaces/sync.service.interface';
import { IRetryPolicy } from '../policies/interfaces/retry-policy.interface';
import { RetryPolicy } from '../policies/retry.policy';
import { IQueueItem, QueueService } from '../../queue';
import { SyncStatus } from '../../core';
import { SyncResult } from '../enums/sync-result.enum';
import { ILogger, LogEvent } from '../../logging';

export class SyncService implements ISyncService {
  constructor(
    private readonly queue: QueueService,
    private readonly http: HttpClient,
    private readonly retryPolicy: IRetryPolicy = new RetryPolicy(),
    private readonly logger: ILogger,
  ) {}

  async sync(item: IQueueItem): Promise<SyncResult> {
    try {
      await firstValueFrom(
        this.http.request(item.request.method, item.request.url, {
          body: item.request.body,
        }),
      );

      await this.queue.remove(item.id);

      this.logger.success(LogEvent.REQUEST_SYNCED, {
        id: item.id,
        method: item.request.method,
        url: item.request.url,
      });

      return SyncResult.SUCCESS;
    } catch (error) {
      this.logger.error(LogEvent.REQUEST_SYNC_FAILED, {
        id: item.id,
        method: item.request.method,
        url: item.request.url,
        error: this.getErrorMessage(error),
      });

      return this.handleError(item.id, item.attempts, error);
    }
  }

  private async handleError(id: string, attempts: number, error: unknown): Promise<SyncResult> {
    const nextAttempts = attempts + 1;

    const shouldRetry = this.retryPolicy.shouldRetry(error, nextAttempts);

    if (!shouldRetry) {
      await this.queue.update(id, {
        status: SyncStatus.FAILED,
        attempts: nextAttempts,
        nextRetryAt: undefined,
        error: this.getErrorMessage(error),
      });

      this.logger.error(LogEvent.REQUEST_FAILED_PERMANENTLY, {
        id,
        attempts: nextAttempts,
        error: this.getErrorMessage(error),
      });

      return SyncResult.FAILED;
    }

    const delay = this.retryPolicy.getDelay(nextAttempts);

    await this.queue.update(id, {
      status: SyncStatus.PENDING,
      attempts: nextAttempts,
      nextRetryAt: Date.now() + delay,
      error: this.getErrorMessage(error),
    });

    this.logger.warning(LogEvent.RETRY_SCHEDULED, {
      id,
      attempt: nextAttempts,
      delay,
      error: this.getErrorMessage(error),
    });

    return SyncResult.RETRY;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }

  async getNextRetryAt(): Promise<number | undefined> {
    const items = await this.queue.getPending();

    const retryTimes = items
      .map((item) => item.nextRetryAt)
      .filter((value): value is number => value !== undefined);

    if (retryTimes.length === 0) {
      return undefined;
    }

    return Math.min(...retryTimes);
  }
}
