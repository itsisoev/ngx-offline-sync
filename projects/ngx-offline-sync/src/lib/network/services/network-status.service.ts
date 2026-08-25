import { Service } from '@angular/core';
import { fromEvent, merge, Observable, of } from 'rxjs';
import { map, distinctUntilChanged, startWith } from 'rxjs/operators';

@Service()
export class NetworkStatusService {
  readonly online$: Observable<boolean> = merge(
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false)),
  ).pipe(startWith(navigator.onLine), distinctUntilChanged());

  isOnline(): boolean {
    return navigator.onLine;
  }
}
