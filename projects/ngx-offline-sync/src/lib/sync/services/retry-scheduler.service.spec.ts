import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';

import { RetrySchedulerService } from './retry-scheduler.service';
import { LoggerService } from '../../logging';
import { LogEvent } from '../../logging';

class FakeLogger {
  readonly logs: {
    level: 'info' | 'success' | 'warning' | 'error';
    event: LogEvent;
    context?: Record<string, unknown>;
  }[] = [];

  info(event: LogEvent, context?: Record<string, unknown>): void {
    this.logs.push({
      level: 'info',
      event,
      context,
    });
  }

  success(event: LogEvent, context?: Record<string, unknown>): void {
    this.logs.push({
      level: 'success',
      event,
      context,
    });
  }

  warning(event: LogEvent, context?: Record<string, unknown>): void {
    this.logs.push({
      level: 'warning',
      event,
      context,
    });
  }

  error(event: LogEvent, context?: Record<string, unknown>): void {
    this.logs.push({
      level: 'error',
      event,
      context,
    });
  }
}

describe('RetrySchedulerService', () => {
  function createScheduler() {
    const logger = new FakeLogger();

    const injector = createEnvironmentInjector(
      [
        {
          provide: LoggerService,
          useValue: logger,
        },
      ],
      null as never,
    );

    const scheduler = runInInjectionContext(injector, () => new RetrySchedulerService());

    return {
      scheduler,
      logger,
      injector,
    };
  }

  it('should execute callback after the specified delay', async () => {
    vi.useFakeTimers();

    const { scheduler, injector } = createScheduler();

    const callback = vi.fn();

    scheduler.schedule(1000, callback);

    expect(callback).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(999);

    expect(callback).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);

    expect(callback).toHaveBeenCalledTimes(1);

    injector.destroy();
    vi.useRealTimers();
  });

  it('should log when retry starts', async () => {
    vi.useFakeTimers();

    const { scheduler, logger, injector } = createScheduler();

    const callback = vi.fn();

    scheduler.schedule(1000, callback);

    await vi.advanceTimersByTimeAsync(1000);

    expect(logger.logs).toContainEqual({
      level: 'info',
      event: LogEvent.RETRY_STARTED,
      context: {
        delay: 1000,
      },
    });

    injector.destroy();
    vi.useRealTimers();
  });

  it('should cancel scheduled callback', async () => {
    vi.useFakeTimers();

    const { scheduler, logger, injector } = createScheduler();

    const callback = vi.fn();

    scheduler.schedule(1000, callback);

    scheduler.cancel();

    await vi.advanceTimersByTimeAsync(1000);

    expect(callback).not.toHaveBeenCalled();

    expect(logger.logs).not.toContainEqual({
      level: 'info',
      event: LogEvent.RETRY_STARTED,
      context: {
        delay: 1000,
      },
    });

    injector.destroy();
    vi.useRealTimers();
  });
});
