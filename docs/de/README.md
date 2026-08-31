# ngx-offline-sync

<div>
  <img src="https://img.shields.io/npm/dt/ngx-offline-sync" alt="npm downloads"/>
  <a href="https://www.npmjs.com/package/ngx-offline-sync">
    <img src="https://img.shields.io/badge/npm-ngx--offline--sync-CB3837?logo=npm&logoColor=white" alt="npm package"/>
  </a>
  <img src="https://img.shields.io/github/stars/itsisoev/ngx-offline-sync" alt="GitHub stars"/>
</div>

**Dokumentation:** [English](../../README.md) · Deutsch · [Русский](../ru/README.md)

> **Offline-first-Synchronisierung von HTTP-Anfragen für Angular.**

`ngx-offline-sync` ist eine Open-Source-Bibliothek für Angular, die Anwendungen dabei hilft, bei vorübergehendem Verlust der Internetverbindung korrekt zu funktionieren.

Wenn sich die Anwendung offline befindet, werden unterstützte HTTP-Anfragen automatisch in eine lokale Warteschlange eingereiht und in **IndexedDB** gespeichert. Sobald die Verbindung wiederhergestellt ist, startet die Bibliothek selbstständig die Synchronisierung und führt die angesammelten Anfragen aus.

Sie müssen keine eigene Warteschlange erstellen, IndexedDB nicht selbst verwalten und keine eigene Logik zur Wiederherstellung der Verbindung schreiben — die Bibliothek übernimmt diese Arbeit für Sie und behält dabei die gewohnte Angular-`HttpClient`-API bei.

## Was ist neu

### 30. August 2026

Heute wurde die Arbeit an einem neuen Logging-System und an Verbesserungen der Synchronisierung abgeschlossen.

Die folgenden Änderungen werden im npm-Paket in Version `v1.1.1` erscheinen:

* **Konfigurierbares Logging** — ein Logging-System mit Unterstützung für `LogLevel` wurde hinzugefügt.
* **Sprachunterstützung** — Log-Nachrichten sind über `LogLanguage` auf Englisch und Russisch verfügbar.
* **Logging-Ereignisse** — typisierte `LogEvent`s wurden hinzugefügt, um den Ablauf der Warteschlange und der Synchronisierung nachzuverfolgen.
* **Synchronisierungsstatistiken** — es wurde eine Sammlung von Statistiken zu verarbeiteten, erfolgreichen, fehlgeschlagenen und erneut gesendeten Anfragen hinzugefügt.
* **Konfigurierbarer Log Transport** — es wurde die Möglichkeit hinzugefügt, den standardmäßigen `ConsoleLogTransport` durch eine eigene Implementierung zu ersetzen.
* **Verbessertes Retry-Logging** — es wurden Ereignisse für die Planung und den Start von Wiederholungsversuchen hinzugefügt.
* **Zusätzliche Testabdeckung** — Unit-Tests für das Logging-System und die zugehörigen Services wurden hinzugefügt.

> Diese Änderungen befinden sich bereits in der Entwicklung und werden mit der
> Veröffentlichung von Version `v1.1.1` im npm-Paket verfügbar sein.

## Wie es funktioniert

### Online

<p align="center">
  <img src="../assets/gifs/01-online.gif" alt="ngx-offline-sync — Arbeit ohne Netzwerk" />
</p>

Bei vorhandener Internetverbindung werden Anfragen auf gewohnte Weise über den Angular-`HttpClient` ausgeführt.

### Offline

<p align="center">
  <img src="../assets/gifs/02-offline.gif" alt="ngx-offline-sync — Synchronisierung nach Wiederherstellung der Verbindung" />
</p>

Wenn keine Verbindung besteht, gehen unterstützte Anfragen nicht verloren. Sie werden lokal gespeichert und in eine Warteschlange eingereiht.

### Wiederherstellung der Verbindung

<p align="center">
  <img src="../assets/gifs/03-sync.gif" alt="ngx-offline-sync — Synchronisierung nach Wiederherstellung der Verbindung" />
</p>

Nach der Wiederherstellung der Verbindung beginnt die Bibliothek automatisch mit der Verarbeitung der Warteschlange und synchronisiert die gespeicherten Anfragen.

## Funktionen

