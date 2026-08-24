import { ISyncRequest, SyncStatus } from '../../../core';

export interface IQueueItem {
  id: string;
  request: ISyncRequest;
  status: SyncStatus;
  attempts: number;
  createdAt: number;
  updatedAt: number;
  error?: string;
}
