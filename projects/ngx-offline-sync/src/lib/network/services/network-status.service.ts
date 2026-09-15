import { inject, Injectable } from '@angular/core';
import { fromEvent, merge, Observable } from 'rxjs';
import { distinctUntilChanged, map, startWith, tap } from 'rxjs/operators';
import { LoggerService, LogEvent } from '../../logging';
import { OFFLINE_SYNC_CONFIG } from '../../config';

@Injectable({
  providedIn: 'root',
})
export class NetworkStatusService {
  private readonly logger = inject(LoggerService);
  private readonly config = inject(OFFLINE_SYNC_CONFIG);

  readonly online$: Observable<boolean> = merge(
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false)),
  ).pipe(
    startWith(navigator.onLine),
    distinctUntilChanged(),
    tap((isOnline) => {
      if (isOnline) {
        this.config.onNetworkStatusChange?.(false);
        this.logger.info(LogEvent.NETWORK_ONLINE);
      } else {
        this.config.onNetworkStatusChange?.(true);
        this.logger.info(LogEvent.NETWORK_OFFLINE);
      }
    }),
  );

  isOnline(): boolean {
    return navigator.onLine;
  }
}
