import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';

import { describe, expect, it, vi } from 'vitest';

import { LoggerService } from './logger.service';

import { LOG_TRANSPORT, LogEvent, LogLanguage, LogLevel } from '../';

import { IOfflineSyncConfig, OFFLINE_SYNC_CONFIG } from '../../config';

function createLogger(
  config: IOfflineSyncConfig = {
    logLevel: LogLevel.ALL,
    language: LogLanguage.EN,
  },
) {
  const transport = {
    write: vi.fn(),
  };

  const injector = createEnvironmentInjector(
    [
      {
        provide: OFFLINE_SYNC_CONFIG,
        useValue: config,
      },
      {
        provide: LOG_TRANSPORT,
        useValue: transport,
      },
    ],
    null as never,
  );

  const logger = runInInjectionContext(injector, () => new LoggerService());

  return {
    logger,
    transport,
    injector,
  };
}

describe('LoggerService', () => {
  it('should write INFO log', () => {
    const { logger, transport, injector } = createLogger();

    logger.info(LogEvent.SYNC_STARTED);

    expect(transport.write).toHaveBeenCalledTimes(1);

    expect(transport.write).toHaveBeenCalledWith(
      expect.objectContaining({
        level: LogLevel.INFO,
        event: LogEvent.SYNC_STARTED,
        message: 'Synchronization started',
      }),
    );

    injector.destroy();
  });

  it('should write SUCCESS log', () => {
    const { logger, transport, injector } = createLogger({
      logLevel: LogLevel.SUCCESS,
      language: LogLanguage.EN,
    });

    logger.success(LogEvent.SYNC_COMPLETED);

    expect(transport.write).toHaveBeenCalledTimes(1);

    expect(transport.write).toHaveBeenCalledWith(
      expect.objectContaining({
        level: LogLevel.SUCCESS,
        event: LogEvent.SYNC_COMPLETED,
        message: 'Synchronization completed',
      }),
    );

    injector.destroy();
  });

  it('should write WARNING log', () => {
    const { logger, transport, injector } = createLogger({
      logLevel: LogLevel.WARNING,
      language: LogLanguage.EN,
    });

    logger.warning(LogEvent.RETRY_SCHEDULED);

    expect(transport.write).toHaveBeenCalledTimes(1);

    expect(transport.write).toHaveBeenCalledWith(
      expect.objectContaining({
        level: LogLevel.WARNING,
        event: LogEvent.RETRY_SCHEDULED,
        message: 'Retry scheduled',
      }),
    );

    injector.destroy();
  });

  it('should write ERROR log', () => {
    const { logger, transport, injector } = createLogger({
      logLevel: LogLevel.ERROR,
      language: LogLanguage.EN,
    });

    logger.error(LogEvent.REQUEST_SYNC_FAILED);

    expect(transport.write).toHaveBeenCalledTimes(1);

    expect(transport.write).toHaveBeenCalledWith(
      expect.objectContaining({
        level: LogLevel.ERROR,
        event: LogEvent.REQUEST_SYNC_FAILED,
        message: 'Request synchronization failed',
      }),
    );

    injector.destroy();
  });

  it('should not write logs when log level is NONE', () => {
    const { logger, transport, injector } = createLogger({
      logLevel: LogLevel.NONE,
      language: LogLanguage.EN,
    });

    logger.info(LogEvent.SYNC_STARTED);
    logger.success(LogEvent.SYNC_COMPLETED);
    logger.warning(LogEvent.RETRY_SCHEDULED);
    logger.error(LogEvent.REQUEST_SYNC_FAILED);

    expect(transport.write).not.toHaveBeenCalled();

    injector.destroy();
  });

  it('should write logs for all levels when log level is ALL', () => {
    const { logger, transport, injector } = createLogger({
      logLevel: LogLevel.ALL,
      language: LogLanguage.EN,
    });

    logger.info(LogEvent.SYNC_STARTED);
    logger.success(LogEvent.SYNC_COMPLETED);
    logger.warning(LogEvent.RETRY_SCHEDULED);
    logger.error(LogEvent.REQUEST_SYNC_FAILED);

    expect(transport.write).toHaveBeenCalledTimes(4);

    injector.destroy();
  });

  it('should write only logs matching configured level', () => {
    const { logger, transport, injector } = createLogger({
      logLevel: LogLevel.ERROR,
      language: LogLanguage.EN,
    });

    logger.info(LogEvent.SYNC_STARTED);
    logger.success(LogEvent.SYNC_COMPLETED);
    logger.warning(LogEvent.RETRY_SCHEDULED);
    logger.error(LogEvent.REQUEST_SYNC_FAILED);

    expect(transport.write).toHaveBeenCalledTimes(1);

    expect(transport.write).toHaveBeenCalledWith(
      expect.objectContaining({
        level: LogLevel.ERROR,
        event: LogEvent.REQUEST_SYNC_FAILED,
      }),
    );

    injector.destroy();
  });

  it('should use Russian messages when language is RU', () => {
    const { logger, transport, injector } = createLogger({
      logLevel: LogLevel.ALL,
      language: LogLanguage.RU,
    });

    logger.info(LogEvent.SYNC_STARTED);

    expect(transport.write).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Синхронизация началась',
      }),
    );

    injector.destroy();
  });

  it('should use English messages when language is EN', () => {
    const { logger, transport, injector } = createLogger({
      logLevel: LogLevel.ALL,
      language: LogLanguage.EN,
    });

    logger.info(LogEvent.SYNC_STARTED);

    expect(transport.write).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Synchronization started',
      }),
    );

    injector.destroy();
  });

  it('should replace message placeholders with context values', () => {
    const { logger, transport, injector } = createLogger({
      logLevel: LogLevel.ALL,
      language: LogLanguage.EN,
    });

    logger.info(LogEvent.SYNC_PROCESSING, {
      count: 1000,
    });

    expect(transport.write).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Processing 1000 queued requests',
        context: {
          count: 1000,
        },
      }),
    );

    injector.destroy();
  });

  it('should replace Russian message placeholders with context values', () => {
    const { logger, transport, injector } = createLogger({
      logLevel: LogLevel.ALL,
      language: LogLanguage.RU,
    });

    logger.info(LogEvent.SYNC_PROCESSING, {
      count: 1000,
    });

    expect(transport.write).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Обработка 1000 запросов из очереди',
        context: {
          count: 1000,
        },
      }),
    );

    injector.destroy();
  });

  it('should include timestamp in log entry', () => {
    const { logger, transport, injector } = createLogger();

    const before = Date.now();

    logger.info(LogEvent.SYNC_STARTED);

    const after = Date.now();

    const entry = transport.write.mock.calls[0][0];

    expect(entry.timestamp).toBeGreaterThanOrEqual(before);
    expect(entry.timestamp).toBeLessThanOrEqual(after);

    injector.destroy();
  });

  it('should pass context to transport', () => {
    const { logger, transport, injector } = createLogger();

    const context = {
      id: 'request-1',
      method: 'POST',
      url: '/posts',
    };

    logger.info(LogEvent.REQUEST_QUEUED, context);

    expect(transport.write).toHaveBeenCalledWith(
      expect.objectContaining({
        context,
      }),
    );

    injector.destroy();
  });

  it('should use EN language by default', () => {
    const { logger, transport, injector } = createLogger({
      logLevel: LogLevel.ALL,
    });

    logger.info(LogEvent.SYNC_STARTED);

    expect(transport.write).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Synchronization started',
      }),
    );

    injector.destroy();
  });

  it('should use NONE log level by default', () => {
    const { logger, transport, injector } = createLogger({
      language: LogLanguage.EN,
    });

    logger.info(LogEvent.SYNC_STARTED);

    expect(transport.write).not.toHaveBeenCalled();

    injector.destroy();
  });
});
