# Max Queue Size

**[← Назад к конфигурации](index.md)**

> Ограничение размера offline queue и безопасная обработка конкурентных запросов

**Документация:** Русский · [English](../../en/configuration/max-queue-size.md)

---

Библиотека ограничивает максимальное количество запросов, которое может храниться в offline queue.

`maxQueueSize` помогает избежать неконтролируемого роста очереди и IndexedDB, если приложение долго находится офлайн.

---

## Как работает ограничение

Опция задаётся через `provideOfflineSync()`:

```ts
provideOfflineSync({
  maxQueueSize: 500,
})
```

Если опция не указана, используется значение по умолчанию:

```ts
DEFAULT_MAX_QUEUE_SIZE = 150;
```

То есть без конфигурации:

```ts
provideOfflineSync({})
```

очередь может содержать максимум **150** элементов.

Перед сохранением каждого элемента `QueueService` проверяет текущий размер очереди:

```ts
const currentSize = await this.getTotalSize();

if (currentSize >= maxQueueSize) {
  this.config.onQueueFull?.();
  return EnqueueStatus.QUEUE_FULL;
}

await this.storage.save(item);
return EnqueueStatus.QUEUED;
```

Если место есть — запрос сохраняется. Если лимит достигнут — запрос **не сохраняется**.

---

## Конфигурация

## Доступные опции

| Опция          | Тип          | По умолчанию | Описание                                           |
|----------------|--------------|--------------|----------------------------------------------------|
| `maxQueueSize` | `number`     | `150`        | Максимальное количество запросов в offline queue   |
| `onQueueFull`  | `() => void` | —            | Callback, вызываемый при достижении `maxQueueSize` |

**Пример:**

```ts
provideOfflineSync({
  maxQueueSize: 150,

  onQueueFull: () => {
    // show toast
    // show notification
    // etc.
  },
});
```

Библиотека не навязывает конкретный UI — приложение само решает, как сообщить пользователю, что offline queue заполнена:

```text
Queue is full
     ↓
ngx-offline-sync
     ↓
onQueueFull()
     ↓
Application
     ↓
Toast / Modal / Notification
```

---

## Результат добавления в очередь (EnqueueStatus)

Раньше `enqueue()` ничего не сообщал о результате:

```text
enqueue(item)
:
Promise<void>
```

Теперь метод возвращает статус:

```text
enqueue(item)
:
Promise<EnqueueStatus>
```

```ts
export enum EnqueueStatus {
  QUEUED = 'QUEUED',
  QUEUE_FULL = 'QUEUE_FULL',
}
```

**`QUEUED`** — запрос успешно добавлен:

```text
enqueue
  ↓
queue has space
  ↓
storage.save()
  ↓
QUEUED
```

**`QUEUE_FULL`** — очередь заполнена:

```text
enqueue
  ↓
queue is full
  ↓
do not save
  ↓
QUEUE_FULL
```

---

## Конкурентные запросы

Проверка размера очереди и сохранение элемента небезопасны при нескольких одновременных запросах, если выполняются независимо друг от друга.

Например, при `maxQueueSize = 10` и `currentSize = 9`, три запроса приходят одновременно:

```text
Request A → getTotalSize() → 9
Request B → getTotalSize() → 9
Request C → getTotalSize() → 9
```

Каждый из них видит, что место есть, и сохраняет свой элемент:

```text
A → save → 10
B → save → 11
C → save → 12
```

В результате `maxQueueSize = 10` мог быть превышен.

### Сериализация enqueue

Для решения операции `enqueue()` выстроены в последовательную цепочку промисов:

```text
private
enqueueChain: Promise<void> = Promise.resolve();
```

```text
enqueue A
    ↓
check A
    ↓
save A
    ↓
enqueue B
    ↓
check B
    ↓
save B
    ↓
enqueue C
```

Следующий `enqueue()` не начинает проверку размера, пока предыдущий `check + save` не завершился. При `maxQueueSize = 10` и `currentSize = 9`:

```text
A → check 9  → save → 10 → QUEUED
B → check 10 → QUEUE_FULL
C → check 10 → QUEUE_FULL
```

Несколько конкурентных offline-запросов больше не могут одновременно увидеть одно и то же устаревшее значение размера очереди.

### Устойчивость к ошибкам

Ошибка одного `storage.save()` не блокирует цепочку:

```ts
this.enqueueChain = operation.then(
  () => undefined,
  () => undefined,
);
```

```text
enqueue A
   ↓
save A → ERROR
   ↓
enqueue B
   ↓
check → save B
```

При этом сам вызывающий `enqueue A` всё равно получает свою ошибку через `await operation`.

---

## Offline Sync Interceptor

До исправления interceptor игнорировал `QUEUE_FULL`:

```text
enqueue()
   ↓
QUEUE_FULL
   ↓
ignored
   ↓
202 Accepted
```

Caller получал `{ "queued": true }`, хотя запрос фактически не был сохранён — это вводило вызывающий код в заблуждение.

Теперь interceptor обрабатывает `QUEUE_FULL`:

```ts
queue.enqueue(queueItem).then((status) => {
  if (status === EnqueueStatus.QUEUE_FULL) {
    subscriber.error(new Error('Offline queue is full'));
    return;
  }

  // normal queued response
});
```

```text
Offline request
       ↓
    enqueue
       ↓
   ┌───────────────┐
   │               │
QUEUED         QUEUE_FULL
   │               │
   ↓               ↓
  202            Error
```

**Если запрос успешно поставлен в очередь:**

```json
{
  "queued": true,
  "id": "..."
}
```

**Если очередь заполнена:**

Caller получает ошибку `Offline queue is full` и больше не получает ложный `202 Accepted`.

---

## Полная конфигурация

`maxQueueSize` можно использовать вместе с остальными настройками:

```ts
provideOfflineSync({
  batchSize: 10,
  maxQueueSize: 500,
  logLevel: LogLevel.ALL,
  language: LogLanguage.RU,

  onQueueFull: () => {
    // show toast
  },

  retry: {
    maxAttempts: 3,
    delay: 5000,
  },
})
```
