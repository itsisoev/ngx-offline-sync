import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ISyncService } from '../interfaces/sync.service.interface';
import { IRetryPolicy } from '../interfaces/retry-policy.interface';
import { RetryPolicy } from '../policies/retry.policy';
import { QueueService } from '../../queue';
import { SyncStatus } from '../../core';

export class SyncService implements ISyncService {
  constructor(
    private readonly queue: QueueService,
    private readonly http: HttpClient,
    private readonly retryPolicy: IRetryPolicy = new RetryPolicy(),
  ) {}

  async sync(): Promise<boolean> {
    const item = await this.queue.dequeue();

    if (!item) {
      return false;
    }

    try {
      await firstValueFrom(
        this.http.request(item.request.method, item.request.url, {
          body: item.request.body,
        }),
      );

      await this.queue.remove(item.id);
    } catch (error) {
      await this.handleError(item.id, item.attempts, error);
    }

    return true;
  }

  private async handleError(id: string, attempts: number, error: unknown): Promise<void> {
    const nextAttempts = attempts + 1;

    const shouldRetry = this.retryPolicy.shouldRetry(error, nextAttempts);

    if (!shouldRetry) {
      await this.queue.update(id, {
        status: SyncStatus.FAILED,
        attempts: nextAttempts,
        nextRetryAt: undefined,
        error: this.getErrorMessage(error),
      });

      return;
    }

    const delay = this.retryPolicy.getDelay(nextAttempts);

    await this.queue.update(id, {
      status: SyncStatus.PENDING,
      attempts: nextAttempts,
      nextRetryAt: Date.now() + delay,
      error: this.getErrorMessage(error),
    });
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
