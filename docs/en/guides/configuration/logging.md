# logLevel and language (logging)

**[← Back to configuration](index.md)**

**Documentation:** English · [German](../../../de/guides/configuration/logging.md) · [Русский](../../../ru/guides/configuration/logging.md) · [日本語]()

| Option     | Type          | Default          |
|------------|---------------|------------------|
| `logLevel` | `LogLevel`    | `LogLevel.NONE`  |
| `language` | `LogLanguage` | `LogLanguage.EN` |

```typescript
provideOfflineSync({
  logLevel: LogLevel.ALL,
  language: LogLanguage.RU,
})
```

## Why this option exists

The library logs internal events: queuing requests, starting and finishing sync, network errors, retries. By default logging is **fully disabled** — the library writes nothing to the console.

`logLevel` controls the **verbosity** of the logs, `language` controls the language of the log messages.

## LogLevel

| Value              | What gets logged            |
|--------------------|-----------------------------|
| `LogLevel.NONE`    | Nothing is logged (default) |
| `LogLevel.ERROR`   | Errors only                 |
| `LogLevel.WARNING` | Warnings only               |
| `LogLevel.INFO`    | Info messages only          |
| `LogLevel.SUCCESS` | Success messages only       |
| `LogLevel.ALL`     | All messages                |

Levels are cumulative — each next level includes all the previous ones.

## LogLanguage

Sets the language of the log messages (doesn't affect code or the API):

| Value            | Language |
|------------------|----------|
| `LogLanguage.EN` | English  |
| `LogLanguage.RU` | Русский  |

```typescript
provideOfflineSync({
  logLevel: LogLevel.INFO,
  language: LogLanguage.RU,
})
```
