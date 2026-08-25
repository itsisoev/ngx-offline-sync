import { ISyncRequest, SyncStatus } from '../../../core';
import { IQueueItem } from '../interfaces';

export function createQueueItem(
  request: ISyncRequest,
): IQueueItem {
  const now = Date.now();

  return {
    id: crypto.randomUUID(),
    request,
    status: SyncStatus.PENDING,
    attempts: 0,
    createdAt: now,
    updatedAt: now,
    sequence: 0,
  };
}
