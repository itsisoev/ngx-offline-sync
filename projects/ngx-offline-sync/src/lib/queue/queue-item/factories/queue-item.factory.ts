import { ISyncRequest, SyncStatus } from '../../../core';
import { IQueueItem } from '../interfaces';

export function createQueueItem(request: ISyncRequest, sequence = 0): IQueueItem {
  const now = Date.now();

  return {
    id: crypto.randomUUID(),
    request,

    status: SyncStatus.PENDING,

    attempts: 0,
    sequence,

    createdAt: now,
    updatedAt: now,
  };
}
