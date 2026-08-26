export interface IOfflineSyncConfig {
  /**
   * Maximum number of queued requests processed concurrently.
   * @default 1
   */
  batchSize?: number;
}
