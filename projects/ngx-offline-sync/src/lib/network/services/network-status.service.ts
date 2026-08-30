import { inject, Injectable } from '@angular/core';
import { fromEvent, merge, Observable } from 'rxjs';
import { distinctUntilChanged, map, startWith, tap } from 'rxjs/operators';
import { LoggerService } from '../../logging';
import { LogEvent } from '../../logging';

@Injectable({
  providedIn: 'root',
})
export class NetworkStatusService {
  private readonly logger = inject(LoggerService);

  readonly online$: Observable<boolean> = merge(
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false)),
  ).pipe(
    startWith(navigator.onLine),
    distinctUntilChanged(),
    tap((isOnline) => {
      if (isOnline) {
        this.logger.info(LogEvent.NETWORK_ONLINE);
      } else {
        this.logger.info(LogEvent.NETWORK_OFFLINE);
      }
    }),
  );

  isOnline(): boolean {
    return navigator.onLine;
  }
}
