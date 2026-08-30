import { LogLevel } from '../logging';
import { LogLanguage } from '../logging/enums/log-language.enum';

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
}
