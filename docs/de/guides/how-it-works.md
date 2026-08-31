# So funktioniert es

**[← Zur Übersicht](../../../README.md)**

**Dokumentation:** Deutsch · [English](../../en/guides/how-it-works.md) · [Русский](../../ru/guides/how-it-works.md)

Abhängig vom Netzwerkstatus durchläuft die Bibliothek drei Szenarien.

## Internet verfügbar

```
HttpClient
    ↓
offlineSyncInterceptor
    ↓
HTTP-Anfrage
    ↓
Server
```

Die Anfrage wird ohne Verzögerung oder zusätzliche Logik direkt gesendet.

## Internet nicht verfügbar

```
HttpClient
    ↓
offlineSyncInterceptor
    ↓
QueueService
    ↓
IndexedDB
    ↓
PENDING
```

Die Anfrage wird lokal gespeichert und wartet darauf, dass die Verbindung wiederhergestellt wird. Der Benutzer sieht keinen Netzwerkfehler — die Anfrage wechselt einfach zu `PENDING`.

## Internetverbindung wiederhergestellt

```
NetworkStatusService
    ↓
SyncCoordinatorService
    ↓
SyncService
    ↓
SYNCING
    ↓
HTTP-Anfrage
    ↓
COMPLETED
```

Die Warteschlange wird automatisch verarbeitet, ohne dass der Entwickler etwas tun muss — `NetworkStatusService` erkennt die Wiederverbindung und startet die Synchronisierung.

## Weiter

- [Anfragestatus](statuses.md) — die vollständige Liste der Status und Übergänge
- [Architektur](architecture.md) — welche Dienste an jedem Schritt beteiligt sind
