export interface ISyncService {
  sync(): Promise<boolean>;

  getNextRetryAt(): Promise<number | undefined>;
}
