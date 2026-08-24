import {HttpMethod, SyncStatus} from '../../enums';

export interface ISyncRequest {
  id: string;
  method: HttpMethod;
  url: string;
  body?: unknown;
  status: SyncStatus;
}
