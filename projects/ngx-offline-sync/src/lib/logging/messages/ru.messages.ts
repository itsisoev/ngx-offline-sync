import { LogEvent } from '../enums/log-event.enum';

export const ruMessages: Record<LogEvent, string> = {
  [LogEvent.SYNC_STARTED]: 'Синхронизация началась',
  [LogEvent.SYNC_COMPLETED]: 'Синхронизация завершена',
  [LogEvent.SYNC_PROCESSING]: 'Обработка {{count}} запросов из очереди',
  [LogEvent.SYNC_PROGRESS]: 'Прогресс синхронизации: {{processed}} / {{total}}',

  [LogEvent.REQUEST_INTERCEPTED]: 'Запрос перехвачен в автономном режиме',
  [LogEvent.REQUEST_QUEUED]: 'Запрос добавлен в очередь',
  [LogEvent.REQUEST_DEQUEUED]: 'Запрос взят из очереди',
  [LogEvent.REQUEST_SYNCED]: 'Запрос успешно синхронизирован',
  [LogEvent.REQUEST_SYNC_FAILED]: 'Не удалось синхронизировать запрос',
  [LogEvent.REQUEST_FAILED_PERMANENTLY]: 'Не удалось синхронизировать запрос после всех попыток',
  [LogEvent.REQUEST_QUEUE_FAILED]: 'Не удалось добавить запрос в очередь',

  [LogEvent.RETRY_SCHEDULED]: 'Повторная попытка запланирована',
  [LogEvent.RETRY_STARTED]: 'Повторная попытка началась',

  [LogEvent.NETWORK_ONLINE]: 'Сеть доступна',
  [LogEvent.NETWORK_OFFLINE]: 'Сеть недоступна',

  [LogEvent.QUEUE_EMPTY]: 'Синхронизация пропущена: очередь пуста',
  [LogEvent.QUEUE_CLEARED]: 'Очередь очищена',

  [LogEvent.SYNC_STATS]:
    'Обработано: {{processed}}, Успешно: {{successful}}, Ошибок: {{failed}}, Повторных попыток: {{retried}}, Время: {{duration}}',
};