* **Automatische Anfragewarteschlange** — unterstützte HTTP-Anfragen werden bei fehlender Verbindung automatisch gespeichert.
* **IndexedDB** — die Warteschlange wird lokal gespeichert und bleibt auch nach dem Neuladen der Seite erhalten.
* **Automatische Synchronisierung** — angesammelte Anfragen werden nach Wiederherstellung der Verbindung verarbeitet.
* **Batch Processing** — mehrere Anfragen können mithilfe von `batchSize` parallel verarbeitet werden.
* **Wiederholungsversuche** — fehlgeschlagene Anfragen können gemäß der Retry-Policy automatisch wiederholt werden.
* **Angular HTTP Interceptor** — die Bibliothek integriert sich direkt mit `HttpClient`.
* **Keine zusätzliche API** — zum Senden von Anfragen wird der gewohnte `HttpClient` verwendet.
* **Konfigurierbare Synchronisierung** — das Verhalten von Warteschlange und Synchronisierung kann über die Konfiguration angepasst werden.
* **Konfigurierbares Logging** — die Logging-Stufe kann über `LogLevel` gewählt werden.
* **Mehrere Logging-Sprachen** — Nachrichten unterstützen Englisch und Russisch über `LogLanguage`.
* **Logging-Ereignisse** — die Bibliothek stellt typisierte Ereignisse zur Nachverfolgung des Zustands von Warteschlange und Synchronisierung bereit.
* **Synchronisierungsstatistiken** — die Bibliothek sammelt Informationen über die Anzahl verarbeiteter, erfolgreicher, fehlgeschlagener und erneut gesendeter Anfragen.
* **Konfigurierbarer Log Transport** — der standardmäßige `ConsoleLogTransport` kann über `LOG_TRANSPORT` durch eine eigene Implementierung ersetzt werden.

## Unterstützte HTTP-Methoden

Derzeit reiht die Bibliothek folgende HTTP-Methoden in die Warteschlange ein:

* `POST`
* `PUT`
* `PATCH`
* `DELETE`

`GET`-Anfragen werden nicht in der Offline-Warteschlange gespeichert.

Weitere Informationen: [Einschränkungen](guides/limitations.md).

## Installation

```bash
npm install ngx-offline-sync
```

## Einrichtung

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

Danach verwaltet die Bibliothek selbstständig die Warteschlange, den lokalen Speicher, die Synchronisierung und die Wiederholungsversuche.

## Verwendung

Zum Senden von Anfragen ist keine spezielle API erforderlich. Verwenden Sie den gewohnten Angular-`HttpClient`:

```typescript
this.http.post('/api/products', product).subscribe();
```

Bei vorhandener Verbindung wird die Anfrage wie gewohnt ausgeführt.

Wenn keine Verbindung besteht, wird eine unterstützte Anfrage automatisch in der Warteschlange gespeichert und nach Wiederherstellung der Verbindung verarbeitet.

## Konfiguration

Das Verhalten der Bibliothek kann über `provideOfflineSync()` angepasst werden:

```typescript
provideOfflineSync({
  batchSize: 5,
});
```

`batchSize` legt beispielsweise die maximale Anzahl von Anfragen fest, die innerhalb eines Batches parallel verarbeitet werden können.

Weitere Informationen:

* [Konfiguration](guides/configuration/index.md)
* [batchSize](guides/configuration/batch-size.md)

## Anfragestatus

Jede Anfrage in der Warteschlange hat einen bestimmten Status:

```text
PENDING → SYNCING → COMPLETED
```

Bei einem Fehler kann die Anfrage zur erneuten Verarbeitung in die Warteschlange zurückgestellt werden:

```text
SYNCING → PENDING → Retry
```

Wenn weitere Versuche nicht möglich sind:

```text
SYNCING → FAILED
```

Weitere Informationen: [Anfragestatus](guides/statuses.md).

## Dokumentation

### Hauptabschnitte

* [Einrichtung](guides/setup.md) — Installation und Registrierung der Provider
* [Verwendung](guides/usage.md) — Arbeit mit `HttpClient`
* [Wie es funktioniert](guides/how-it-works.md) — Lebenszyklus einer Anfrage
* [Konfiguration](guides/configuration/index.md) — verfügbare Parameter von `provideOfflineSync()`

  * [batchSize](guides/configuration/batch-size.md) — parallele Verarbeitung der Warteschlange
  * [logLevel und language](guides/configuration/logging.md) — Konfiguration des Loggings
* [Anfragestatus](guides/statuses.md) — Zustände und Übergänge von Anfragen
* [Wiederholungsversuche](guides/retries.md) — Funktionsweise der `RetryPolicy`
* [Architektur](guides/architecture.md) — interne Komponenten und ihr Zusammenspiel
* [Roadmap](guides/roadmap.md) — weitere Entwicklung des Projekts
* [Einschränkungen](guides/limitations.md) — aktuelle Einschränkungen der Bibliothek

## Projektstatus

`ngx-offline-sync` befindet sich in aktiver Entwicklung.

Das Projekt entwickelt sich schrittweise in Richtung einer flexibleren Konfiguration, einer verbesserten Fehler- und Netzwerkstatusbehandlung, einer erweiterten Testabdeckung und einer weiteren Verbesserung der Dokumentation.

## Lizenz

Siehe [LICENSE](../../LICENSE).
