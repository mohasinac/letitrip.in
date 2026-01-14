/**
 * Service Adapters and Interfaces
 *
 * These interfaces define contracts for pluggable services (database, storage, auth, etc.)
 * allowing the library to work with any backend (Firebase, Supabase, custom REST APIs, etc.)
 *
 * @module types/adapters
 */

/**
 * Generic database query interface
 */
export interface DatabaseQuery<T = any> {
  where(field: string, operator: string, value: any): DatabaseQuery<T>;
  orderBy(field: string, direction?: "asc" | "desc"): DatabaseQuery<T>;
  limit(count: number): DatabaseQuery<T>;
  offset(count: number): DatabaseQuery<T>;
  get(): Promise<DatabaseQueryResult<T>>;
}

/**
 * Database query result
 */
export interface DatabaseQueryResult<T = any> {
  docs: Array<DatabaseDocument<T>>;
  empty: boolean;
  size: number;
}

/**
 * Database document interface
 */
export interface DatabaseDocument<T = any> {
  id: string;
  data(): T | undefined;
  exists: boolean;
}

/**
 * Database collection reference
 */
export interface DatabaseCollection<T = any> {
  doc(id: string): DatabaseDocumentRef<T>;
  add(data: Partial<T>): Promise<DatabaseDocumentRef<T>>;
  query(): DatabaseQuery<T>;
  get(): Promise<DatabaseQueryResult<T>>;
}

/**
 * Database document reference
 */
export interface DatabaseDocumentRef<T = any> {
  id: string;
  get(): Promise<DatabaseDocument<T>>;
  set(data: Partial<T>, options?: { merge?: boolean }): Promise<void>;
  update(data: Partial<T>): Promise<void>;
  delete(): Promise<void>;
}

/**
 * Main database adapter interface
 */
export interface DatabaseAdapter {
  collection<T = any>(path: string): DatabaseCollection<T>;
  batch(): DatabaseBatch;
  runTransaction<T>(
    updateFunction: (transaction: DatabaseTransaction) => Promise<T>
  ): Promise<T>;
}

/**
 * Database batch operations
 */
export interface DatabaseBatch {
  set<T>(
    ref: DatabaseDocumentRef<T>,
    data: Partial<T>,
    options?: { merge?: boolean }
  ): DatabaseBatch;
  update<T>(ref: DatabaseDocumentRef<T>, data: Partial<T>): DatabaseBatch;
  delete<T>(ref: DatabaseDocumentRef<T>): DatabaseBatch;
  commit(): Promise<void>;
}

/**
 * Database transaction operations
 */
export interface DatabaseTransaction {
  get<T>(ref: DatabaseDocumentRef<T>): Promise<DatabaseDocument<T>>;
  set<T>(
    ref: DatabaseDocumentRef<T>,
    data: Partial<T>,
    options?: { merge?: boolean }
  ): DatabaseTransaction;
  update<T>(ref: DatabaseDocumentRef<T>, data: Partial<T>): DatabaseTransaction;
  delete<T>(ref: DatabaseDocumentRef<T>): DatabaseTransaction;
}

/**
 * Storage upload result
 */
export interface StorageUploadResult {
  url: string;
  path: string;
  metadata?: Record<string, any>;
}

/**
 * Storage file reference
 */
export interface StorageFileRef {
  path: string;
  getDownloadURL(): Promise<string>;
  delete(): Promise<void>;
  updateMetadata(metadata: Record<string, any>): Promise<void>;
}

/**
 * Storage adapter interface
 */
export interface StorageAdapter {
  upload(
    file: File,
    path: string,
    metadata?: Record<string, any>
  ): Promise<StorageUploadResult>;
  uploadWithProgress(
    file: File,
    path: string,
    onProgress: (progress: number) => void,
    metadata?: Record<string, any>
  ): Promise<StorageUploadResult>;
  ref(path: string): StorageFileRef;
  delete(path: string): Promise<void>;
  getDownloadURL(path: string): Promise<string>;
}

/**
 * Auth user interface
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

/**
 * Auth credentials
 */
export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * Auth adapter interface
 */
export interface AuthAdapter {
  getCurrentUser(): Promise<AuthUser | null>;
  signIn(credentials: AuthCredentials): Promise<AuthUser>;
  signUp(credentials: AuthCredentials): Promise<AuthUser>;
  signOut(): Promise<void>;
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
  sendPasswordResetEmail(email: string): Promise<void>;
  updateProfile(updates: Partial<AuthUser>): Promise<void>;
}

