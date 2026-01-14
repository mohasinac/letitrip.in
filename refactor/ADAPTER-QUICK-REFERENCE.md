# Service Adapter Quick Reference

## Installation

```bash
npm install @letitrip/react-library
```

## Import Adapters

```typescript
import {
  // Firebase adapters
  FirebaseFirestoreAdapter,
  FirebaseStorageAdapter,
  FirebaseAuthAdapter,

  // Upload services
  ApiUploadService,
  StorageUploadService,

  // Testing mocks
  MockUploadService,
  InMemoryCacheAdapter,

  // Example implementations
  SupabaseStorageAdapter,
  LocalStorageCacheAdapter,

  // Types
  type DatabaseAdapter,
  type StorageAdapter,
  type AuthAdapter,
  type UploadService,
  type ServiceConfig,
} from "@letitrip/react-library";
```

## Quick Setup

### Firebase

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import {
  FirebaseFirestoreAdapter,
  FirebaseStorageAdapter,
  FirebaseAuthAdapter,
} from "@letitrip/react-library";

const app = initializeApp(config);

const services = {
  database: new FirebaseFirestoreAdapter(getFirestore(app)),
  storage: new FirebaseStorageAdapter(getStorage(app)),
  auth: new FirebaseAuthAdapter(getAuth(app)),
};
```

### Supabase

```typescript
import { createClient } from "@supabase/supabase-js";
import { SupabaseStorageAdapter } from "@letitrip/react-library";

const supabase = createClient(url, key);

const services = {
  storage: new SupabaseStorageAdapter(supabase.storage, "bucket-name"),
};
```

### Custom API

```typescript
import { ApiUploadService } from "@letitrip/react-library";

const uploadService = new ApiUploadService(
  "/api/upload", // Upload endpoint
  "/api/delete" // Delete endpoint (optional)
);
```

## Usage Patterns

### Pattern 1: Direct Props

```typescript
import { useMediaUpload, ApiUploadService } from "@letitrip/react-library";

function MyComponent() {
  const uploadService = new ApiUploadService("/api/upload");

  const { upload, isUploading, progress } = useMediaUpload({
    uploadService,
    maxSize: 5 * 1024 * 1024,
    onSuccess: (url) => console.log("Uploaded:", url),
  });

  return <button onClick={() => upload(file)}>Upload</button>;
}
```

### Pattern 2: Service Context

```typescript
// context/services.tsx
import { createContext, useContext } from "react";
import type { ServiceConfig } from "@letitrip/react-library";

const ServicesContext = createContext<ServiceConfig | null>(null);

export function ServicesProvider({ children, services }) {
  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  return useContext(ServicesContext);
}

// App.tsx
import { ServicesProvider } from "./context/services";
import { initServices } from "./lib/services";

function App() {
  const services = initServices();

  return (
    <ServicesProvider services={services}>{/* Your app */}</ServicesProvider>
  );
}

// MyComponent.tsx
import { useMediaUpload } from "@letitrip/react-library";
import { useServices } from "./context/services";

function MyComponent() {
  const services = useServices();
  const uploadService = new ApiUploadService("/api/upload");

  const { upload } = useMediaUpload({
    uploadService,
    maxSize: 5 * 1024 * 1024,
  });
}
```

### Pattern 3: Service Factory

```typescript
// lib/services.ts
import {
  FirebaseFirestoreAdapter,
  FirebaseStorageAdapter,
  ApiUploadService,
  type ServiceConfig,
} from '@letitrip/react-library';
import { getFirestore, getStorage } from 'firebase/app';
import { app } from './firebase';

export function createServices(): ServiceConfig {
  return {
    database: new FirebaseFirestoreAdapter(getFirestore(app)),
    storage: new FirebaseStorageAdapter(getStorage(app)),
  };
}

export function createUploadService() {
  return new ApiUploadService('/api/media/upload', '/api/media/delete');
}

// Usage
import { createUploadService } from '@/lib/services';
import { useMediaUpload } from '@letitrip/react-library';

function MyComponent() {
  const uploadService = createUploadService();
  const { upload } = useMediaUpload({ uploadService, maxSize: 5MB });
}
```

## Testing

### Unit Test with Mock

```typescript
import { render, screen } from "@testing-library/react";
import { MockUploadService } from "@letitrip/react-library";
import MyUploadComponent from "./MyUploadComponent";

test("uploads file successfully", async () => {
  const mockUpload = new MockUploadService({ delay: 100 });

  render(<MyUploadComponent uploadService={mockUpload} />);

  const file = new File(["content"], "test.png", { type: "image/png" });
  // ... test upload flow
});
```

### Integration Test

```typescript
import { FirebaseFirestoreAdapter } from "@letitrip/react-library";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";

