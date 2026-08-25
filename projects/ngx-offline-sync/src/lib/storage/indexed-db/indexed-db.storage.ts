import { IStorage } from '../interfaces';
import { INDEXED_DB_CONFIG } from './indexed-db.config';

export class IndexedDbStorage<T> implements IStorage<T> {
  private database?: IDBDatabase;

  async open(): Promise<void> {
    if (this.database) {
      return;
    }

    this.database = await this.openDatabase();
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(INDEXED_DB_CONFIG.name, INDEXED_DB_CONFIG.version);

      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(INDEXED_DB_CONFIG.queueStore)) {
          const store = database.createObjectStore(INDEXED_DB_CONFIG.queueStore, {
            keyPath: 'id',
          });

          store.createIndex(INDEXED_DB_CONFIG.indexes.status, 'status', {
            unique: false,
          });

          store.createIndex(INDEXED_DB_CONFIG.indexes.createdAt, 'createdAt', {
            unique: false,
          });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async save(value: T): Promise<void> {
    await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.database!.transaction(INDEXED_DB_CONFIG.queueStore, 'readwrite');
      const store = transaction.objectStore(INDEXED_DB_CONFIG.queueStore);
      const request = store.put(value);

      request.onsuccess = () => resolve();

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async get(id: string): Promise<T | undefined> {
    await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.database!.transaction(INDEXED_DB_CONFIG.queueStore, 'readonly');
      const store = transaction.objectStore(INDEXED_DB_CONFIG.queueStore);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getAll(): Promise<T[]> {
    await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.database!.transaction(INDEXED_DB_CONFIG.queueStore, 'readonly');
      const store = transaction.objectStore(INDEXED_DB_CONFIG.queueStore);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async delete(id: string): Promise<void> {
    await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.database!.transaction(INDEXED_DB_CONFIG.queueStore, 'readwrite');
      const store = transaction.objectStore(INDEXED_DB_CONFIG.queueStore);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async clear(): Promise<void> {
    await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.database!.transaction(INDEXED_DB_CONFIG.queueStore, 'readwrite');
      const store = transaction.objectStore(INDEXED_DB_CONFIG.queueStore);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}
