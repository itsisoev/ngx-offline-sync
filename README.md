# ngx-offline-sync

<div>
  <img src="https://img.shields.io/npm/dt/ngx-offline-sync" />
  <a href="https://www.npmjs.com/package/ngx-offline-sync">
    <img src="https://img.shields.io/badge/npm-ngx--offline--sync-CB3837?logo=npm&logoColor=white" alt="npm package" />
  </a>
  <img src="https://img.shields.io/github/stars/itsisoev/ngx-offline-sync" />
</div>

An Angular library that automatically saves HTTP requests when there is no internet connection and synchronizes them once the connection is restored.

**Documentation:** English · [Русский](docs/ru/README.md) · [日本語](docs/ja/README.md)

## Contents

- [Features](#features)
- [Installation](#installation)
- [Setup](#setup)
- [Usage](#usage)
- [How it works](#how-it-works)
- [Request statuses](#request-statuses)
- [Retries](#retries)
- [Architecture](#architecture)
- [Roadmap](#roadmap)
- [Limitations](#limitations)
- [License](#license)

## Features

- Automatically queues HTTP requests when there is no network connection
- Persists the queue in IndexedDB
- Automatically syncs the queue once the connection is restored
- Processes requests sequentially
- Retries failed requests
- Tracks the status of each request
- Supports `POST`, `PUT`, `PATCH`, and `DELETE`

## Installation

```bash
npm install ngx-offline-sync
```

## Setup

Add `provideOfflineSync()` and `offlineSyncInterceptor` to your application configuration:

```ts
import { ApplicationConfig } from '@angular/core';

import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

import {
  provideOfflineSync,
  offlineSyncInterceptor,
} from 'ngx-offline-sync';

export const appConfig: ApplicationConfig = {
  providers: [
    provideOfflineSync(),

    provideHttpClient(
      withInterceptors([
        offlineSyncInterceptor,
      ]),
    ),
  ],
};
```

Once set up, the library manages the queue, storage, synchronization, and retries on its own. No additional registration of internal services is required.

## Usage

Once set up, the library doesn't require any special API for sending requests. Just use the regular `HttpClient`:

```ts
this.http.post('/api/products', product).subscribe();
```

- If an internet connection is available, the request is sent as usual.
- If the connection is unavailable, the request is automatically added to the queue.

## How it works

### Internet available

```
HttpClient
    ↓
offlineSyncInterceptor
    ↓
HTTP request
    ↓
Server
```

The request is sent directly.

### Internet unavailable

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

The request is saved locally and waits for the connection to be restored.

### Internet restored

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

The queue is processed automatically.

## Request statuses

Each request has one of the following statuses:

| Status | Description |
|---|---|
| `PENDING` | The request is waiting to be executed |
| `SYNCING` | The request is being executed |
| `COMPLETED` | The request was executed successfully |
| `FAILED` | The request could not be executed |

Basic request lifecycle:

```
PENDING → SYNCING → COMPLETED
```

On error:

```
SYNCING → RetryPolicy → PENDING → Retry
```

If the request should no longer be retried:

```
SYNCING → FAILED
```

## Retries

If synchronization fails, the library passes the error to the `RetryPolicy`.

The policy determines:

- whether the request should be retried;
- the delay before the next attempt;
- when the request should be marked as `FAILED`.

Overall lifecycle:

```
SYNCING → Request failed → RetryPolicy → PENDING → Retry
```

After a successful execution:

```
PENDING → SYNCING → COMPLETED
```

If the number of attempts exceeds the allowed limit:

```
SYNCING → Request failed → FAILED
```

## Architecture

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

### Core components

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
Retrieves requests from the queue, executes them via `HttpClient`, and updates their status.

**RetryPolicy**
Defines the rules for retrying failed requests.

## Roadmap

The project is under active development. Planned improvements include:

- Support for configurable retry strategies
- Extended queue configuration options
- Request priority management
- The ability to cancel and remove requests from the queue
- Extended sync-state management
- Improved error and network-state handling
- Extended IndexedDB configuration options
- Additional tools for monitoring the queue
- Expanded test coverage
- Improved documentation and usage examples

## Limitations

- Currently, the library is designed to sync the following HTTP methods: `POST`, `PUT`, `PATCH`, `DELETE`.
- `GET` requests are not added to the offline queue.
- The queue is stored locally in the browser's IndexedDB.

## License

See [LICENSE](LICENSE).
