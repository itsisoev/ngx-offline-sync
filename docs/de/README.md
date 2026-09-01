# Konfiguration

**[← Zurück zum Inhaltsverzeichnis](../README.md)**

**Dokumentation:**  Deutsch · [English](../../en/configuration/index.md)  · [Русский](../../ru/configuration/index.md)

`provideOfflineSync()` akzeptiert ein optionales Konfigurationsobjekt, mit dem sich das Verhalten von Warteschlange, Synchronisierung und Logging anpassen lässt.

```typescript
provideOfflineSync({
  batchSize: 10,
  logLevel: LogLevel.ALL,
  language: LogLanguage.DE,
})
```

## Verfügbare Optionen

| Option      | Typ           | Standardwert     | Beschreibung                                                                                                                              |
|-------------|---------------|------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `batchSize` | `number`      | `1`              | Anzahl der Anfragen aus der Warteschlange, die während der Synchronisierung parallel verarbeitet werden. [Mehr erfahren →](batch-size.md) |
| `logLevel`  | `LogLevel`    | `LogLevel.NONE`  | Detailgrad der Protokollierung: von keinem Logging bis zum vollständigen Trace. [Mehr erfahren →](logging.md)                             |
| `language`  | `LogLanguage` | `LogLanguage.EN` | Sprache der Log-Meldungen. [Mehr erfahren →](logging.md)                                                                                  |

## Priorität einzelner Anfragen

Zusätzlich zu den globalen Optionen von `provideOfflineSync()` erlaubt die Bibliothek, für eine **einzelne Anfrage** eine Priorität festzulegen — welche Operationen früher synchronisiert werden sollen als andere.

Die Priorität wird nicht über `provideOfflineSync()` gesetzt, sondern gezielt auf Ebene der einzelnen Anfrage über `HttpContext`:

```typescript
const context = new HttpContext().set(
  OFFLINE_SYNC_PRIORITY,
  QueuePriority.HIGH,
);

this.http.post('/api/orders', order, {
  context,
});
```

Es stehen drei Stufen zur Verfügung: `HIGH`, `NORMAL` (Standard) und `LOW`. [Mehr erfahren → Priority Queue](priority-queue.md)
