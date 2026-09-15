# Network Status Callback

**[← Назад к конфигурации](index.md)**

> Отслеживание изменения состояния сети (online/offline)

**Документация:** Русский · [English](../../en/configuration/network-status.md)

---

Библиотека отслеживает изменение состояния интернет-соединения и позволяет приложению реагировать на это через callback, не подписываясь самостоятельно на события браузера.

---

## Как работает callback

Опция задаётся через `provideOfflineSync()`:

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

Callback вызывается автоматически при изменении состояния сети:

* когда приложение становится **offline**:

  ```ts
  onNetworkStatusChange(true);
  ```

* когда соединение снова **online**:

  ```ts
  onNetworkStatusChange(false);
  ```

---

## Конфигурация

## Доступные опции

| Опция                   | Тип                          | По умолчанию | Описание                                          |
|-------------------------|------------------------------|--------------|---------------------------------------------------|
| `onNetworkStatusChange` | `(offline: boolean) => void` | —            | Callback, вызываемый при изменении состояния сети |

**Пример:**

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

Библиотека не навязывает конкретный UI — приложение само решает, как отображать индикатор сети, например:

```text
You are offline
```

или:

```text
Back online
```

---

## Где это происходит

`onNetworkStatusChange` вызывается независимо от логики очереди — сразу как только `NetworkStatusService` замечает изменение состояния сети браузера:

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

## Полная конфигурация

`onNetworkStatusChange` можно использовать вместе с остальными настройками:

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
