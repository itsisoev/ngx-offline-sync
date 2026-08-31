# Architecture

**[← Back to overview](../../../README.md)**

**Documentation:** English · [Deutsch](../../de/guides/architecture.md) · [Русский](../../ru/guides/architecture.md)

The library is split into several core components:

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

## Core components

**offlineSyncInterceptor**
Intercepts HTTP requests and determines whether a request needs to be queued.

**NetworkStatusService**
Tracks the state of the internet connection and notifies the library when it's restored.

**QueueService**
Manages the request queue: adding, retrieving, updating, and removing items.

**IndexedDbStorage**
Uses IndexedDB for persistent local storage of the queue.

**SyncCoordinatorService**
Watches for the connection to be restored and triggers queue synchronization.

**SyncService**
Retrieves requests from the queue, executes them via `HttpClient`, and updates their status. This is where the [batchSize](configuration/batch-size.md) setting is applied, controlling how many requests are processed in parallel.

**RetryPolicy**
Defines the rules for retrying failed requests — see [Retries](retries.md).

## Next

- [How it works](how-it-works.md) — the same request flow, broken down by scenario (online / offline / restored)
- [Configuration](configuration/index.md) — which components can be tuned
