export interface ISyncStats {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  retried: number;
  startedAt: number;
  completedAt?: number;
  duration?: number;
}
