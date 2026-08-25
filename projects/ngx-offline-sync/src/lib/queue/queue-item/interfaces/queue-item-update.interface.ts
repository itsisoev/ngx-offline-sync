import { SyncStatus } from '../../../core';

export interface IQueueItemUpdate {
  status?: SyncStatus;
  attempts?: number;
  nextRetryAt?: number;
  error?: string;
}
