# AI Agent Development Guide - JustForView.in

**Last Updated**: November 19, 2025  
**Repository**: https://github.com/mohasinac/justforview.in  
**Current Branch**: Refactoring

This guide helps AI agents understand and work effectively with this Next.js auction platform codebase.

## Quick Reference

**Project Type**: Next.js 14+ (App Router) with TypeScript  
**Primary Domain**: Auction & E-commerce Platform for India  
**No Mocks**: All APIs are real and ready - never suggest mock data  
**Code Over Docs**: Focus on implementation, not documentation

## Architecture Overview

### Application Structure

```
ROUTING: Next.js App Router (src/app/)
├── Pages: Each folder in app/ is a route
├── API Routes: app/api/ contains backend endpoints
└── Layouts: Shared UI in layout.tsx files

COMPONENTS: React components (src/components/)
├── Feature-based: admin/, auction/, cart/, checkout/, product/
├── Layout: Header, Footer, Navigation components
└── Common: Shared UI components

SERVICES: API abstraction layer (src/services/)
├── Real API calls - NO MOCKS
├── Centralized error handling
└── TypeScript types for all requests/responses

STATE: Context + Hooks pattern
├── AuthContext: User authentication
├── UploadContext: Media uploads
└── Custom hooks: useCart, useAuctionSocket, etc.
```

### Core Technologies

- **Next.js 14+**: App Router, Server/Client Components
- **TypeScript**: Strict mode, comprehensive types in src/types/
- **Tailwind CSS**: Utility-first styling
- **Firebase**: Firestore (DB), Storage (files), Auth, Realtime Database, Analytics
- **Vercel**: Deployment platform (FREE tier)

### FREE Tier Architecture (Zero Cost)

**Cost Optimization**: Migrated from paid services to 100% FREE tier solutions saving $432/year.

**Replaced Services**:
- ❌ **Sentry** ($26/mo) → ✅ Firebase Analytics + Discord webhooks
- ❌ **Redis** ($10/mo) → ✅ In-memory cache (`src/lib/memory-cache.ts`)
- ❌ **Socket.IO** (hosting cost) → ✅ Firebase Realtime Database
- ❌ **Slack** (unused) → ✅ Discord webhooks

**FREE Libraries Created**:
1. `src/lib/memory-cache.ts` - In-memory caching with TTL and auto-cleanup
2. `src/lib/rate-limiter.ts` - Sliding window rate limiting
3. `src/lib/discord-notifier.ts` - Team notifications via Discord webhooks
4. `src/lib/firebase-error-logger.ts` - Error tracking with Firebase Analytics
5. `src/lib/firebase-realtime.ts` - Real-time auction bidding with Firebase Realtime Database

**Migration Guide**: See `FIREBASE-MIGRATION-CHECKLIST.md` and `COST-OPTIMIZATION-GUIDE.md`

## Key Patterns to Follow

### 1. Type System Architecture (MANDATORY)

**Strict TypeScript with Frontend/Backend type separation. Zero `any` types allowed.**

#### Core Principles
- **FE/BE Separation**: Frontend types for UI, Backend types for API
- **Service Layer Transformation**: Convert between FE and BE types automatically
- **No `any` Types**: Use explicit types everywhere
- **Field-Level Validation**: Show errors below each input field
- **Persistent Action Buttons**: Save/Create buttons always visible

#### Type Directory Structure
```
src/types/
  /frontend/       - UI-optimized types (ProductFE, UserFE, etc.)
  /backend/        - API response types (ProductBE, UserBE, etc.)
  /shared/         - Common types (enums, utilities, base interfaces)
  /transforms/     - Conversion functions (toFE*, toBE*)
```

