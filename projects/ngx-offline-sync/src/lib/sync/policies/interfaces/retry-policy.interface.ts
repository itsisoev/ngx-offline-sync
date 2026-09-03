export interface IRetryPolicy {
  shouldRetry(error: unknown, attempts: number): boolean;
  getDelay(attempts: number): number;
}
