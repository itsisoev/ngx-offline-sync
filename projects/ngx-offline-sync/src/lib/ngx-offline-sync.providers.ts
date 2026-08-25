import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QueueService, IQueueItem } from './queue';
import { IndexedDbStorage } from './storage';
import { RetryPolicy } from './sync';
import { SyncService, RetrySchedulerService, SyncCoordinatorService } from './sync';
import { NetworkStatusService } from './network';

export function provideOfflineSync(): EnvironmentProviders {
  return makeEnvironmentProviders([
    NetworkStatusService,

    {
      provide: IndexedDbStorage,
      useFactory: () => new IndexedDbStorage<IQueueItem>(),
    },

    {
      provide: QueueService,
      useFactory: (storage: IndexedDbStorage<IQueueItem>) => new QueueService(storage),
      deps: [IndexedDbStorage],
    },

    {
      provide: RetryPolicy,
      useFactory: () => new RetryPolicy(),
    },

    {
      provide: SyncService,
      useFactory: (queue: QueueService, http: HttpClient, retryPolicy: RetryPolicy) =>
        new SyncService(queue, http, retryPolicy),
      deps: [QueueService, HttpClient, RetryPolicy],
    },

    RetrySchedulerService,

    SyncCoordinatorService,
  ]);
}
