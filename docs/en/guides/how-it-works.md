# How it works

**[← Back to overview](../../../README.md)**

**Documentation:** English · [Deutsch](../../de/guides/how-it-works.md) · [Русский](../../ru/guides/how-it-works.md)

The library goes through three scenarios depending on the network state.

## Internet available

```
HttpClient
    ↓
offlineSyncInterceptor
    ↓
HTTP request
    ↓
Server
```

The request is sent directly, with no delay or extra logic.

## Internet unavailable

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

The request is saved locally and waits for the connection to be restored. The user doesn't see a network error — the request simply moves to `PENDING`.

## Internet restored

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

The queue is processed automatically, with no action from the developer — `NetworkStatusService` detects the reconnect and triggers synchronization.

## Next

- [Request statuses](statuses.md) — the full list of statuses and transitions
- [Architecture](architecture.md) — which services are involved at each step