#### Usage Pattern
```typescript
// Backend type matches API response
interface ProductBE {
  id: string;
  name: string;
  price: number;
  createdAt: Timestamp; // Firestore Timestamp
}

// Frontend type optimized for UI
interface ProductFE {
  id: string;
  name: string;
  price: number;
  createdAt: Date;
  formattedPrice: string; // "₹1,999"
  discount?: number;
  discountPercentage?: string; // "20%"
  badges: string[]; // ["New", "Sale"]
}

// Transform in service layer
async getProduct(id: string): Promise<ProductFE> {
  const productBE = await apiService.get<ProductBE>(`/api/products/${id}`);
  return toFEProduct(productBE); // BE → FE transformation
}

// Component uses FE type
const ProductCard: React.FC<{ product: ProductFE }> = ({ product }) => (
  <div>
    <h3>{product.name}</h3>
    <p>{product.formattedPrice}</p>
    {product.badges.map(badge => <span key={badge}>{badge}</span>)}
  </div>
);
```

#### Documentation
- **[TYPE-MIGRATION-GUIDE.md](../../TYPE-MIGRATION-GUIDE.md)** - Examples and best practices
- **[TYPE-REFACTOR-PLAN.md](../../TYPE-REFACTOR-PLAN.md)** - Implementation roadmap
- **[TYPE-SYSTEM-STATUS.md](../../TYPE-SYSTEM-STATUS.md)** - Current completion status

### 2. Service Layer Pattern (CRITICAL)

**NEVER call APIs directly from components, pages, or hooks. ALWAYS use the service layer.**

```typescript
// ❌ WRONG: Direct fetch in component
export default function ProductPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // DON'T DO THIS
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);
}

// ❌ WRONG: Direct apiService in component
import { apiService } from '@/services/api.service';

export default function ProductPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // DON'T DO THIS
    apiService.get('/api/products').then(setProducts);
  }, []);
}

// ✅ CORRECT: Use service layer
import { productService } from '@/services/products.service';

export default function ProductPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    productService.getProducts().then(setProducts);
  }, []);
}
```

**Service Layer Benefits**:
- Centralized business logic
- Consistent error handling
- Type safety for all requests/responses
- Easier testing and mocking
- Single source of truth for API calls
- Authentication headers automatically added

**Creating a New Service**:

```typescript
// src/services/feature.service.ts
import { apiService } from './api.service';
import { Feature, FeatureFilters } from '@/types/feature';

class FeatureService {
  private readonly BASE_PATH = '/api/features';

  async getFeatures(filters?: FeatureFilters): Promise<Feature[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.category) params.set('category', filters.category);

    const url = params.toString()
      ? `${this.BASE_PATH}?${params}`
      : this.BASE_PATH;

    const response = await apiService.get<{ features: Feature[] }>(url);
    return response.features;
  }

  async getFeatureById(id: string): Promise<Feature> {
    const response = await apiService.get<{ feature: Feature }>(
      `${this.BASE_PATH}/${id}`
    );
    return response.feature;
  }

  async createFeature(data: Partial<Feature>): Promise<Feature> {
    const response = await apiService.post<{ feature: Feature }>(
      this.BASE_PATH,
      data
    );
    return response.feature;
  }

  async updateFeature(id: string, data: Partial<Feature>): Promise<Feature> {
    const response = await apiService.patch<{ feature: Feature }>(
      `${this.BASE_PATH}/${id}`,
      data
    );
    return response.feature;
  }

  async deleteFeature(id: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }
}

export const featureService = new FeatureService();
```

**Using Services in Custom Hooks**:

```typescript
// ✅ CORRECT: Service layer in hooks
import { useState, useEffect } from 'react';
import { productService } from '@/services/products.service';

export function useProducts(filters?) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts(filters);
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  return { products, loading, error };
}
```

**Error Handling in Services**:

All services inherit error handling from `apiService`, which:
- Automatically retries on network errors
- Parses error responses
- Throws typed errors
- Logs errors to console (dev) or tracking service (prod)

