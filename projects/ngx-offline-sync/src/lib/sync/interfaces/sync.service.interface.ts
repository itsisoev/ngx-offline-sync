import { IQueueItem } from '../../queue';

export interface ISyncService {
  sync(item: IQueueItem): Promise<void>;
  getNextRetryAt(): Promise<number | undefined>;
}
