import { SyncStatus } from '../../../core';

export interface IQueueItemUpdate {
  status?: SyncStatus;
  attempts?: number;
  updatedAt?: number;
  error?: string;
}
