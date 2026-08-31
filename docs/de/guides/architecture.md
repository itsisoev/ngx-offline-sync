# Architektur

**[← Zur Übersicht](../../../README.md)**

**Dokumentation:** [English](../../en/guides/architecture.md) · [Русский](../../ru/guides/architecture.md) · [日本語]()

Die Bibliothek besteht aus mehreren Kernkomponenten:

```
NetworkStatusService
        │
        ▼
OfflineSyncInterceptor
        │
        ▼
QueueService
        │
        ▼
IndexedDbStorage
        │
        ▼
SyncCoordinatorService
        │
        ▼
SyncService
        │
        ├── RetryPolicy
        │
        └── HttpClient
```

## Kernkomponenten

**offlineSyncInterceptor**
Fängt HTTP-Anfragen ab und bestimmt, ob eine Anfrage in die Warteschlange aufgenommen werden muss.

**NetworkStatusService**
Überwacht den Status der Internetverbindung und benachrichtigt die Bibliothek, wenn diese wiederhergestellt ist.

**QueueService**
Verwaltet die Anfragenwarteschlange: Elemente hinzufügen, abrufen, aktualisieren und entfernen.

**IndexedDbStorage**
Verwendet IndexedDB zur dauerhaften lokalen Speicherung der Warteschlange.

**SyncCoordinatorService**
Überwacht die Wiederherstellung der Verbindung und löst die Synchronisierung der Warteschlange aus.

**SyncService**
Ruft Anfragen aus der Warteschlange ab, führt sie über `HttpClient` aus und aktualisiert ihren Status. Hier wird die Einstellung [batchSize](configuration/batch-size.md) angewendet, die steuert, wie viele Anfragen parallel verarbeitet werden.

**RetryPolicy**
Definiert die Regeln für Wiederholungen fehlgeschlagener Anfragen. Siehe [Wiederholungen](retries.md).

## Weiter

- [So funktioniert es](how-it-works.md) — derselbe Anfrageablauf, nach Szenarien aufgeschlüsselt (online / offline / wiederhergestellt)
- [Konfiguration](configuration/index.md) — welche Komponenten angepasst werden können