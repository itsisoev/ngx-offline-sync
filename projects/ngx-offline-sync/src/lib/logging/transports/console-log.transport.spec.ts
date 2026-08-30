import { describe, expect, it, vi } from 'vitest';
import { ConsoleLogTransport } from './console-log.transport';
import { LogEvent } from '../enums/log-event.enum';
import { LogLevel } from '../enums/log-level.enum';

describe('ConsoleLogTransport', () => {
  it('should write INFO message using console.info', () => {
    const transport = new ConsoleLogTransport();

    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    const entry = {
      level: LogLevel.INFO,
      event: LogEvent.SYNC_STARTED,
      message: 'Synchronization started',
      timestamp: Date.now(),
    };

    transport.write(entry);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith('Synchronization started', '');

    consoleSpy.mockRestore();
  });

  it('should write SUCCESS message using console.log', () => {
    const transport = new ConsoleLogTransport();

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const entry = {
      level: LogLevel.SUCCESS,
      event: LogEvent.SYNC_COMPLETED,
      message: 'Synchronization completed',
      timestamp: Date.now(),
    };

    transport.write(entry);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith('Synchronization completed', '');

    consoleSpy.mockRestore();
  });

  it('should write WARNING message using console.warn', () => {
    const transport = new ConsoleLogTransport();

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const entry = {
      level: LogLevel.WARNING,
      event: LogEvent.RETRY_SCHEDULED,
      message: 'Retry scheduled',
      timestamp: Date.now(),
    };

    transport.write(entry);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith('Retry scheduled', '');

    consoleSpy.mockRestore();
  });

  it('should write ERROR message using console.error', () => {
    const transport = new ConsoleLogTransport();

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const entry = {
      level: LogLevel.ERROR,
      event: LogEvent.REQUEST_SYNC_FAILED,
      message: 'Request synchronization failed',
      timestamp: Date.now(),
    };

    transport.write(entry);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith('Request synchronization failed', '');

    consoleSpy.mockRestore();
  });

  it('should pass context to console', () => {
    const transport = new ConsoleLogTransport();

    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    const context = {
      id: 'request-1',
      method: 'POST',
      url: '/posts',
    };

    const entry = {
      level: LogLevel.INFO,
      event: LogEvent.REQUEST_QUEUED,
      message: 'Request added to queue',
      context,
      timestamp: Date.now(),
    };

    transport.write(entry);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith('Request added to queue', context);

    consoleSpy.mockRestore();
  });
});
