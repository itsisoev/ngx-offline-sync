import { HttpContextToken } from '@angular/common/http';
import { QueuePriority } from '../../queue';

export const OFFLINE_SYNC_PRIORITY = new HttpContextToken<QueuePriority>(
  () => QueuePriority.NORMAL,
);
