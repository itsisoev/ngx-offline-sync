import { Injectable } from '@angular/core';
import { fromEvent, merge, Observable } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NetworkStatusService {
  readonly online$: Observable<boolean> = merge(
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false)),
  ).pipe(startWith(navigator.onLine), distinctUntilChanged());

  isOnline(): boolean {
    return navigator.onLine;
  }
}
