import { LogLevel } from '../logging';
import { LogLanguage } from '../logging';
import { IRetryConfig } from '../sync';

export interface IOfflineSyncConfig {
  /**
   * Maximum number of queued requests processed concurrently.
   * @default 1
   */
  batchSize?: number;

  /**
   * Logging level.
   * @default LogLevel.NONE
   */
  logLevel?: LogLevel;

  /**
   * Language used for log messages.
   * @default LogLanguage.EN
   */
  language?: LogLanguage;

  /**
   * Retry configuration for failed requests.
   */
  retry?: IRetryConfig;

  /**
   * Maximum number of requests that can be stored in the queue.
   * @default 150
   */
  maxQueueSize?: number;

  /**
   * Callback called when the queue reaches the maximum size.
   */
  onQueueFull?: () => void;

  /**
   * Callback called when network status changes.
   * @param offline Whether the application is currently offline.
   */
  onNetworkStatusChange?: (offline: boolean) => void;
}
