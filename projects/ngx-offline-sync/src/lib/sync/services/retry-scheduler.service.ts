import { Service } from '@angular/core';

@Service()
export class RetrySchedulerService {
  private timeoutId?: ReturnType<typeof setTimeout>;

  schedule(delay: number, callback: () => void | Promise<void>): void {
    this.cancel();

    this.timeoutId = setTimeout(async () => {
      this.timeoutId = undefined;

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
