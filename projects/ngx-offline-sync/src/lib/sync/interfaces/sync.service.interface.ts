import { IQueueItem } from '../../queue';
import { SyncResult } from '../enums/sync-result.enum';

export interface ISyncService {
  sync(item: IQueueItem): Promise<SyncResult>;
  getNextRetryAt(): Promise<number | undefined>;
}
