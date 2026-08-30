import {
  EnvironmentProviders,
  ENVIRONMENT_INITIALIZER,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QueueService, IQueueItem } from './queue';
import { IndexedDbStorage } from './storage';
import { RetryPolicy, SyncService, RetrySchedulerService, SyncCoordinatorService } from './sync';
import { NetworkStatusService } from './network';
import { OFFLINE_SYNC_CONFIG, IOfflineSyncConfig } from './config';
import {
  LoggerService,
  ConsoleLogTransport,
  LOG_TRANSPORT,
  LogLevel,
  LogLanguage,
} from './logging';

export function provideOfflineSync(config: IOfflineSyncConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    NetworkStatusService,
    LoggerService,
    {
      provide: LOG_TRANSPORT,
      useClass: ConsoleLogTransport,
    },
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
      useFactory: (
        queue: QueueService,
        http: HttpClient,
        retryPolicy: RetryPolicy,
        logger: LoggerService,
      ) => new SyncService(queue, http, retryPolicy, logger),
      deps: [QueueService, HttpClient, RetryPolicy, LoggerService],
    },
    RetrySchedulerService,
    SyncCoordinatorService,
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        const coordinator = inject(SyncCoordinatorService);

        coordinator.start();
      },
    },
    {
      provide: OFFLINE_SYNC_CONFIG,
      useValue: {
        batchSize: config.batchSize ?? 1,
        logLevel: config.logLevel ?? LogLevel.NONE,
        language: config.language ?? LogLanguage.EN,
      },
    },
  ]);
}
