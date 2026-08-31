# logLevel и language (логирование)

**[← Назад к конфигурации](index.md)**

**Документация:** [English](../../../en/guides/configuration/logging.md) · Русский · [Deutsch](../../../de/guides/configuration/logging.md)

| Опция      | Тип           | По умолчанию     |
|------------|---------------|------------------|
| `logLevel` | `LogLevel`    | `LogLevel.NONE`  |
| `language` | `LogLanguage` | `LogLanguage.EN` |

```typescript
provideOfflineSync({
  logLevel: LogLevel.ALL,
  language: LogLanguage.RU,
})
```

## Зачем нужна эта опция

Библиотека логирует внутренние события: постановку запросов в очередь, старт и завершение синхронизации, ошибки сети, ретраи. По умолчанию логирование **полностью отключено** — библиотека не пишет ничего в консоль.

`logLevel` управляет **детализацией** логов, `language` — языком, на котором выводятся сообщения.

## LogLevel

| Значение           | Что логируется                         |
|--------------------|----------------------------------------|
| `LogLevel.NONE`    | Ничего не логируется (по умолчанию)    |
| `LogLevel.ERROR`   | Только ошибки                          |
| `LogLevel.WARNING` | Только предупреждения                  |
| `LogLevel.INFO`    | Только информационные сообщения        |
| `LogLevel.SUCCESS` | Только сообщения об успешных операциях |
| `LogLevel.ALL`     | Все сообщения                          |

Каждый уровень логирования определяет, какие сообщения будут выводиться. `LogLevel.ALL` включает все типы сообщений.

## LogLanguage

Определяет язык текстовых сообщений в логах (не влияет на код или API):

| Значение         | Язык    |
|------------------|---------|
| `LogLanguage.EN` | English |
| `LogLanguage.RU` | Русский |

```typescript
provideOfflineSync({
  logLevel: LogLevel.INFO,
  language: LogLanguage.RU,
})
```
