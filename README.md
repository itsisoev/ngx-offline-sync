# ngx-offline-sync

<div>
  <img src="https://img.shields.io/npm/dt/ngx-offline-sync" alt="npm downloads"/>
  <a href="https://www.npmjs.com/package/ngx-offline-sync">
    <img src="https://img.shields.io/badge/npm-ngx--offline--sync-CB3837?logo=npm&logoColor=white" alt="npm package"/>
  </a>
  <img src="https://img.shields.io/github/stars/itsisoev/ngx-offline-sync" alt="GitHub stars"/>
</div>

**Documentation:** English · [Русский](docs/ru/README.md)

> **Offline-first HTTP request synchronization for Angular.**

`ngx-offline-sync` is an open-source Angular library designed to keep HTTP requests safe when the network connection is temporarily unavailable.

When the application goes offline, supported HTTP requests are automatically added to a local queue and persisted in **IndexedDB**. Once the connection is restored, the library automatically starts synchronization and processes the queued requests.

You don't need to build your own request queue, manage IndexedDB, or implement network recovery logic — the library handles this work for you, while keeping the familiar Angular `HttpClient` API.

## Table of contents

* [How it works](#how-it-works)
* [Features](#features)
* [Supported HTTP methods](#supported-http-methods)
* [Installation](#installation)
* [Quick Start](#quick-start)
* [App Shell Cache](#app-shell-cache)
* [Usage](#usage)
* [Configuration](#configuration)
* [Request statuses](#request-statuses)
* [Retries](#retries)
* [Architecture](#architecture)
* [Limitations](#limitations)
* [Roadmap](#roadmap)
* [Project status](#project-status)
* [License](#license)

---

## How it works

### Online

<p align="center">
  <img src="docs/assets/gifs/01-online.gif" alt="ngx-offline-sync — online" />
</p>

When an internet connection is available, requests are executed normally through Angular's `HttpClient`.

```
HttpClient
    ↓
offlineSyncInterceptor
    ↓
HTTP request
    ↓
Server
```

The request is sent directly, with no delays or extra logic.

### Offline

<p align="center">
  <img src="docs/assets/gifs/02-offline.gif" alt="ngx-offline-sync — offline" />
</p>

When the connection is unavailable, supported requests are not lost. They are stored locally and added to the pending queue.

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

The request is stored locally and waits for the connection to be restored. The user doesn't see a network error — the request simply moves to the `PENDING` status.

### Connection restored

<p align="center">
  <img src="docs/assets/gifs/03-sync.gif" alt="ngx-offline-sync — synchronization after reconnect" />
</p>

Once the connection is restored, the library automatically starts processing the queue and synchronizes the stored requests.

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

The queue is processed automatically, without any involvement from the developer — `NetworkStatusService` detects that the network is back and triggers synchronization.

## Features

* **Automatic request queueing** — supported HTTP requests are automatically saved when the network is unavailable.
* **IndexedDB** — the queue is stored locally and persists across page reloads.
* **Automatic synchronization** — queued requests are processed after the connection is restored.
* **App Shell Cache** — a Service Worker stores the application files, so the app opens after a page reload even without a network.
* **Installation via `ng add`** — the Service Worker is added to your project automatically.
* **Batch processing** — multiple requests can be processed in parallel using `batchSize`.
* **Automatic retries** — failed requests can be retried automatically according to the retry policy.
* **Angular HTTP interceptor** — the library integrates directly with `HttpClient`.
* **No special API** — the regular `HttpClient` is used to send requests.
* **Configurable synchronization** — queue and synchronization behavior can be customized through configuration.
* **Configurable logging** — logging verbosity can be selected using `LogLevel`.
* **Multiple logging languages** — log messages support English and Russian via `LogLanguage`.
* **Logging events** — the library provides typed events for tracking queue and synchronization state.
* **Sync statistics** — the library collects data on the number of processed, successful, failed, and retried requests.
* **Configurable Log Transport** — the default `ConsoleLogTransport` can be replaced with a custom implementation via `LOG_TRANSPORT`.

## Supported HTTP methods

The library currently queues the following HTTP methods:

* `POST`
* `PUT`
* `PATCH`
* `DELETE`

`GET` requests are not stored in the offline queue. See the [Limitations](#limitations) section for more information.

## Installation

For Angular applications, use `ng add`:

```bash
ng add ngx-offline-sync
```

The command installs the library and sets up the Service Worker for you:

* copies `ngx-offline-sync-sw.js` to the `src/assets/` folder;
* adds it to `assets` in `angular.json`;
* makes it available at `/ngx-offline-sync-sw.js`.

You don't need to edit `angular.json` manually.

<details>
<summary><b>Installing via npm</b></summary>

<br>

```bash
npm install ngx-offline-sync
```

This installs only the package itself — the Service Worker is **not** set up automatically. If you plan to use [App Shell Cache](#app-shell-cache), it's better to choose `ng add`.

</details>

## Quick Start

Add `provideOfflineSync()` and `offlineSyncInterceptor` to your application configuration:

```typescript
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

That's it! The library takes care of the queue, local storage, synchronization, and retries on its own. There is no need to register internal services.

> `provideOfflineSync()` accepts an optional configuration object: `batchSize`, `maxQueueSize`, `retry`, logging, `appShellCache`, and more. See the [Configuration](docs/en/configuration/index.md) section for the full list.

## App Shell Cache

What if the user **reloads the page while offline**? Without a cache, the application simply won't open.

`App Shell Cache` solves this problem: a Service Worker stores the application files (HTML, JavaScript, CSS, fonts, images) in the browser's `Cache Storage` and serves them when there is no network.

### How to enable

Pass `appShellCache.enabled` to `provideOfflineSync()`:

```typescript
provideOfflineSync({
  appShellCache: {
    enabled: true,
  },
}),
```

The rest of your `appConfig` stays the same as in the [Quick Start](#quick-start) section.

### How it works

```text
Application
    ↓
Service Worker
    ↓
Cache Storage
    ↓
HTML / JavaScript / CSS / fonts / images
```

If the page is reloaded without internet, the Service Worker takes the saved files from `Cache Storage`.

### App Shell Cache vs. offline queue — what's the difference?

| Feature         | Responsible for                                                                    |
|-----------------|------------------------------------------------------------------------------------|
| App Shell Cache | The app **opens** without a network                                                |
| Offline queue   | `POST`, `PUT`, `PATCH`, `DELETE` requests **are sent** once the network is back    |

These are two independent features, and they work great together.

## Usage

Sending requests doesn't require any special API. Use the regular Angular `HttpClient`:

```typescript
this.http.post('/api/products', product).subscribe();
```

* When a network connection is available, the request behaves normally.
* When the connection is unavailable, a supported request is automatically stored in the queue and processed once the connection is restored.

No extra wrapper, separate service, or manual queue management is required — `offlineSyncInterceptor` intercepts the request before it goes out over the network and decides how to handle it.

## Configuration

The library's behavior is customized through `provideOfflineSync()`. See:

* [Configuration](docs/en/configuration/index.md)
* [App Shell Cache](docs/en/configuration/index.md#app-shell-cache)
* [batchSize](docs/en/configuration/batch-size.md)
* [maxQueueSize and onQueueFull](docs/en/configuration/max-queue-size.md)
* [onNetworkStatusChange](docs/en/configuration/network-status.md)
* [logLevel and language](docs/en/configuration/logging.md)
* [Retry Policy](docs/en/configuration/retry.md)
* [Per-request priority](docs/en/configuration/priority-queue.md)

## Request statuses

Each request in the queue has one of the following statuses:

| Status      | Description                        |
|-------------|------------------------------------|
| `PENDING`   | The request is waiting to run      |
| `SYNCING`   | The request is being executed      |
| `COMPLETED` | The request completed successfully |
| `FAILED`    | The request could not be completed |

### Main lifecycle

```
PENDING → SYNCING → COMPLETED
```

The request enters the queue (`PENDING`), then starts executing (`SYNCING`), and receives the final `COMPLETED` status on success.

### On failure

```
SYNCING → RetryPolicy → PENDING → Retry
```

If a request fails, `RetryPolicy` decides whether to retry it — see the [Retries](#retries) section.

### When the request should no longer be retried

```
SYNCING → FAILED
```

When `RetryPolicy` decides that further attempts don't make sense (for example, the retry limit has been reached), the request moves to `FAILED` and stays in that status.

## Retries

If synchronization fails, the library passes the error to `RetryPolicy`.

The policy determines:

* whether the request should be retried;
* the delay before the next attempt;
* when the request should receive the `FAILED` status.

### Lifecycle on failure

```
SYNCING → Request failed → RetryPolicy → PENDING → Retry
```

After a failed attempt, the request returns to `PENDING` and waits for the next synchronization attempt.

### After a successful attempt

```
PENDING → SYNCING → COMPLETED
```

### When retries are exhausted

```
SYNCING → Request failed → FAILED
```

Once the number of attempts exceeds the allowed limit, the request permanently moves to `FAILED` and no longer takes part in synchronization.

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
Intercepts HTTP requests and determines whether the request needs to be queued.

**NetworkStatusService**
Tracks the state of the internet connection and notifies the library when the network is restored.

**QueueService**
Manages the request queue: adding, retrieving, updating, and removing items.

**IndexedDbStorage**
Uses IndexedDB to persist the queue locally.

**SyncCoordinatorService**
Watches for the connection being restored and triggers queue synchronization.

**SyncService**
Retrieves requests from the queue, executes them via `HttpClient`, and updates their status. This is where the [batchSize](docs/en/configuration/batch-size.md) setting is applied, controlling how many requests are processed in parallel.

**RetryPolicy**
Defines the rules for retrying failed requests — see the [Retries](#retries) section.

**Service Worker (`ngx-offline-sync-sw.js`)**
Works separately from the queue: when [App Shell Cache](#app-shell-cache) is enabled, it stores the application files in `Cache Storage` and serves them when there is no network.

## Limitations

* The library is designed to synchronize the following HTTP methods: `POST`, `PUT`, `PATCH`, `DELETE`.
* `GET` requests are not placed in the offline queue.
* The queue is stored locally in the browser's IndexedDB.
* App Shell Cache is only responsible for loading the application itself and does not replace the offline queue.

## Roadmap

The project is under active development. Planned improvements include:

* Support for configurable retry strategies
* Extended queue configuration
* Request priority management
* The ability to cancel and remove requests from the queue
* Extended control over synchronization state
* Improved error and network-state handling
* Extended IndexedDB configuration options
* Additional tools for monitoring the queue
* Expanded test coverage
* Improved documentation and usage examples

As each major item is implemented, it will get its own file under [Configuration](docs/en/configuration/index.md) — similar to [batchSize](docs/en/configuration/batch-size.md).

## Project status

`ngx-offline-sync` is an actively evolving open-source project.

The project is gradually moving toward more flexible configuration, improved error and network-state handling, expanded test coverage, and further improvements to the documentation.

## License

See [LICENSE](LICENSE).
