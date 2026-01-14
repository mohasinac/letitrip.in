# Media Upload Migration Guide

## Overview

This guide helps you migrate from hardcoded Next.js API routes to the new pluggable service adapter pattern in `@letitrip/react-library`.

## Quick Migration Steps

### 1. Update Dependencies

```bash
npm install @letitrip/react-library@latest
```

### 2. Choose Your Upload Backend

You have three main options:

#### Option A: Keep Using Next.js API Routes (Recommended for existing apps)

```typescript
import { ApiUploadService } from "@letitrip/react-library";

const uploadService = new ApiUploadService("/api/media/upload");
```

#### Option B: Use Firebase Storage Directly

```typescript
import { getStorage } from "firebase/storage";
import {
  FirebaseStorageAdapter,
  StorageUploadService,
} from "@letitrip/react-library";

const storage = getStorage(app);
const storageAdapter = new FirebaseStorageAdapter(storage);
const uploadService = new StorageUploadService(storageAdapter);
```

#### Option C: Use Supabase Storage

```typescript
import { createClient } from "@supabase/supabase-js";
import {
  SupabaseStorageAdapter,
  StorageUploadService,
} from "@letitrip/react-library";

const supabase = createClient(url, key);
const storageAdapter = new SupabaseStorageAdapter(
  supabase.storage,
  "your-bucket-name"
);
const uploadService = new StorageUploadService(storageAdapter);
```

### 3. Migrate Your Upload Components

#### Before (Old Way)

```typescript
import { useMediaUpload } from "@/hooks/useMediaUpload";

function MyComponent() {
  const { upload, progress, error } = useMediaUpload({
    maxSize: 5 * 1024 * 1024,
    // Hardcoded to /api/media/upload
  });

  const handleUpload = async (file: File) => {
    const url = await upload(file);
  };
}
```

#### After (New Way)

```typescript
import { useMediaUpload } from "@letitrip/react-library";
import { useUploadService } from "@/contexts/ServicesContext";

function MyComponent() {
  const uploadService = useUploadService();

  const { upload, progress, error } = useMediaUpload({
    uploadService, // Now required
    maxSize: 5 * 1024 * 1024,
  });

  const handleUpload = async (file: File) => {
    const url = await upload(file);
  };
}
```

### 4. Setup Services Context (One-Time Setup)

Create a services context to provide upload service throughout your app:

```typescript
// src/contexts/ServicesContext.tsx
import React, { createContext, useContext } from "react";
import { UploadService } from "@letitrip/react-library";
import { createUploadService } from "@/lib/services/factory";

interface ServicesContextValue {
  uploadService: UploadService;
}

const ServicesContext = createContext<ServicesContextValue | null>(null);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const uploadService = createUploadService();

  return (
    <ServicesContext.Provider value={{ uploadService }}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useUploadService(): UploadService {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error("useUploadService must be used within ServicesProvider");
  }
  return context.uploadService;
}
```

Create a service factory:

```typescript
// src/lib/services/factory.ts
import { ApiUploadService } from "@letitrip/react-library";
import type { UploadService } from "@letitrip/react-library";

export function createUploadService(): UploadService {
  // For Next.js apps, use API routes
  return new ApiUploadService("/api/media/upload");

  // OR for direct Firebase Storage:
  // const storage = getStorage(app);
  // const adapter = new FirebaseStorageAdapter(storage);
  // return new StorageUploadService(adapter);
}
```

Wrap your app:

```typescript
// src/app/layout.tsx or _app.tsx
import { ServicesProvider } from "@/contexts/ServicesContext";

export default function RootLayout({ children }) {
  return <ServicesProvider>{children}</ServicesProvider>;
}
```

## Component-Specific Migration

### ImageUploadWithCrop

#### Before

```typescript
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";

<ImageUploadWithCrop
  maxSize={5242880}
  onUploadComplete={(url) => console.log(url)}
/>;
```

#### After

```typescript
import { ImageUploadWithCrop } from "@letitrip/react-library";
import { useUploadService } from "@/contexts/ServicesContext";

function MyComponent() {
  const uploadService = useUploadService();

  return (
    <ImageUploadWithCrop
      uploadService={uploadService}
      maxSize={5242880}
      onUploadComplete={(url) => console.log(url)}
    />
  );
}
```

### VideoUploadWithThumbnail

#### Before

```typescript
import VideoUploadWithThumbnail from "@/components/VideoUploadWithThumbnail";

<VideoUploadWithThumbnail
  maxSize={104857600}
  onUploadComplete={(urls) => console.log(urls)}
/>;
```

