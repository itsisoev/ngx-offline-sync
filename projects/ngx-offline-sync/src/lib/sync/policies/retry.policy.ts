import { HttpErrorResponse } from '@angular/common/http';
import { IRetryPolicy } from '../interfaces/retry-policy.interface';

export class RetryPolicy implements IRetryPolicy {
  constructor(
    private readonly maxAttempts = 3,
    private readonly baseDelay = 1000,
  ) {}

  shouldRetry(error: unknown, attempts: number): boolean {
    if (attempts >= this.maxAttempts) {
      return false;
    }

    if (!(error instanceof HttpErrorResponse)) {
      return true;
    }

    // Network error
    if (error.status === 0) {
      return true;
    }

    // 5xx
    return error.status >= 500;
  }

  getDelay(attempts: number): number {
    return this.baseDelay * 2 ** (attempts - 1);
  }
}