**Available Services** (always check before creating new ones):
- `authService` - Authentication (login, register, logout)
- `productService` - Product CRUD and search
- `auctionService` - Auction operations and bidding
- `cartService` - Shopping cart management
- `orderService` - Order processing
- `shopService` - Shop/vendor operations
- `categoryService` - Category management
- `couponService` - Discount codes
- `reviewService` - Product reviews
- `userService` - User profile management
- `mediaService` - File uploads (images, videos)
- `addressService` - User addresses
- `supportService` - Support tickets
- `testDataService` - Test data generation (admin only)

### 3. Component Patterns

```typescript
// Client Components (interactive)
"use client";
import { useState } from "react";

// Server Components (default, no directive needed)
// Use for data fetching, static content

// Component organization
components / feature - name / ComponentName.tsx; // Main component
SubComponent.tsx; // Related components
```

### 4. API Route Pattern

```typescript
// API routes in src/app/api/[endpoint]/route.ts
export async function GET(request: Request) {
  // Handle GET requests
}

export async function POST(request: Request) {
  // Handle POST requests
}
```

### 5. Media Upload Pattern (Images & Videos)

**CRITICAL**: All media uploads go through `mediaService.upload()` which handles Firebase Storage uploads and returns URLs for database storage.

**Architecture**:

```
Component (Form)
  ↓ File selection
mediaService.upload({ file, context })
  ↓ API call with file
API Route (/api/media/upload)
  ↓ Firebase Admin SDK
Firebase Storage
  ↓ Returns public URL
Database stores URL only (not file)
```

**Upload Flow**:

1. User selects file in form (image or video)
2. Call `mediaService.upload()` with file and context
3. Service uploads to Firebase Storage
4. Returns public URL
5. Store URL in database (NOT the file)

**Implementation Pattern**:

```typescript
// ✅ CORRECT: In product/auction create forms
const [uploadingImages, setUploadingImages] = useState(false);
const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
  {}
);

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files) return;

  const files = Array.from(e.target.files);
  setUploadingImages(true);

  try {
    const uploadPromises = files.map(async (file, index) => {
      const key = `image-${index}`;
      setUploadProgress((prev) => ({ ...prev, [key]: 0 }));

      // Upload to Firebase Storage and get URL
      const result = await mediaService.upload({
        file,
        context: "product", // or "auction", "shop", etc.
      });

      setUploadProgress((prev) => ({ ...prev, [key]: 100 }));
      return result.url; // This is what gets saved to database
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    // Store URLs in form data
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls],
    }));
  } catch (error) {
    console.error("Upload failed:", error);
    alert("Failed to upload images");
  } finally {
    setUploadingImages(false);
    setUploadProgress({});
  }
};

// In JSX
<input
  type="file"
  multiple
  accept="image/*"
  onChange={handleImageUpload}
  disabled={uploadingImages}
/>;

// Show upload progress
{
  uploadingImages && (
    <div className="space-y-2">
      {Object.entries(uploadProgress).map(([key, progress]) => (
        <div key={key} className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs">{progress}%</span>
        </div>
      ))}
    </div>
  );
}

// Display uploaded images with remove option
{
  formData.images.map((url, index) => (
    <div key={index} className="relative group">
      <img src={url} alt={`Product ${index + 1}`} />
      <button
        onClick={() => {
          setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
          }));
        }}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
      >
        ×
      </button>
    </div>
  ));
}
```

**Database Schema**:

```typescript
// In Firestore, we store URLs as arrays
{
  id: "product-123",
  name: "Product Name",
  images: [
    "https://firebasestorage.googleapis.com/.../image1.jpg",
    "https://firebasestorage.googleapis.com/.../image2.jpg"
  ],
  videos: [
    "https://firebasestorage.googleapis.com/.../video1.mp4"
  ],
  // ... other fields
}
```

**Key Points**:

- ✅ Files uploaded to Firebase Storage
- ✅ Only URLs stored in Firestore/Database
- ✅ Use `mediaService.upload()` - never direct Firebase SDK
- ✅ Show upload progress for better UX
- ✅ Support multiple file uploads
- ✅ Allow removal of uploaded media
- ✅ Validate file types and sizes

