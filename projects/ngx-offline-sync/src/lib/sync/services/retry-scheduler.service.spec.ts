import { describe, expect, it, vi } from 'vitest';
import { RetrySchedulerService } from './retry-scheduler.service';

describe('RetrySchedulerService', () => {
  it('should execute callback after the specified delay', async () => {
    vi.useFakeTimers();

    const scheduler = new RetrySchedulerService();
    const callback = vi.fn();

    scheduler.schedule(1000, callback);

    expect(callback).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(999);

    expect(callback).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);

    expect(callback).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('should cancel scheduled callback', async () => {
    vi.useFakeTimers();

    const scheduler = new RetrySchedulerService();
    const callback = vi.fn();

    scheduler.schedule(1000, callback);

    scheduler.cancel();

    await vi.advanceTimersByTimeAsync(1000);

    expect(callback).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
