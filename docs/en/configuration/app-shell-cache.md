# App Shell Cache

**[← Back to configuration](index.md)**

**Documentation:** English · [Русский](../../ru/configuration/app-shell-cache.md)

`appShellCache` lets your application **open without an internet connection**: a Service Worker stores the application files in the browser's `Cache Storage` and serves them when the network is unavailable.

## Why do you need it

The offline queue stores requests while there is no network. But if the user **reloads the page** while offline, the browser cannot download the Angular application itself — so the queue never gets a chance to run.

App Shell Cache solves this problem. The *app shell* is the set of files required to start the application:

* HTML;
* JavaScript;
* CSS;
* fonts;
* images and other supported resources.

## How to enable

Pass `appShellCache.enabled` to `provideOfflineSync()`:

```typescript
provideOfflineSync({
  appShellCache: {
    enabled: true,
  },
})
```

The rest of your `appConfig` stays the same as in the [Setup](../../../README.md#setup) section.

## Options

| Option    | Type      | Default | Description                                                  |
|-----------|-----------|---------|--------------------------------------------------------------|
| `enabled` | `boolean` | `false` | Enables caching of application files via the Service Worker. |

## What is required

App Shell Cache needs the Service Worker file — `ngx-offline-sync-sw.js`, available at `/ngx-offline-sync-sw.js`.

`ng add` sets it up for you:

```bash
ng add ngx-offline-sync
```

The command copies the file to `src/assets/` and adds it to `assets` in `angular.json`. If you installed the library with `npm install`, the automatic setup did not run — execute `ng add ngx-offline-sync` to run the installation schematic.

> A Service Worker only works over **HTTPS** or on **localhost**.

## How it works

```text
Application
    ↓
Service Worker
    ↓
Cache Storage
    ↓
HTML / JavaScript / CSS / fonts / images
```

1. The user opens the app **while online** — the Service Worker saves the files to `Cache Storage`.
2. Later, the page is reloaded **while offline**.
3. The Service Worker takes the saved files from `Cache Storage`, and the app opens.

## App Shell Cache vs. offline queue

These are two independent features that work great together:

| Feature         | Responsible for                                                                 |
|-----------------|---------------------------------------------------------------------------------|
| App Shell Cache | The app **opens** without a network                                             |
| Offline queue   | `POST`, `PUT`, `PATCH`, `DELETE` requests **are sent** once the network is back |

## How to test it

1. Run the app **while online** and wait until it fully loads.
2. Open DevTools → **Application** → **Service Workers** and make sure the Service Worker is active.
3. Open DevTools → **Network** and switch on **Offline** mode.
4. Reload the page — the app should open.

## Common problems

| Problem                                 | What to check                                                                              |
|-----------------------------------------|--------------------------------------------------------------------------------------------|
| The app does not open without a network | Did you open it at least once **while online**? Is `appShellCache.enabled: true` set?      |
| The Service Worker does not appear      | Did you run `ng add ngx-offline-sync`? Does `/ngx-offline-sync-sw.js` open in the browser? |
| The Service Worker does not register    | Is the app served over HTTPS or on localhost?                                              |