#### After

```typescript
import { VideoUploadWithThumbnail } from "@letitrip/react-library";
import { useUploadService } from "@/contexts/ServicesContext";

function MyComponent() {
  const uploadService = useUploadService();

  return (
    <VideoUploadWithThumbnail
      uploadService={uploadService}
      maxSize={104857600}
      onUploadComplete={(urls) => console.log(urls)}
    />
  );
}
```

### useMediaUploadWithCleanup Hook

#### Before

```typescript
import { useMediaUploadWithCleanup } from "@/hooks/useMediaUploadWithCleanup";

function MyComponent() {
  const { upload, progress, error, cleanup } = useMediaUploadWithCleanup({
    maxSize: 5242880,
  });
}
```

#### After

```typescript
import { useMediaUploadWithCleanup } from "@/hooks/useMediaUploadWithCleanup";

function MyComponent() {
  // Hook now automatically uses context internally
  const { upload, progress, error, cleanup } = useMediaUploadWithCleanup({
    maxSize: 5242880,
  });
}
```

## Common Pitfalls

### 1. Forgetting to Wrap App with ServicesProvider

❌ **Error**: "useUploadService must be used within ServicesProvider"

✅ **Solution**: Wrap your app root with `<ServicesProvider>`

```typescript
// app/layout.tsx
import { ServicesProvider } from "@/contexts/ServicesContext";

export default function RootLayout({ children }) {
  return <ServicesProvider>{children}</ServicesProvider>;
}
```

### 2. Not Passing uploadService to Components

❌ **Error**: "uploadService is required"

```typescript
// Wrong
<ImageUploadWithCrop maxSize={5242880} />
```

✅ **Solution**: Pass uploadService prop

```typescript
// Correct
const uploadService = useUploadService();
<ImageUploadWithCrop uploadService={uploadService} maxSize={5242880} />;
```

### 3. Using Old Hook Import Path

❌ **Wrong**:

```typescript
import { useMediaUpload } from "@/hooks/useMediaUpload";
```

✅ **Correct**:

```typescript
import { useMediaUpload } from "@letitrip/react-library";
```

### 4. Mixing Old and New Components

❌ **Wrong**: Using old local component with new library hook

```typescript
import ImageUpload from "@/components/ImageUpload"; // Old
import { useMediaUpload } from "@letitrip/react-library"; // New
```

✅ **Correct**: Use library components

```typescript
import { ImageUploadWithCrop, useMediaUpload } from "@letitrip/react-library";
```

### 5. Hardcoding Upload URLs

❌ **Wrong**: Bypassing the service layer

```typescript
const upload = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return fetch("/api/media/upload", { method: "POST", body: formData });
};
```

✅ **Correct**: Use the upload service

```typescript
const uploadService = useUploadService();
const { upload } = useMediaUpload({ uploadService });
```

## Testing Migration

### Before (Mocking fetch)

```typescript
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ url: "https://cdn.example.com/image.jpg" }),
  })
);
```

### After (Using MockUploadService)

```typescript
import { MockUploadService } from "@letitrip/react-library";

const mockUploadService = new MockUploadService({
  mockUrl: "https://cdn.example.com/image.jpg",
  delay: 100,
  shouldFail: false,
});

<ImageUploadWithCrop uploadService={mockUploadService} maxSize={5242880} />;
```

## Advanced: Custom Upload Service

If you need custom upload logic:

```typescript
import { UploadService, UploadOptions } from "@letitrip/react-library";

export class CustomUploadService implements UploadService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async upload(file: File, options?: UploadOptions): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("apiKey", this.apiKey);

    // Add custom headers
    const response = await fetch("https://your-cdn.com/upload", {
      method: "POST",
      body: formData,
      headers: {
        "X-Custom-Header": "value",
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  }

  async delete(url: string): Promise<void> {
    await fetch(`https://your-cdn.com/delete`, {
      method: "DELETE",
      body: JSON.stringify({ url }),
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
      },
    });
  }
}

// Usage
const uploadService = new CustomUploadService("your-api-key");
```

## React Native Migration

The library works in React Native too! Just use a different storage adapter:

```typescript
import { ApiUploadService } from "@letitrip/react-library";

// For React Native, use your backend API
const uploadService = new ApiUploadService("https://api.yourapp.com/upload");

