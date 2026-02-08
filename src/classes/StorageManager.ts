/**
 * Storage Manager Class
 *
 * Singleton class for managing localStorage and sessionStorage
 */

export type StorageType = "local" | "session";

export interface StorageOptions {
  type?: StorageType;
  prefix?: string;
  encrypt?: boolean;
}

export class StorageManager {
  private static instance: StorageManager;
  private prefix: string;

  private constructor(prefix: string = "app_") {
    this.prefix = prefix;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(prefix?: string): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager(prefix);
    }
    return StorageManager.instance;
  }

  /**
   * Get storage object
   */
  private getStorage(type: StorageType): Storage | null {
    if (typeof window === "undefined") return null;
    return type === "local" ? window.localStorage : window.sessionStorage;
  }

  /**
   * Generate storage key with prefix
   */
  private generateKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Set item in storage
   */
  public set<T>(key: string, value: T, options?: StorageOptions): boolean {
    const storage = this.getStorage(options?.type || "local");
    if (!storage) return false;

    try {
      const storageKey = this.generateKey(key);
      const serialized = JSON.stringify(value);
      storage.setItem(storageKey, serialized);
      return true;
    } catch (error) {
      console.error("Storage set error:", error);
      return false;
    }
  }

  /**
   * Get item from storage
   */
  public get<T>(key: string, options?: StorageOptions): T | null {
    const storage = this.getStorage(options?.type || "local");
    if (!storage) return null;

    try {
      const storageKey = this.generateKey(key);
      const item = storage.getItem(storageKey);

      if (item === null) return null;

      return JSON.parse(item) as T;
    } catch (error) {
      console.error("Storage get error:", error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  public remove(key: string, options?: StorageOptions): boolean {
    const storage = this.getStorage(options?.type || "local");
    if (!storage) return false;

    try {
      const storageKey = this.generateKey(key);
      storage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error("Storage remove error:", error);
      return false;
    }
  }

  /**
   * Clear all items with prefix
   */
  public clear(options?: StorageOptions): boolean {
    const storage = this.getStorage(options?.type || "local");
    if (!storage) return false;

    try {
      const keys = Object.keys(storage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          storage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error("Storage clear error:", error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  public has(key: string, options?: StorageOptions): boolean {
    return this.get(key, options) !== null;
  }

  /**
   * Get all keys with prefix
   */
  public keys(options?: StorageOptions): string[] {
    const storage = this.getStorage(options?.type || "local");
    if (!storage) return [];

    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ""));
      }
    }
    return keys;
  }

  /**
   * Get storage size in bytes
   */
  public size(options?: StorageOptions): number {
    const storage = this.getStorage(options?.type || "local");
    if (!storage) return 0;

    let size = 0;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(this.prefix)) {
        const value = storage.getItem(key);
        size += key.length + (value?.length || 0);
      }
    }
    return size;
  }

  /**
   * Check if storage is available
   */
  public isAvailable(type: StorageType = "local"): boolean {
    const storage = this.getStorage(type);
    if (!storage) return false;

    try {
      const testKey = "__storage_test__";
      storage.setItem(testKey, "test");
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all items with prefix as object
   */
  public getAll<T = any>(options?: StorageOptions): Record<string, T> {
    const storage = this.getStorage(options?.type || "local");
    if (!storage) return {};

    const items: Record<string, T> = {};
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(this.prefix)) {
        try {
          const value = storage.getItem(key);
          if (value !== null) {
            const cleanKey = key.replace(this.prefix, "");
            items[cleanKey] = JSON.parse(value) as T;
          }
        } catch (error) {
          console.error(`Error parsing storage item ${key}:`, error);
        }
      }
    }
    return items;
  }
}

// Export singleton instance
export const storageManager = StorageManager.getInstance();
