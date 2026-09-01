import { ISyncRequest, SyncStatus } from '../../../core';
import { QueuePriority } from '../enums/queue-priority.enum';
import { IQueueItem } from '../interfaces/queue-item.interface';

export function createQueueItem(
  request: ISyncRequest,
  sequence = 0,
  priority = QueuePriority.NORMAL,
): IQueueItem {
  const now = Date.now();

  return {
    id: crypto.randomUUID(),
    request,
    status: SyncStatus.PENDING,
    attempts: 0,
    sequence,
    createdAt: now,
    updatedAt: now,
    priority,
  };
}
