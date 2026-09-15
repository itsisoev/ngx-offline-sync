# Network Status Callback

**[← Back to configuration](index.md)**

> Tracking network status changes (online/offline)

**Documentation:** English · [Russian](../../ru/configuration/network-status.md)

---

The library tracks changes in the internet connection status and lets the application react to it through a callback, without having to subscribe to browser events itself.

---

## How the callback works

The option is set via `provideOfflineSync()`:

```ts
provideOfflineSync({
  onNetworkStatusChange: (offline: boolean) => {
    if (offline) {
      // show offline indicator
    } else {
      // hide offline indicator
    }
  },
})
```

The callback is invoked automatically whenever the network status changes:

* when the application goes **offline**:

  ```ts
  onNetworkStatusChange(true);
  ```

* when the connection is back **online**:

  ```ts
  onNetworkStatusChange(false);
  ```

---

## Configuration

## Available options

| Option                  | Type                         | Default | Description                                      |
|-------------------------|------------------------------|---------|--------------------------------------------------|
| `onNetworkStatusChange` | `(offline: boolean) => void` | —       | Callback invoked when the network status changes |

**Example:**

```ts
provideOfflineSync({
  onNetworkStatusChange: (offline) => {
    if (offline) {
      // show offline indicator
    } else {
      // hide offline indicator
    }
  },
});
```

The library doesn't impose any particular UI — the application decides how to display the network indicator, for example:

```text
You are offline
```

or:

```text
Back online
```

---

## Where this happens

`onNetworkStatusChange` is invoked independently of the queue logic — as soon as `NetworkStatusService` notices a change in the browser's network status:

```text
Browser Network Status
          │
          ▼
NetworkStatusService
          │
          ▼
onNetworkStatusChange()
          │
          ▼
      Application
```

---

## Full configuration

`onNetworkStatusChange` can be used together with the other settings:

```ts
provideOfflineSync({
  batchSize: 10,
  maxQueueSize: 500,
  logLevel: LogLevel.ALL,
  language: LogLanguage.RU,

  onNetworkStatusChange: (offline) => {
    // show / hide offline indicator
  },

  retry: {
    maxAttempts: 3,
    delay: 5000,
  },
})
```
