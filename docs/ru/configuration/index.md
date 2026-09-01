# Конфигурация

**[← Назад к оглавлению](../README.md)**

**Документация:** Русский · [English](../../en/configuration/index.md) · [Deutsch](../../de/configuration/index.md)

`provideOfflineSync()` принимает необязательный объект конфигурации, который позволяет настроить поведение очереди, синхронизации и логирования.

```typescript
provideOfflineSync({
  batchSize: 10,
  logLevel: LogLevel.ALL,
  language: LogLanguage.RU,
})
```

## Доступные опции

| Опция       | Тип           | По умолчанию     | Описание                                                                                                        |
|-------------|---------------|------------------|-----------------------------------------------------------------------------------------------------------------|
| `batchSize` | `number`      | `1`              | Количество запросов из очереди, обрабатываемых параллельно во время синхронизации. [Подробнее →](batch-size.md) |
| `logLevel`  | `LogLevel`    | `LogLevel.NONE`  | Уровень детализации логов: от полного отсутствия логирования до полного трейса. [Подробнее →](logging.md)       |
| `language`  | `LogLanguage` | `LogLanguage.EN` | Язык текстовых сообщений в логах. [Подробнее →](logging.md)                                                     |

## Приоритет отдельных запросов

Помимо глобальных опций `provideOfflineSync()`, библиотека позволяет задавать приоритет **для конкретного запроса** — какие операции должны синхронизироваться раньше остальных.

Приоритет устанавливается не через `provideOfflineSync()`, а точечно, на уровне запроса, с помощью `HttpContext`:

```typescript
const context = new HttpContext().set(
  OFFLINE_SYNC_PRIORITY,
  QueuePriority.HIGH,
);

this.http.post('/api/orders', order, {
  context,
});
```

Доступны три уровня: `HIGH`, `NORMAL` (по умолчанию) и `LOW`. [Подробнее → Priority Queue](priority-queue.md)
