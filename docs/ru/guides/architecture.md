# Архитектура

**[← Назад к оглавлению](../README.md)**

**Документация:** [English](../../en/guides/architecture.md) · Русский · [日本語]()

Библиотека разделена на несколько основных компонентов:

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

## Основные компоненты

**offlineSyncInterceptor**
Перехватывает HTTP-запросы и определяет, необходимо ли поместить запрос в очередь.

**NetworkStatusService**
Отслеживает состояние интернет-соединения и сообщает библиотеке о восстановлении сети.

**QueueService**
Управляет очередью запросов: добавлением, получением, обновлением и удалением элементов.

**IndexedDbStorage**
Использует IndexedDB для постоянного локального хранения очереди.

**SyncCoordinatorService**
Отслеживает восстановление соединения и запускает синхронизацию очереди.

**SyncService**
Получает запросы из очереди, выполняет их через `HttpClient` и обновляет их статус. Именно здесь применяется настройка [batchSize](configuration/batch-size.md), определяющая, сколько запросов обрабатывается параллельно.

**RetryPolicy**
Определяет правила повторного выполнения неуспешных запросов — см. [Повторные попытки](retries.md).

## Что дальше

- [Как это работает](how-it-works.md) — тот же путь запроса, но по сценариям (online / offline / restored)
- [Конфигурация](configuration/index.md) — какие компоненты можно настраивать