**Media Service**:

```typescript
// src/services/media.service.ts
class MediaService {
  async upload(params: {
    file: File;
    context: "product" | "auction" | "shop" | "blog" | "user";
  }): Promise<{ url: string; storagePath: string }> {
    const formData = new FormData();
    formData.append("file", params.file);
    formData.append("context", params.context);

    const response = await apiService.post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  }
}
```

**Supported Contexts & Paths**:

- `product` → `/product-images/**` or `/product-videos/**`
- `auction` → `/auction-images/**` or `/auction-videos/**`
- `shop` → `/shop-logos/**` or `/shop-banners/**`
- `blog` → `/blog-media/**`
- `user` → `/user-documents/**`

**File Limits**:

- Images: 10MB per file (JPEG, PNG, GIF, WebP)
- Videos: 100MB per file (MP4, WebM, MOV)
- Multiple files: Up to 10 files per upload

### 6. Firebase Storage Architecture Pattern (Advanced)

```typescript
// ✅ CORRECT: Client Service
export async function uploadAsset(file: File, type: string, category?: string) {
  // Step 1: Get signed URL from API
  const { uploadUrl, assetId, storagePath } = await apiService.post(
    "/admin/static-assets/upload-url",
    { fileName: file.name, contentType: file.type, type, category }
  );

  // Step 2: Upload directly to Firebase Storage
  await fetch(uploadUrl, { method: "PUT", body: file });

  // Step 3: Confirm and save metadata
  const { asset } = await apiService.post(
    "/admin/static-assets/confirm-upload",
    { assetId, name: file.name, type, storagePath, size: file.size }
  );

  return asset;
}

// ❌ WRONG: Direct Firebase SDK in client
import { getStorage } from "firebase/storage"; // NO!
const storage = getStorage();
await uploadBytes(ref(storage, path), file); // NO!
```

**Server Service Pattern** (`src/app/api/lib/`):

```typescript
// Firebase Admin SDK operations only
import { getStorage } from "firebase-admin/storage";
import { getFirestoreAdmin } from "./firebase/admin";

export async function generateUploadUrl(fileName: string, contentType: string) {
  const storage = getStorage();
  const bucket = storage.bucket();
  const file = bucket.file(`static-assets/${fileName}`);

  const [uploadUrl] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  });

  return { uploadUrl, storagePath: file.name };
}
```

**Storage Paths & Rules**:

- `/shop-logos/**` - Sellers, images only
- `/shop-banners/**` - Sellers, images only
- `/product-images/**` - Sellers, images only
- `/product-videos/**` - Sellers, videos only, 100MB limit
- `/static-assets/{type}/{category}/**` - Admins, all types, 50MB limit
- `/blog-media/{postId}/**` - Admins, images/videos, 50MB limit
- `/user-documents/{userId}/**` - Users (own files), documents only, 10MB limit

**Supported File Types**:

- **Images**: All formats (`image/*`)
- **Videos**: All formats (`video/*`)
- **Documents**: PDF, Word, Excel, Text

### 7. Firebase Realtime Database Pattern (Socket.IO Replacement)

**CRITICAL**: Firebase Realtime Database is used for real-time auction bidding instead of Socket.IO.

**Architecture**:

```
Client Component
  ↓ Subscribe
Firebase Realtime Database
  ↓ Real-time updates
Client receives live data
```

**Usage Pattern**:

```typescript
// Import Realtime Database service
import {
  subscribeToAuction,
  subscribeToAuctionBids,
  placeBid,
} from "@/lib/firebase-realtime";

// In component
useEffect(() => {
  // Subscribe to auction status
  const unsubscribe = subscribeToAuction(auctionId, (status) => {
    setCurrentBid(status.currentBid);
    setBidCount(status.bidCount);
    setIsActive(status.isActive);
  });

  // Cleanup on unmount
  return unsubscribe;
}, [auctionId]);

// Subscribe to recent bids (last 10)
useEffect(() => {
  const unsubscribe = subscribeToAuctionBids(auctionId, (bids) => {
    setBidHistory(bids);
  });

  return unsubscribe;
}, [auctionId]);

// Place bid (call via API route)
const handlePlaceBid = async (amount: number) => {
  const response = await fetch(`/api/auctions/${auctionId}/bid`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });

  // API route uses placeBid() internally
  // Real-time updates will propagate to all subscribers
};
```

