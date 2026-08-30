import { LogEvent } from '../enums/log-event.enum';

export const enMessages: Record<LogEvent, string> = {
  [LogEvent.SYNC_STARTED]: 'Synchronization started',
  [LogEvent.SYNC_COMPLETED]: 'Synchronization completed',
  [LogEvent.SYNC_PROCESSING]: 'Processing {{count}} queued requests',
  [LogEvent.SYNC_PROGRESS]: 'Synchronization progress: {{processed}} / {{total}}',

  [LogEvent.REQUEST_INTERCEPTED]: 'Request intercepted while offline',
  [LogEvent.REQUEST_QUEUED]: 'Request added to queue',
  [LogEvent.REQUEST_DEQUEUED]: 'Request taken from queue',
  [LogEvent.REQUEST_SYNCED]: 'Request synchronized successfully',
  [LogEvent.REQUEST_SYNC_FAILED]: 'Request synchronization failed',
  [LogEvent.REQUEST_FAILED_PERMANENTLY]: 'Request synchronization failed permanently',
  [LogEvent.REQUEST_QUEUE_FAILED]: 'Failed to add request to queue',

  [LogEvent.RETRY_SCHEDULED]: 'Retry scheduled',
  [LogEvent.RETRY_STARTED]: 'Retry started',

  [LogEvent.NETWORK_ONLINE]: 'Network is online',
  [LogEvent.NETWORK_OFFLINE]: 'Network is offline',

  [LogEvent.QUEUE_EMPTY]: 'Synchronization skipped: queue is empty',
  [LogEvent.QUEUE_CLEARED]: 'Queue cleared',

  [LogEvent.SYNC_STATS]:
    'Processed: {{processed}}, Successful: {{successful}}, Failed: {{failed}}, Retried: {{retried}}, Duration: {{duration}}',
};
