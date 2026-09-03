export interface IRetryConfig {
  /**
   * Maximum number of attempts.
   * @default 3
   */
  maxAttempts?: number;

  /**
   * Base delay between retry attempts in milliseconds.
   * @default 5000
   */
  delay?: number;
}
