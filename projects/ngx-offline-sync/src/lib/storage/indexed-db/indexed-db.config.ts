export const INDEXED_DB_CONFIG = {
  name: 'ngx-offline-sync',
  version: 1,
  queueStore: 'queue',
  indexes: {
    status: 'status',
    createdAt: 'createdAt',
  },
} as const;
