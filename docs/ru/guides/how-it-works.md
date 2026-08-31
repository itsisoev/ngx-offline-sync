# Как это работает

**[← Назад к оглавлению](../README.md)**

**Документация:** [English](../../en/guides/how-it-works.md) · [Deutsch](../../de/guides/how-it-works.md) · Русский

Библиотека проходит через три сценария в зависимости от состояния сети.

## Интернет доступен

```
HttpClient
    ↓
offlineSyncInterceptor
    ↓
HTTP request
    ↓
Server
```

Запрос отправляется напрямую, без задержек и дополнительной логики.

## Интернет отсутствует

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

Запрос сохраняется локально и ожидает восстановления соединения. Пользователь не видит ошибки сети — запрос просто переходит в статус `PENDING`.

## Интернет восстановлен

```
NetworkStatusService
    ↓
SyncCoordinatorService
    ↓
SyncService
    ↓
SYNCING
    ↓
HTTP request
    ↓
COMPLETED
```

Очередь обрабатывается автоматически, без участия разработчика — `NetworkStatusService` замечает восстановление сети и запускает синхронизацию.

## Что дальше

- [Статусы запросов](statuses.md) — полный список статусов и переходов между ними
- [Архитектура](architecture.md) — какие сервисы участвуют в каждом шаге