**Server-Side API Pattern** (API routes):

```typescript
// In API route: /api/auctions/[id]/bid/route.ts
import { placeBid } from "@/lib/firebase-realtime";

export async function POST(req: Request) {
  const { amount } = await req.json();
  const userId = req.userId; // From auth middleware

  // Place bid - updates Realtime Database
  const result = await placeBid(auctionId, userId, userName, amount);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // All subscribed clients receive update automatically
  return NextResponse.json({ success: true, bidId: result.bidId });
}
```

**Database Structure**:

```
auctions/
  {auctionId}/
    status/
      auctionId: string
      currentBid: number
      bidCount: number
      isActive: boolean
      endTime: number
      winnerId: string
      lastUpdate: number
    bids/
      {bidId}/
        auctionId: string
        userId: string
        userName: string
        amount: number
        timestamp: number
```

**Benefits vs Socket.IO**:

- ✅ No server required (Firebase handles connections)
- ✅ Automatic scaling (Firebase FREE tier: 100 concurrent connections)
- ✅ Offline support built-in
- ✅ Real-time sync across all clients
- ✅ Security rules for access control
- ✅ Zero cost on FREE tier

**Security Rules** (set in Firebase Console):

```json
{
  "rules": {
    "auctions": {
      "$auctionId": {
        ".read": true,
        ".write": "auth != null",
        "bids": {
          ".indexOn": ["timestamp"]
        }
      }
    }
  }
}
```

### 8. State Management

```typescript
// Use Context for global state
import { useAuth } from "@/contexts/AuthContext";

// Use custom hooks for feature state
import { useCart } from "@/hooks/useCart";
import { useAuctionSocket } from "@/hooks/useAuctionSocket";
```

### 9. FREE Tier Caching Pattern (Redis Replacement)

**CRITICAL**: In-memory caching is used instead of Redis.

**Architecture**:

```
Component/Service
  ↓ Cache check (src/lib/memory-cache.ts)
  ↓ Data fetch (if cache miss)
  ↓ Cache write (on data change)
```

**Usage Pattern**:

```typescript
// Import cache functions
import { cacheSet, cacheGet, cacheDelete } from "@/lib/memory-cache";

// In service or component
async function getData(key: string) {
  // Check cache first
  const cached = cacheGet(key);
  if (cached) return cached;

  // Fetch from API or database
  const data = await apiService.get(`/api/data/${key}`);

  // Update cache
  cacheSet(key, data, { ttl: 3600 }); // 1 hour TTL

  return data;
}

// On data update
async function updateData(key: string, newData: any) {
  // Update API or database
  await apiService.put(`/api/data/${key}`, newData);

  // Update cache
  cacheSet(key, newData);
}

// On data delete
async function deleteData(key: string) {
  // Delete API or database
  await apiService.delete(`/api/data/${key}`);

  // Invalidate cache
  cacheDelete(key);
}
```

**Cache Library API** (`src/lib/memory-cache.ts`):

```typescript
// In-memory cache with TTL
const cache = new Map<string, { expire: number, value: any }>();

export function cacheSet(key: string, value: any, options?: { ttl?: number }) {
  const expire = Date.now() + (options?.ttl || 60) * 1000;
  cache.set(key, { expire, value });
}

export function cacheGet(key: string) {
  const data = cache.get(key);
  if (!data) return null;

  // Check expiration
  if (Date.now() > data.expire) {
    cache.delete(key);
    return null;
  }

  return data.value;
}

export function cacheDelete(key: string) {
  cache.delete(key);
}
```

