import { ISyncRequest, SyncStatus } from '../../../core';

export interface IQueueItem {
  id: string;
  request: ISyncRequest;
  status: SyncStatus;
  attempts: number;
  sequence: number;
  createdAt: number;
  updatedAt: number;
  nextRetryAt?: number;
  error?: string;
}
