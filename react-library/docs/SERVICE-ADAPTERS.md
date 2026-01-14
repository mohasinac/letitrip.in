# Service Adapters Guide

## Overview

The React Library uses a **pluggable adapter pattern** to support multiple backend services. This means you can use Firebase, Supabase, custom REST APIs, or any other backend without changing your component code.

## Quick Start

### Using with Firebase

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import {
  FirebaseFirestoreAdapter,
  FirebaseStorageAdapter,
  FirebaseAuthAdapter,
  ApiUploadService,
  useMediaUpload,
} from "@letitrip/react-library";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Create adapters
const services = {
  database: new FirebaseFirestoreAdapter(db),
  storage: new FirebaseStorageAdapter(storage),
  auth: new FirebaseAuthAdapter(auth),
};

// Use with upload hook
const MyComponent = () => {
  const uploadService = new ApiUploadService("/api/media/upload");

  const { upload, isUploading, progress } = useMediaUpload({
    uploadService,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png"],
    onSuccess: (url) => console.log("Uploaded:", url),
  });

  return <button onClick={() => upload(file)}>Upload</button>;
};
```

### Using with Supabase

```typescript
import { createClient } from "@supabase/supabase-js";
import {
  SupabaseStorageAdapter,
  StorageUploadService,
  useMediaUpload,
} from "@letitrip/react-library";

// Initialize Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Create storage adapter
const storageAdapter = new SupabaseStorageAdapter(
  supabase.storage,
  "my-bucket"
);

// Create upload service
const uploadService = new StorageUploadService(storageAdapter);

// Use with hook
const { upload, isUploading } = useMediaUpload({
  uploadService,
  maxSize: 10 * 1024 * 1024, // 10MB
});
```

### Using with Custom REST API

```typescript
import { ApiUploadService, useMediaUpload } from "@letitrip/react-library";

// Configure API endpoints
const uploadService = new ApiUploadService("/api/upload", "/api/delete");

const { upload } = useMediaUpload({
  uploadService,
  maxSize: 5 * 1024 * 1024,
  context: "product",
  contextId: productId,
});
```

## Adapter Interfaces

### Database Adapter

```typescript
interface DatabaseAdapter {
  collection<T>(path: string): DatabaseCollection<T>;
  batch(): DatabaseBatch;
  runTransaction<T>(fn: (tx: DatabaseTransaction) => Promise<T>): Promise<T>;
}
```

**Implementations:**

- `FirebaseFirestoreAdapter` - For Firebase Firestore
- Create your own for MongoDB, PostgreSQL, etc.

### Storage Adapter

```typescript
interface StorageAdapter {
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
```

**Implementations:**

- `FirebaseStorageAdapter` - For Firebase Storage
- `SupabaseStorageAdapter` - For Supabase Storage
- Create your own for S3, Cloudinary, etc.

### Upload Service

```typescript
interface UploadService {
  upload(
    file: File,
    options?: {
      path?: string;
      metadata?: Record<string, any>;
      onProgress?: (progress: number) => void;
    }
  ): Promise<string>;
  delete(url: string): Promise<void>;
}
```

**Implementations:**

- `ApiUploadService` - For API-based uploads (Next.js API routes, REST APIs)
- `StorageUploadService` - For direct storage uploads
- `MockUploadService` - For testing

### Auth Adapter

```typescript
interface AuthAdapter {
  getCurrentUser(): Promise<AuthUser | null>;
  signIn(credentials: AuthCredentials): Promise<AuthUser>;
  signUp(credentials: AuthCredentials): Promise<AuthUser>;
  signOut(): Promise<void>;
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
}
```

**Implementations:**

- `FirebaseAuthAdapter` - For Firebase Auth
- Create your own for Auth0, Supabase Auth, etc.

### Cache Adapter

```typescript
interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}
```

**Implementations:**

- `LocalStorageCacheAdapter` - Browser localStorage
- `InMemoryCacheAdapter` - In-memory cache
- Create your own for Redis, Memcached, etc.

## Creating Custom Adapters

### Example: Custom Database Adapter

```typescript
import type {
  DatabaseAdapter,
  DatabaseCollection,
} from "@letitrip/react-library";

class MyDatabaseAdapter implements DatabaseAdapter {
  constructor(private client: any) {}