// Or use Firebase Storage (works in RN)
import { getStorage } from "firebase/storage";
import {
  FirebaseStorageAdapter,
  StorageUploadService,
} from "@letitrip/react-library";

const storage = getStorage(app);
const storageAdapter = new FirebaseStorageAdapter(storage);
const uploadService = new StorageUploadService(storageAdapter);
```

## Environment-Specific Configuration

Configure different backends for dev/staging/production:

```typescript
// src/lib/services/factory.ts
import {
  ApiUploadService,
  FirebaseStorageAdapter,
  StorageUploadService,
} from "@letitrip/react-library";
import { getStorage } from "firebase/storage";
import { app } from "@/lib/firebase/config";

export function createUploadService() {
  if (process.env.NODE_ENV === "development") {
    // Use mock service in development
    return new ApiUploadService("/api/media/upload");
  }

  if (process.env.NEXT_PUBLIC_USE_FIREBASE_STORAGE === "true") {
    // Use Firebase Storage directly
    const storage = getStorage(app);
    const adapter = new FirebaseStorageAdapter(storage);
    return new StorageUploadService(adapter);
  }

  // Default: Use Next.js API routes
  return new ApiUploadService("/api/media/upload");
}
```

## FAQ

### Q: Do I need to change my API routes?

**A**: No! Your existing `/api/media/upload` routes work as-is with `ApiUploadService`.

### Q: Can I use multiple upload backends in the same app?

**A**: Yes! Create multiple service instances:

```typescript
const apiUpload = new ApiUploadService('/api/media/upload');
const firebaseUpload = new StorageUploadService(firebaseAdapter);

// Use different services for different components
<ImageUploadWithCrop uploadService={apiUpload} />
<VideoUploadWithThumbnail uploadService={firebaseUpload} />
```

### Q: How do I handle authentication?

**A**: Pass auth tokens via the service:

```typescript
class AuthenticatedUploadService implements UploadService {
  async upload(file: File, options?: any): Promise<string> {
    const token = await getAuthToken();

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/media/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    // ...
  }
}
```

### Q: Can I still use the old components?

**A**: Technically yes, but they're deprecated. Migrate to the library for:

- Better testing support
- Framework flexibility
- Consistent API across projects
- Regular updates and bug fixes

### Q: What about TypeScript types?

**A**: All types are exported from the library:

```typescript
import type {
  UploadService,
  UploadOptions,
  UploadProgress,
  ImageUploadProps,
  VideoUploadProps,
} from "@letitrip/react-library";
```

### Q: How do I migrate tests?

**A**: Use `MockUploadService` from the library:

```typescript
import { MockUploadService } from "@letitrip/react-library";
import { render } from "@testing-library/react";

const mockUploadService = new MockUploadService({
  mockUrl: "https://cdn.example.com/test.jpg",
  delay: 0,
});

render(
  <ImageUploadWithCrop uploadService={mockUploadService} maxSize={5242880} />
);
```

## Troubleshooting

### TypeScript Errors

If you see "Cannot find module '@letitrip/react-library'":

1. Check package.json includes the library
2. Run `npm install`
3. Restart TypeScript server (VS Code: Cmd+Shift+P → "Restart TS Server")

### Runtime Errors

If uploads fail at runtime:

1. Check `ServicesProvider` is wrapping your app
2. Verify API route is accessible
3. Check browser console for CORS errors
4. Verify file size limits match server config

### Build Errors

If build fails with "Module not found":

1. Clear `.next` cache: `rm -rf .next`
2. Reinstall deps: `rm -rf node_modules && npm install`
3. Rebuild: `npm run build`

## Migration Checklist

- [ ] Install `@letitrip/react-library@latest`
- [ ] Create `ServicesContext.tsx`
- [ ] Create `factory.ts` for service creation
- [ ] Wrap app with `<ServicesProvider>`
- [ ] Update all imports from local to library
- [ ] Pass `uploadService` prop to all upload components
- [ ] Update tests to use `MockUploadService`
- [ ] Remove old local components (optional)
- [ ] Test uploads in dev environment
- [ ] Test uploads in production

## Support

For issues or questions:

- GitHub Issues: [github.com/yourusername/react-library/issues](https://github.com/yourusername/react-library/issues)
- Documentation: [react-library.docs.com](https://react-library.docs.com)

## Version Compatibility

| Library Version | Next.js | React | TypeScript |
| --------------- | ------- | ----- | ---------- |
| 1.0.0+          | 13.0+   | 18.0+ | 5.0+       |

---

**Last Updated**: January 2025