test("saves data to Firestore", async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: "test-project",
  });

  const db = testEnv.unauthenticatedContext().firestore();
  const adapter = new FirebaseFirestoreAdapter(db);

  // Test with real Firestore emulator
  await adapter.collection("products").add({ name: "Test" });
});
```

## Common Use Cases

### Upload with Progress

```typescript
const { upload, progress, isUploading } = useMediaUpload({
  uploadService,
  maxSize: 10 * 1024 * 1024,
  onProgress: (p) => console.log(`${p}% complete`),
});

await upload(file);
```

### Upload with Validation

```typescript
const { upload, error } = useMediaUpload({
  uploadService,
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  onError: (err) => toast.error(err),
});
```

### Upload with Metadata

```typescript
const { upload } = useMediaUpload({
  uploadService,
  context: "product",
  contextId: productId,
  autoDelete: true, // Delete after 24h
});
```

### Custom Upload Path

```typescript
const { upload } = useMediaUpload({
  uploadService,
  pathPattern: "products/{contextId}/{timestamp}_{filename}",
  context: "product",
  contextId: "prod-123",
});
```

## Creating Custom Adapter

### Custom Upload Service

```typescript
import type { UploadService } from '@letitrip/react-library';

class MyCloudinaryUpload implements UploadService {
  constructor(
    private cloudName: string,
    private uploadPreset: string
  ) {}

  async upload(file: File, options?: any): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`,
      { method: 'POST', body: formData }
    );

    const data = await response.json();
    return data.secure_url;
  }

  async delete(url: string): Promise<void> {
    // Implement delete logic
  }
}

// Usage
const uploadService = new MyCloudinaryUpload('my-cloud', 'my-preset');
const { upload } = useMediaUpload({ uploadService, maxSize: 10MB });
```

### Custom Database Adapter

```typescript
import type {
  DatabaseAdapter,
  DatabaseCollection,
  DatabaseDocumentRef,
} from "@letitrip/react-library";

class RestApiAdapter implements DatabaseAdapter {
  constructor(private baseUrl: string) {}

  collection<T>(path: string): DatabaseCollection<T> {
    return {
      doc: (id: string) => this.createDocRef(path, id),
      add: async (data: Partial<T>) => {
        const response = await fetch(`${this.baseUrl}/${path}`, {
          method: "POST",
          body: JSON.stringify(data),
        });
        const result = await response.json();
        return this.createDocRef(path, result.id);
      },
      // ... implement other methods
    };
  }

  // ... implement other methods
}

// Usage
const database = new RestApiAdapter("https://api.myapp.com");
```

## Environment-Specific Setup

### Development

```typescript
const uploadService = new ApiUploadService("/api/upload");
```

### Production

```typescript
const uploadService = new ApiUploadService(
  process.env.NEXT_PUBLIC_API_URL + "/upload"
);
```

### Test

```typescript
const uploadService = new MockUploadService({ delay: 0 });
```

## Troubleshooting

### Error: "uploadService is required"

```typescript
// ❌ Old way (won't work anymore)
const { upload } = useMediaUpload({ maxSize: 5MB });

// ✅ New way
const uploadService = new ApiUploadService('/api/upload');
const { upload } = useMediaUpload({ uploadService, maxSize: 5MB });
```

### Error: "Database adapter required"

```typescript
// Component needs database but none provided
// Solution: Pass via props or context
<MyComponent database={dbAdapter} />

// Or use context
<ServicesProvider services={{ database: dbAdapter }}>
  <MyComponent />
</ServicesProvider>
```

## Performance Tips

1. **Create adapters once** - Don't recreate in render
2. **Use context** - Share adapters across components
3. **Memoize services** - Use useMemo for service objects
4. **Lazy load** - Import adapters only when needed

```typescript
// ✅ Good - created once
const services = useMemo(() => createServices(), []);

// ❌ Bad - recreated every render
function MyComponent() {
  const uploadService = new ApiUploadService("/api/upload"); // New instance every render!
  // ...
}

// ✅ Better
const uploadService = useMemo(() => new ApiUploadService("/api/upload"), []);
```

## See Also

- [Complete Guide](../react-library/docs/SERVICE-ADAPTERS.md)
- [Implementation Summary](./SERVICE-ADAPTER-SUMMARY.md)
- [Phase 6 Vision](./PHASE-6-ADAPTER-VISION.md)
- [Type Definitions](../react-library/src/types/adapters.ts)
