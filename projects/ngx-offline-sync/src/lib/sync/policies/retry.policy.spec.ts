import { HttpErrorResponse } from '@angular/common/http';
import { RetryPolicy } from './retry.policy';

describe('RetryPolicy', () => {
  it('should retry by default up to 3 attempts', () => {
    const policy = new RetryPolicy();

    expect(policy.shouldRetry(new Error('error'), 1)).toBe(true);
    expect(policy.shouldRetry(new Error('error'), 2)).toBe(true);
    expect(policy.shouldRetry(new Error('error'), 3)).toBe(false);
  });

  it('should calculate linear retry delay', () => {
    const policy = new RetryPolicy();

    expect(policy.getDelay(1)).toBe(5000);
    expect(policy.getDelay(2)).toBe(10000);
    expect(policy.getDelay(3)).toBe(15000);
  });

  it('should use custom max attempts', () => {
    const policy = new RetryPolicy(5);

    expect(policy.shouldRetry(new Error('error'), 1)).toBe(true);
    expect(policy.shouldRetry(new Error('error'), 2)).toBe(true);
    expect(policy.shouldRetry(new Error('error'), 3)).toBe(true);
    expect(policy.shouldRetry(new Error('error'), 4)).toBe(true);
    expect(policy.shouldRetry(new Error('error'), 5)).toBe(false);
  });

  it('should use custom base delay', () => {
    const policy = new RetryPolicy(3, 2000);

    expect(policy.getDelay(1)).toBe(2000);
    expect(policy.getDelay(2)).toBe(4000);
    expect(policy.getDelay(3)).toBe(6000);
  });

  it('should retry network errors', () => {
    const policy = new RetryPolicy();

    const error = new HttpErrorResponse({
      status: 0,
    });

    expect(policy.shouldRetry(error, 1)).toBe(true);
  });

  it('should retry 5xx errors', () => {
    const policy = new RetryPolicy();

    const error = new HttpErrorResponse({
      status: 500,
    });

    expect(policy.shouldRetry(error, 1)).toBe(true);
  });

  it('should not retry 4xx errors', () => {
    const policy = new RetryPolicy();

    const error = new HttpErrorResponse({
      status: 400,
    });

    expect(policy.shouldRetry(error, 1)).toBe(false);
  });
});
