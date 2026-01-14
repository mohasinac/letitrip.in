/**
 * Example adapter implementations for various services
 *
 * These examples show how to create adapters for:
 * - Supabase
 * - Local Storage
 * - REST APIs
 * - In-memory implementations (for testing)
 *
 * @module adapters/examples
 */

import type {
  CacheAdapter,
  StorageAdapter,
  StorageFileRef,
  StorageUploadResult,
  UploadService,
} from "../types/adapters";

/**
 * Local Storage Cache Adapter
 * Simple cache implementation using browser localStorage
 */
export class LocalStorageCacheAdapter implements CacheAdapter {
  private prefix: string;

  constructor(prefix: string = "cache_") {
    this.prefix = prefix;
  }

  async get<T = any>(key: string): Promise<T | null> {
    const item = localStorage.getItem(this.prefix + key);
    if (!item) return null;

    try {
      const { value, expiry } = JSON.parse(item);
      if (expiry && Date.now() > expiry) {
        await this.delete(key);
        return null;
      }
      return value as T;
    } catch {
      return null;
    }
  }

  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    const item = {
      value,
      expiry: ttl ? Date.now() + ttl * 1000 : null,
    };
    localStorage.setItem(this.prefix + key, JSON.stringify(item));
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key);
  }

  async clear(): Promise<void> {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  async has(key: string): Promise<boolean> {
    return localStorage.getItem(this.prefix + key) !== null;
  }
}

/**
 * In-Memory Cache Adapter
 * Simple cache for testing or non-persistent scenarios
 */
export class InMemoryCacheAdapter implements CacheAdapter {
  private cache: Map<string, { value: any; expiry: number | null }> = new Map();

  async get<T = any>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.expiry && Date.now() > item.expiry) {
      await this.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: ttl ? Date.now() + ttl * 1000 : null,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }
}

/**
 * Mock Upload Service for Testing
 * Simulates file uploads without actual network calls
 */
export class MockUploadService implements UploadService {
  private delay: number;
  private shouldFail: boolean;

  constructor(options: { delay?: number; shouldFail?: boolean } = {}) {
    this.delay = options.delay || 1000;
    this.shouldFail = options.shouldFail || false;
  }

  async upload(
    file: File,
    options?: {
      path?: string;
      metadata?: Record<string, any>;
      onProgress?: (progress: number) => void;
    }
  ): Promise<string> {
    // Simulate progress
    if (options?.onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        options.onProgress(i);
        await new Promise((resolve) => setTimeout(resolve, this.delay / 10));
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, this.delay));
    }

    if (this.shouldFail) {
      throw new Error("Mock upload failed");
    }

    // Return mock URL
    const path = options?.path || file.name;
    return `https://mock-storage.example.com/${path}`;
  }

  async delete(url: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

/**
 * Example: Supabase Storage Adapter
 *
 * @example
 * ```typescript
 * import { createClient } from '@supabase/supabase-js';
 * import { SupabaseStorageAdapter } from '@letitrip/react-library/adapters/examples';
 *
 * const supabase = createClient(url, key);
 * const storage = new SupabaseStorageAdapter(supabase.storage, 'bucket-name');
 * ```
 */
export class SupabaseStorageAdapter implements StorageAdapter {
  constructor(private storage: any, private bucket: string) {}

  async upload(
    file: File,
    path: string,
    metadata?: Record<string, any>
  ): Promise<StorageUploadResult> {
    const { data, error } = await this.storage
      .from(this.bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        ...metadata,
      });

    if (error) throw error;

    const { data: urlData } = this.storage.from(this.bucket).getPublicUrl(path);

    return {
      url: urlData.publicUrl,
      path,
      metadata: data,
    };
  }

  async uploadWithProgress(
    file: File,
    path: string,
    onProgress: (progress: number) => void,
    metadata?: Record<string, any>
  ): Promise<StorageUploadResult> {
    // Supabase doesn't support progress out of the box
    // This is a simplified version
    const result = await this.upload(file, path, metadata);
    onProgress(100);
    return result;
  }

  ref(path: string): StorageFileRef {
    return {
      path,
      getDownloadURL: async () => {
        const { data } = this.storage.from(this.bucket).getPublicUrl(path);
        return data.publicUrl;
      },
      delete: async () => {
        const { error } = await this.storage.from(this.bucket).remove([path]);
        if (error) throw error;
      },
      updateMetadata: async (metadata: Record<string, any>) => {
        // Supabase doesn't support metadata updates directly
        console.warn("Supabase metadata updates not supported");
      },
    };
  }

  async delete(path: string): Promise<void> {
    const { error } = await this.storage.from(this.bucket).remove([path]);
    if (error) throw error;
  }

  async getDownloadURL(path: string): Promise<string> {
    const { data } = this.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
