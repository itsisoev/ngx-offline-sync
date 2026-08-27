# Подключение

**Документация:** [English](../../en/guides/setup.md) · Русский · [日本語]()
**[← Назад к оглавлению](../README.md)**

Добавьте `provideOfflineSync()` и `offlineSyncInterceptor` в конфигурацию приложения:

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

После подключения библиотека самостоятельно управляет очередью, хранилищем, синхронизацией и повторными попытками. Дополнительная регистрация внутренних сервисов не требуется.

> `provideOfflineSync()` также принимает необязательный объект конфигурации (например, `batchSize`). Полный список опций — в разделе [Конфигурация](configuration/index.md).

## Что дальше

- [Использование](usage.md) — как отправлять запросы
- [Конфигурация](configuration/index.md) — настройка поведения очереди
