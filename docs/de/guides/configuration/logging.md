# logLevel und language (Protokollierung)

**[← Zur Konfiguration](index.md)**

**Dokumentation:** Deutsch · [English](../../../en/guides/configuration/logging.md) · [Русский](../../../ru/guides/configuration/logging.md) ·

| Option     | Typ           | Standardwert     |
|------------|---------------|------------------|
| `logLevel` | `LogLevel`    | `LogLevel.NONE`  |
| `language` | `LogLanguage` | `LogLanguage.EN` |

```typescript
provideOfflineSync({
  logLevel: LogLevel.ALL,
  language: LogLanguage.RU,
})
```

## Warum diese Option existiert

Die Bibliothek protokolliert interne Ereignisse: Anfragen in die Warteschlange stellen, Beginn und Ende der Synchronisierung, Netzwerkfehler und Wiederholungen. Standardmäßig ist die Protokollierung **vollständig deaktiviert** — die Bibliothek schreibt nichts in die Konsole.

`logLevel` steuert die **Ausführlichkeit** der Protokolle, `language` die Sprache der Protokollnachrichten.

## LogLevel

| Wert               | Was protokolliert wird                  |
|--------------------|-----------------------------------------|
| `LogLevel.NONE`    | Es wird nichts protokolliert (Standard) |
| `LogLevel.ERROR`   | Nur Fehler                              |
| `LogLevel.WARNING` | Nur Warnungen                           |
| `LogLevel.INFO`    | Nur Informationsmeldungen               |
| `LogLevel.SUCCESS` | Nur Erfolgsmeldungen                    |
| `LogLevel.ALL`     | Alle Meldungen                          |

Jede Log-Stufe legt fest, welche Art von Meldungen ausgegeben wird. `LogLevel.ALL` aktiviert alle Meldungstypen.

## LogLanguage

Legt die Sprache der Protokollnachrichten fest und hat keine Auswirkung auf Code oder API:

| Wert             | Sprache  |
|------------------|----------|
| `LogLanguage.EN` | Englisch |
| `LogLanguage.RU` | Русский  |

```typescript
provideOfflineSync({
  logLevel: LogLevel.INFO,
  language: LogLanguage.RU,
})
```
