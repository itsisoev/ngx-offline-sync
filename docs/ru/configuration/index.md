# Конфигурация

**[← Назад к оглавлению](../README.md)**

**Документация:** Русский · [English](../../en/configuration/index.md)

`provideOfflineSync()` принимает необязательный объект конфигурации, который позволяет настроить поведение очереди, синхронизации, логирования и кэширования приложения.

```typescript
provideOfflineSync({
  batchSize: 10,
  maxQueueSize: 500,
  logLevel: LogLevel.ALL,
  language: LogLanguage.RU,

  appShellCache: {
    enabled: true,
  },

  onQueueFull: () => {
    // show toast
  },

  onNetworkStatusChange: (offline) => {
    // show / hide offline indicator
  },
})
```

## Доступные опции

| Опция                   | Тип                          | По умолчанию         | Описание                                                                                                              |
|-------------------------|------------------------------|----------------------|-----------------------------------------------------------------------------------------------------------------------|
| `batchSize`             | `number`                     | `1`                  | Количество запросов из очереди, обрабатываемых параллельно во время синхронизации. [Подробнее →](batch-size.md)       |
| `maxQueueSize`          | `number`                     | `150`                | Максимальное количество запросов, которое может храниться в offline queue. [Подробнее →](max-queue-size.md)           |
| `onQueueFull`           | `() => void`                 | —                    | Callback, вызываемый при достижении `maxQueueSize`. [Подробнее →](max-queue-size.md)                                  |
| `onNetworkStatusChange` | `(offline: boolean) => void` | —                    | Callback, вызываемый при изменении состояния сети (online/offline). [Подробнее →](network-status.md)                  |
| `logLevel`              | `LogLevel`                   | `LogLevel.NONE`      | Уровень детализации логов: от полного отсутствия логирования до полного трейса. [Подробнее →](logging.md)             |
| `language`              | `LogLanguage`                | `LogLanguage.EN`     | Язык текстовых сообщений в логах. [Подробнее →](logging.md)                                                           |
| `retry`                 | `IRetryConfig`               | —                    | Настройки автоматических повторных попыток при временных ошибках. [Подробнее →](retry.md)                             |
| `appShellCache`         | `{ enabled: boolean }`       | `{ enabled: false }` | Кэширование файлов приложения через Service Worker, чтобы оно открывалось без сети. [Подробнее →](app-shell-cache.md) |

## App Shell Cache

Опция `appShellCache` отвечает за то, чтобы приложение **открывалось после перезагрузки страницы без интернета**. Service Worker сохраняет файлы приложения (HTML, JavaScript, CSS, шрифты, изображения) в `Cache Storage` браузера и отдаёт их, когда сети нет.

```typescript
provideOfflineSync({
  appShellCache: {
    enabled: true,
  },
})
```

> App Shell Cache не заменяет offline queue: он отвечает за загрузку самого приложения, а очередь — за отправку `POST`, `PUT`, `PATCH` и `DELETE` запросов. [Подробнее → App Shell Cache](app-shell-cache.md)

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