/**
 * HTTP client response
 */
export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * HTTP client interface
 */
export interface HttpClient {
  get<T = any>(
    url: string,
    config?: Record<string, any>
  ): Promise<HttpResponse<T>>;
  post<T = any>(
    url: string,
    data?: any,
    config?: Record<string, any>
  ): Promise<HttpResponse<T>>;
  put<T = any>(
    url: string,
    data?: any,
    config?: Record<string, any>
  ): Promise<HttpResponse<T>>;
  patch<T = any>(
    url: string,
    data?: any,
    config?: Record<string, any>
  ): Promise<HttpResponse<T>>;
  delete<T = any>(
    url: string,
    config?: Record<string, any>
  ): Promise<HttpResponse<T>>;
}

/**
 * Cache adapter interface
 */
export interface CacheAdapter {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

/**
 * Analytics event
 */
export interface AnalyticsEvent {
  name: string;
  params?: Record<string, any>;
}

/**
 * Analytics adapter interface
 */
export interface AnalyticsAdapter {
  logEvent(event: AnalyticsEvent): Promise<void>;
  setUserId(userId: string | null): Promise<void>;
  setUserProperties(properties: Record<string, any>): Promise<void>;
}

/**
 * Service configuration for the library
 * Pass this object to library hooks/components that need backend services
 */
export interface ServiceConfig {
  /** Database adapter (e.g., Firebase Firestore, Supabase, MongoDB) */
  database?: DatabaseAdapter;
  /** Storage adapter (e.g., Firebase Storage, S3, Cloudinary) */
  storage?: StorageAdapter;
  /** Authentication adapter (e.g., Firebase Auth, Auth0, custom) */
  auth?: AuthAdapter;
  /** HTTP client (e.g., axios, fetch wrapper) */
  http?: HttpClient;
  /** Cache adapter (e.g., localStorage, Redis, in-memory) */
  cache?: CacheAdapter;
  /** Analytics adapter (e.g., Firebase Analytics, Google Analytics) */
  analytics?: AnalyticsAdapter;
}

/**
 * Upload service interface
 * Abstraction over storage and API-based uploads
 */
export interface UploadService {
  /**
   * Upload a file
   * @param file - File to upload
   * @param options - Upload options
   * @returns Promise with upload URL
   */
  upload(
    file: File,
    options?: {
      path?: string;
      metadata?: Record<string, any>;
      onProgress?: (progress: number) => void;
    }
  ): Promise<string>;

  /**
   * Delete uploaded file
   * @param url - URL or path of file to delete
   */
  delete(url: string): Promise<void>;
}

/**
 * API-based upload service (for Next.js API routes, REST APIs)
 */
export class ApiUploadService implements UploadService {
  constructor(
    private apiEndpoint: string = "/api/media/upload",
    private deleteEndpoint: string = "/api/media/delete"
  ) {}

  async upload(
    file: File,
    options?: {
      metadata?: Record<string, any>;
      onProgress?: (progress: number) => void;
    }
  ): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    if (options?.metadata) {
      Object.entries(options.metadata).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (options?.onProgress) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            options.onProgress?.(progress);
          }
        });
      }

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          const url = response.url || response.data?.url;
          if (url) {
            resolve(url);
          } else {
            reject(new Error("No URL returned from upload"));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () =>
        reject(new Error("Network error during upload"))
      );
      xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

      xhr.open("POST", this.apiEndpoint);
      xhr.send(formData);
    });
  }

  async delete(url: string): Promise<void> {
    const response = await fetch(this.deleteEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Delete failed with status ${response.status}`);
    }
  }
}

/**
 * Storage-based upload service (for direct storage uploads)
 */
export class StorageUploadService implements UploadService {
  constructor(private storage: StorageAdapter) {}

  async upload(
    file: File,
    options?: {
      path?: string;
      metadata?: Record<string, any>;
      onProgress?: (progress: number) => void;
    }
  ): Promise<string> {
    const path = options?.path || `uploads/${Date.now()}_${file.name}`;

    if (options?.onProgress) {
      const result = await this.storage.uploadWithProgress(
        file,
        path,
        options.onProgress,
        options?.metadata
      );
      return result.url;
    } else {
      const result = await this.storage.upload(file, path, options?.metadata);
      return result.url;
    }
  }

  async delete(url: string): Promise<void> {
    // Extract path from URL if needed
    const path = url.split("/").pop() || url;
    await this.storage.delete(path);
  }
}
