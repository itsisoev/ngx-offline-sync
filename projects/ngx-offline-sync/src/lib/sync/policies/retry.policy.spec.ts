import { describe, expect, it } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';

import { RetryPolicy } from './retry.policy';

describe('RetryPolicy', () => {
  it('should retry network errors', () => {
    const policy = new RetryPolicy();

    const error = new HttpErrorResponse({
      status: 0,
    });

    expect(policy.shouldRetry(error, 1)).toBe(true);
  });

  it('should retry server errors', () => {
    const policy = new RetryPolicy();

    const error = new HttpErrorResponse({
      status: 500,
    });

    expect(policy.shouldRetry(error, 1)).toBe(true);
  });

  it('should not retry client errors', () => {
    const policy = new RetryPolicy();

    const error = new HttpErrorResponse({
      status: 400,
    });

    expect(policy.shouldRetry(error, 1)).toBe(false);
  });

  it('should not retry after maximum attempts', () => {
    const policy = new RetryPolicy(3);

    const error = new HttpErrorResponse({
      status: 500,
    });

    expect(policy.shouldRetry(error, 3)).toBe(false);
  });

  it('should calculate exponential backoff delay', () => {
    const policy = new RetryPolicy(3, 1000);

    expect(policy.getDelay(1)).toBe(1000);
    expect(policy.getDelay(2)).toBe(2000);
    expect(policy.getDelay(3)).toBe(4000);
  });
});
