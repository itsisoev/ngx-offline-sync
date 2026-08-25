import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

import { NetworkStatusService } from '../../network';
import { QueueService, createQueueItem } from '../../queue';
import { HttpMethod } from '../../core';

export function offlineSyncInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const networkStatus = inject(NetworkStatusService);
  const queue = inject(QueueService);

  const method = request.method.toUpperCase();

  const shouldQueue =
    method === HttpMethod.POST ||
    method === HttpMethod.PUT ||
    method === HttpMethod.PATCH ||
    method === HttpMethod.DELETE;

  if (!shouldQueue || networkStatus.isOnline()) {
    return next(request);
  }

  const queueItem = createQueueItem({
    id: crypto.randomUUID(),
    method: method as HttpMethod,
    url: request.urlWithParams,
    body: request.body,
  });

  return new Observable<HttpEvent<unknown>>((subscriber) => {
    queue
      .enqueue(queueItem)
      .then(() => {
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
        subscriber.error(error);
      });
  });
}
