import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NetworkStatusService } from '../../network';
import { QueueService, createQueueItem } from '../../queue';
import { HttpMethod } from '../../core';
import { LogEvent, LoggerService } from '../../logging';
import { OFFLINE_SYNC_PRIORITY } from '../tokens/offline-sync-priority.token';

export function offlineSyncInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const networkStatus = inject(NetworkStatusService);
  const queue = inject(QueueService);
  const logger = inject(LoggerService);

  const method = request.method.toUpperCase();

  const shouldQueue =
    method === HttpMethod.POST ||
    method === HttpMethod.PUT ||
    method === HttpMethod.PATCH ||
    method === HttpMethod.DELETE;

  if (!shouldQueue || networkStatus.isOnline()) {
    return next(request);
  }

  const priority = request.context.get(OFFLINE_SYNC_PRIORITY);

  const queueItem = createQueueItem(
    {
      id: crypto.randomUUID(),
      method: method as HttpMethod,
      url: request.urlWithParams,
      body: request.body,
    },
    0,
    priority,
  );

  logger.info(LogEvent.REQUEST_INTERCEPTED, {
    id: queueItem.id,
    method,
    url: request.urlWithParams,
  });

  return new Observable<HttpEvent<unknown>>((subscriber) => {
    queue
      .enqueue(queueItem)
      .then(() => {
        logger.info(LogEvent.REQUEST_QUEUED, {
          id: queueItem.id,
          method,
          url: request.urlWithParams,
        });

        subscriber.next(
          new HttpResponse({
            status: 202,
            statusText: 'Accepted',
            url: request.urlWithParams,
            body: {
              queued: true,
              id: queueItem.id,
            },
          }),
        );

        subscriber.complete();
      })
      .catch((error) => {
        logger.error(LogEvent.REQUEST_QUEUE_FAILED, {
          id: queueItem.id,
          method,
          url: request.urlWithParams,
          error,
        });

        subscriber.error(error);
      });
  });
}
