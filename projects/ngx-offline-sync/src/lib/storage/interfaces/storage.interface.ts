export interface IStorage<T> {
  save(value: T): Promise<void>;
  get(id: string): Promise<T | undefined>;
  getAll(): Promise<T[]>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}
