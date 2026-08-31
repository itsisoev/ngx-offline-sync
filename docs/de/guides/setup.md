# Einrichtung

**[← Zur Übersicht](../../../README.md)**

**Dokumentation:** Deutsch · [English](../../en/guides/setup.md) · [Русский](../../ru/guides/setup.md)

Fügen Sie `provideOfflineSync()` und `offlineSyncInterceptor` zur Konfiguration Ihrer Anwendung hinzu:

```typescript
import { ApplicationConfig } from '@angular/core';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  provideOfflineSync,
  offlineSyncInterceptor,
} from 'ngx-offline-sync';

export const appConfig: ApplicationConfig = {
  providers: [
    provideOfflineSync(),

    provideHttpClient(
      withInterceptors([
        offlineSyncInterceptor,
      ]),
    ),
  ],
};
```

Nach der Einrichtung verwaltet die Bibliothek Warteschlange, Speicherung, Synchronisierung und Wiederholungen eigenständig. Eine zusätzliche Registrierung interner Dienste ist nicht erforderlich.

> `provideOfflineSync()` akzeptiert außerdem ein optionales Konfigurationsobjekt, beispielsweise für `batchSize`. Die vollständige Liste der Optionen finden Sie unter [Konfiguration](configuration/index.md).

## Weiter

- [Verwendung](usage.md) — wie Anfragen gesendet werden
- [Konfiguration](configuration/index.md) — Verhalten der Warteschlange anpassen
