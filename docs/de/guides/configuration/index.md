# Konfiguration

**[← Zur Übersicht](../../../../README.md)**

**Dokumentation:** [English](../../../en/guides/configuration/index.md) · [Русский](../../../ru/guides/configuration/index.md) · [日本語]()

`provideOfflineSync()` akzeptiert ein optionales Konfigurationsobjekt, das das Verhalten von Warteschlange, Synchronisierung und Protokollierung steuert.

```ts
provideOfflineSync({
  batchSize: 10,
  logLevel: LogLevel.ALL,
  language: LogLanguage.RU,
})
```

## Verfügbare Optionen

| Option      | Typ           | Standardwert       | Beschreibung                                                                                |
|-------------|---------------|--------------------|---------------------------------------------------------------------------------------------|
| `batchSize` | `number`      | `1`                | Anzahl der Warteschlangen-Anfragen, die während der Synchronisierung parallel verarbeitet werden. [Mehr erfahren →](batch-size.md) |
| `logLevel`  | `LogLevel`    | `LogLevel.NONE`    | Ausführlichkeit der Protokollierung, von vollständig deaktiviert bis zum vollständigen Trace. [Mehr erfahren →](logging.md) |
| `language`  | `LogLanguage` | `LogLanguage.EN`   | Sprache der Protokollnachrichten. [Mehr erfahren →](logging.md)                            |

Mit dem Wachstum der Bibliothek werden hier weitere Optionen ergänzt, zum Beispiel Wiederholungsstrategien und Anfragepriorität. Siehe [Roadmap](../roadmap.md). Jede Option erhält eine eigene Datei, damit sie leicht auffindbar und wartbar bleibt.

## Weiter

- [batchSize](batch-size.md) — parallele Verarbeitung der Warteschlange
- [logLevel und language](logging.md) — Konfiguration der Protokollierung
- [Architektur](../architecture.md) — wo die Konfiguration in der Pipeline angewendet wird