  collection<T>(path: string): DatabaseCollection<T> {
    return {
      doc: (id: string) => this.createDocRef(path, id),
      add: async (data: Partial<T>) => {
        const result = await this.client.insert(path, data);
        return this.createDocRef(path, result.id);
      },
      query: () => this.createQuery(path),
      get: async () => {
        const results = await this.client.find(path);
        return this.wrapResults(results);
      },
    };
  }

  // Implement other methods...
}
```

### Example: Custom Upload Service

```typescript
import type { UploadService } from "@letitrip/react-library";

class S3UploadService implements UploadService {
  constructor(private s3Client: any, private bucket: string) {}

  async upload(
    file: File,
    options?: {
      path?: string;
      metadata?: Record<string, any>;
      onProgress?: (progress: number) => void;
    }
  ): Promise<string> {
    const key = options?.path || `uploads/${Date.now()}_${file.name}`;

    const uploadParams = {
      Bucket: this.bucket,
      Key: key,
      Body: file,
      Metadata: options?.metadata,
    };

    // Upload with progress tracking
    const upload = this.s3Client.upload(uploadParams);

    if (options?.onProgress) {
      upload.on("httpUploadProgress", (evt: any) => {
        const progress = (evt.loaded / evt.total) * 100;
        options.onProgress!(progress);
      });
    }

    const result = await upload.promise();
    return result.Location;
  }

  async delete(url: string): Promise<void> {
    const key = new URL(url).pathname.slice(1);
    await this.s3Client
      .deleteObject({
        Bucket: this.bucket,
        Key: key,
      })
      .promise();
  }
}
```

## Migration from Hardcoded Firebase

### Before (Hardcoded)

```typescript
// Old approach - tightly coupled to Firebase
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const uploadFile = async (file: File) => {
  const storageRef = ref(storage, `uploads/${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
```

### After (Pluggable)

```typescript
// New approach - works with any backend
import { useMediaUpload, ApiUploadService } from "@letitrip/react-library";

const MyComponent = () => {
  const uploadService = new ApiUploadService();

  const { upload } = useMediaUpload({
    uploadService,
    maxSize: 5 * 1024 * 1024,
  });

  const handleUpload = async (file: File) => {
    const url = await upload(file);
    return url;
  };
};
```

## Testing with Mocks

```typescript
import { MockUploadService, useMediaUpload } from "@letitrip/react-library";

describe("Upload Component", () => {
  it("should upload file", async () => {
    const uploadService = new MockUploadService({ delay: 100 });

    const { upload } = useMediaUpload({ uploadService });
    const url = await upload(testFile);

    expect(url).toContain("mock-storage.example.com");
  });

  it("should handle upload failure", async () => {
    const uploadService = new MockUploadService({ shouldFail: true });

    const { upload } = useMediaUpload({ uploadService });

    await expect(upload(testFile)).rejects.toThrow();
  });
});
```

## Best Practices

1. **Create adapters at app initialization**, not in components
2. **Pass adapters via props or context** to child components
3. **Use dependency injection** for testing
4. **Implement retry logic** at the adapter level
5. **Handle errors gracefully** with proper error messages
6. **Cache adapter instances** to avoid recreating them
7. **Type your custom adapters** properly for better IDE support

## Framework-Specific Setup

### Next.js

```typescript
// lib/services.ts
import { ApiUploadService } from "@letitrip/react-library";

export const uploadService = new ApiUploadService(
  "/api/media/upload",
  "/api/media/delete"
);

// components/MyComponent.tsx
import { useMediaUpload } from "@letitrip/react-library";
import { uploadService } from "@/lib/services";

export function MyComponent() {
  const { upload } = useMediaUpload({
    uploadService,
    maxSize: 5 * 1024 * 1024,
  });
}
```

### React Native (Expo)

```typescript
// services/upload.ts
import * as FileSystem from "expo-file-system";
import type { UploadService } from "@letitrip/react-library";

class ExpoUploadService implements UploadService {
  async upload(file: File, options?: any): Promise<string> {
    const response = await FileSystem.uploadAsync(this.apiEndpoint, file.uri, {
      fieldName: "file",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    });
    return JSON.parse(response.body).url;
  }
}
```

### Plain React App

```typescript
// Same as Next.js but with your own API endpoints
import { ApiUploadService } from "@letitrip/react-library";

const uploadService = new ApiUploadService(
  "https://api.myapp.com/upload",
  "https://api.myapp.com/delete"
);
```

## See Also

- [API Documentation](../README.md)
- [Component Examples](../stories/)
- [Type Definitions](../src/types/adapters.ts)
