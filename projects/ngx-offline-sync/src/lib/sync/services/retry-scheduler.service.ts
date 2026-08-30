import { inject, Injectable } from '@angular/core';
import { LogEvent, ILogger, LoggerService } from '../../logging';

@Injectable()
export class RetrySchedulerService {
  private readonly logger = inject(LoggerService);

  private timeoutId?: ReturnType<typeof setTimeout>;

  schedule(delay: number, callback: () => void | Promise<void>): void {
    this.cancel();

    this.timeoutId = setTimeout(async () => {
      this.timeoutId = undefined;

      this.logger.info(LogEvent.RETRY_STARTED, {
        delay,
      });

      await callback();
    }, delay);
  }

  cancel(): void {
    if (this.timeoutId === undefined) {
      return;
    }

    clearTimeout(this.timeoutId);
    this.timeoutId = undefined;
  }
}