**Supported Patterns**:

- Cache GET requests by URL
- Cache POST/PUT response data
- Invalidate cache on data change (create/update/delete)
- Set custom TTL for each cache entry

**Key Benefits**:

- ✅ Zero cost - fully in-memory
- ✅ No external dependencies
- ✅ Fast access - local memory lookup
- ✅ Simple API - drop-in replacement for Redis

**Limitations**:

- ❌ Volatile - data lost on server restart
- ❌ Limited by server memory
- ❌ No advanced features (pub/sub, persistence)

### 10. FREE Tier Rate Limiting Pattern

**Location**: `src/lib/rate-limiter.ts`

### 11. FREE Tier Error Tracking Pattern (Sentry Replacement)

**Location**: `src/lib/firebase-error-logger.ts`

### 12. FREE Tier Team Notifications (Slack Replacement)

**Location**: `src/lib/discord-notifier.ts`

## Common Tasks Guide

### Creating a New Feature

1. **Plan the feature** - Define requirements, API endpoints, and UI components
2. **Create API routes** - Add endpoints in `src/app/api/`
3. **Add service layer** - Create/update service in `src/services/`
4. **Create types** - Add FE/BE types in `src/types/`
5. **Build components** - Create UI in `src/components/`
6. **Add routing** - Create pages in `src/app/`
7. **Test thoroughly** - Use existing patterns and test all scenarios

### Adding a New API Endpoint

```typescript
// 1. Create API route: src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Your logic here
    return NextResponse.json({ data: 'example' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Your logic here
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### Creating a New Service

```typescript
// 2. Create service: src/services/example.service.ts
import { apiService } from './api.service';

class ExampleService {
  async getExamples(): Promise<Example[]> {
    const response = await apiService.get('/api/examples');
    return response.data;
  }

  async createExample(data: ExampleForm): Promise<Example> {
    const response = await apiService.post('/api/examples', data);
    return response.data;
  }
}

export const exampleService = new ExampleService();
```

### Adding Form Validation

```typescript
// Use existing validation patterns
import { useState } from 'react';

export function useExampleForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { formData, setFormData, errors, validate };
}
```

### File Upload Implementation

```typescript
// Use mediaService for all uploads
import { mediaService } from '@/services/media.service';

const handleFileUpload = async (file: File) => {
  try {
    const result = await mediaService.upload({
      file,
      context: 'product' // or 'auction', 'shop', etc.
    });

    // Store result.url in your form/database
    setFormData(prev => ({
      ...prev,
      imageUrl: result.url
    }));
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Real-time Updates

```typescript
// For auction bidding, use Firebase Realtime
import { subscribeToAuction } from '@/lib/firebase-realtime';

useEffect(() => {
  const unsubscribe = subscribeToAuction(auctionId, (status) => {
    setCurrentBid(status.currentBid);
    setBidCount(status.bidCount);
  });

  return unsubscribe;
}, [auctionId]);
```

### Error Handling

```typescript
// Use try/catch with user-friendly messages
try {
  await exampleService.createExample(formData);
  // Success - show success message or redirect
} catch (error: any) {
  // Error - show user-friendly message
  const message = error.message || 'Something went wrong';
  setError(message);
}
```

### Testing Checklist

- [ ] API endpoints return correct data
- [ ] Form validation works for all fields
- [ ] Error states are handled gracefully
- [ ] Loading states are shown appropriately
- [ ] Mobile responsiveness is tested
- [ ] Authentication is required where needed
- [ ] File uploads work correctly
- [ ] Real-time updates work (if applicable)

### Deployment Checklist

- [ ] Build passes without TypeScript errors
- [ ] All environment variables are set
- [ ] Firebase configuration is correct
- [ ] Database migrations are applied
- [ ] Static assets are uploaded
- [ ] Admin user is created
- [ ] Test data is generated (if needed)
