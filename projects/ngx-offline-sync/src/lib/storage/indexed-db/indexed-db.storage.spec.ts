import { beforeEach, describe, expect, it } from 'vitest';
import 'fake-indexeddb/auto';
import { IndexedDbStorage } from './indexed-db.storage';

describe('IndexedDbStorage', () => {
  let storage: IndexedDbStorage<{
    id: string;
    name: string;
  }>;

  beforeEach(async () => {
    storage = new IndexedDbStorage();
    await storage.clear();
  });

  it('should save and get an item', async () => {
    const item = {
      id: '1',
      name: 'Test item',
    };

    await storage.save(item);

    const result = await storage.get(item.id);

    expect(result).toEqual(item);
  });

  it('should get all items', async () => {
    const firstItem = {
      id: '1',
      name: 'First item',
    }

    const secondItem = {
      id: '2',
      name: 'Second item',
    }

    await storage.save(firstItem);
    await storage.save(secondItem);

    const result = await storage.getAll();

    expect(result).toHaveLength(2);
    expect(result).toEqual(expect.arrayContaining([firstItem, secondItem]));
  })

  it('should delete an item', async () => {
    const item = {
      id: '1',
      name: 'Test item',
    }

    await storage.save(item);
    await storage.delete(item.id);

    const result = await storage.get(item.id);

    expect(result).toBeUndefined();
  })

  it('should clear all items', async () => {
    const firstItem = {
      id: '1',
      name: 'First item',
    };

    const secondItem = {
      id: '2',
      name: 'Second item',
    };

    await storage.save(firstItem);
    await storage.save(secondItem);

    await storage.clear();

    const result = await storage.getAll();

    expect(result).toHaveLength(0);
  });
});
