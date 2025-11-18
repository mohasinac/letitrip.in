# AI Agent Development Guide - JustForView.in

**Last Updated**: November 18, 2025  
**Repository**: https://github.com/mohasinac/justforview.in  
**Current Branch**: enhancements-and-mobile-friendly

> **Complete guide for AI agents working on this Next.js auction & e-commerce platform**

---

## 📋 Table of Contents

- [Quick Reference](#quick-reference)
- [Golden Rules](#golden-rules)
- [Project Architecture](#project-architecture)
- [Critical Patterns](#critical-patterns)
- [Common Tasks](#common-tasks)
- [Testing & Validation](#testing--validation)
- [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Reference

**Project Type**: Next.js 16+ (App Router) with TypeScript 5.3  
**Primary Domain**: Auction & E-commerce Platform for India  
**No Mocks**: All APIs are real and ready - never suggest mock data  
**Code Over Docs**: Focus on implementation, not documentation

**Key Facts**:
- 🏗️ **Architecture**: Service Layer Pattern (25+ services)
- 🔥 **Backend**: Firebase (Firestore, Storage, Realtime DB, Auth)
- 💰 **Cost**: $0/month (100% FREE tier)
- 📦 **Components**: 164 pages, Server + Client separation
- 🎨 **Styling**: Tailwind CSS 3.4
- 🧪 **Testing**: 11 test workflows (140+ steps)

---

## 🔑 Golden Rules

### ALWAYS DO ✅

1. **Use Service Layer** - NEVER call APIs directly from components
   ```typescript
   // ✅ CORRECT
   import { productsService } from '@/services/products.service';
   const products = await productsService.getProducts();
   
   // ❌ WRONG
   const response = await fetch('/api/products');
   ```

2. **Read Existing Code First** - Before making changes, understand the current implementation

3. **Follow TypeScript Strict Mode** - No `any` types except for external libraries

4. **Use Real APIs** - Never suggest mock data; all APIs are implemented

5. **Test After Editing** - Verify changes work before considering task complete

6. **Server/Client Separation** - Use Server Components by default, Client only when needed

7. **Use Existing Patterns** - Follow established code patterns in the codebase

8. **Handle Errors** - Always wrap async calls in try-catch

### NEVER DO ❌

1. **Direct API Calls** - Never use `fetch()` or `apiService.get()` in components
2. **Mock Data** - APIs are ready; don't create fake data
3. **Skip Type Checking** - Always define proper TypeScript types
4. **Firebase Client SDK in Components** - Use API routes for Firebase operations
5. **Hardcode Values** - Use constants from `src/constants/`
6. **Ignore Existing Patterns** - Don't introduce new patterns without good reason
7. **Create Documentation Files** - Focus on code implementation only
8. **Use `any` Type** - Except for unavoidable external library integrations

---

## 🏗️ Project Architecture

### Application Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (routes)/          # Public routes (products, auctions, etc.)
│   ├── admin/             # Admin pages (protected)
│   ├── seller/            # Seller dashboard (protected)
│   ├── api/               # API routes (backend)
│   │   ├── products/      # Product API
│   │   ├── auctions/      # Auction API
│   │   ├── orders/        # Order API
│   │   └── ...
│   └── layout.tsx         # Root layout
│
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── seller/           # Seller-specific components
│   ├── common/           # Shared components
│   ├── layout/           # Layout components (Header, Footer)
│   └── filters/          # Filter components
│
├── services/              # Service layer (25+ services)
│   ├── api.service.ts    # Base HTTP client
│   ├── products.service.ts
│   ├── auctions.service.ts
│   ├── cart.service.ts
│   └── ...
│
├── lib/                   # Utility libraries
│   ├── memory-cache.ts   # In-memory caching
│   ├── rate-limiter.ts   # API rate limiting
│   ├── firebase-*.ts     # Firebase utilities
│   └── date-utils.ts     # Safe date handling
│
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts        # Authentication hook
│   ├── useCart.ts        # Cart hook
│   └── ...
│
├── contexts/              # React contexts
│   ├── AuthContext.tsx   # Auth state
│   └── UploadContext.tsx # Upload state
│
├── types/                 # TypeScript types
│   ├── product.ts
│   ├── auction.ts
│   └── ...
│
└── constants/             # App constants
    ├── api-routes.ts     # API endpoint definitions
    ├── database.ts       # Firestore collection names
    └── ...
```

### Technology Stack

**Frontend**:
- Next.js 16+ (App Router)
- React 19
- TypeScript 5.3 (Strict)
- Tailwind CSS 3.4

**Backend**:
- Next.js API Routes
- Firebase Admin SDK
- Firestore (NoSQL Database)
- Firebase Storage (Files)
- Firebase Realtime Database (Auctions)
- Firebase Auth

**Hosting**:
- Vercel (FREE tier)
- Firebase Functions (Scheduled jobs)

### Data Flow

```
User Action
  ↓
Component (Client/Server)
  ↓
Service Layer (src/services/)
  ↓
API Service (base HTTP client)
  ↓
API Route (src/app/api/)
  ↓
Firebase Admin SDK
  ↓
Firebase Services (Firestore, Storage, etc.)
```

---

## 🎯 Critical Patterns

### 1. Service Layer Pattern (MANDATORY)

**Rule**: All API calls MUST go through the service layer.

**Bad Pattern** ❌:
```typescript
// Component making direct API call
export default function ProductList() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    // ❌ NEVER DO THIS
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.products));
  }, []);
}
```

**Good Pattern** ✅:
```typescript
// Component using service layer
import { productsService } from '@/services/products.service';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // ✅ CORRECT - Use service layer
        const data = await productsService.getProducts({ status: 'published' });
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**Creating a New Service**:
```typescript
// src/services/feature.service.ts
import { apiService } from './api.service';
import { Feature, FeatureFilters } from '@/types/feature';

class FeatureService {
  private readonly BASE_PATH = '/api/features';
  
  async getAll(filters?: FeatureFilters): Promise<Feature[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    
    const url = params.toString() 
      ? `${this.BASE_PATH}?${params}` 
      : this.BASE_PATH;
    
    const response = await apiService.get<{ features: Feature[] }>(url);
    return response.features;
  }
  
  async getById(id: string): Promise<Feature> {
    const response = await apiService.get<{ feature: Feature }>(
      `${this.BASE_PATH}/${id}`
    );
    return response.feature;
  }
  
  async create(data: Partial<Feature>): Promise<Feature> {
    const response = await apiService.post<{ feature: Feature }>(
      this.BASE_PATH,
      data
    );
    return response.feature;
  }
  
  async update(id: string, data: Partial<Feature>): Promise<Feature> {
    const response = await apiService.patch<{ feature: Feature }>(
      `${this.BASE_PATH}/${id}`,
      data
    );
    return response.feature;
  }
  
  async delete(id: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }
}

export const featureService = new FeatureService();
```

### 2. Server vs Client Components

**Default to Server Components** (no `"use client"` directive needed).

**Use Server Components for**:
- Data fetching
- Static content
- Reading cookies/headers
- Accessing environment variables server-side

```typescript
// Server Component (default)
export default async function ProductPage({ params }: { params: { id: string } }) {
  // Runs on server
  const product = await productsService.getById(params.id);
  
  return <ProductDisplay product={product} />;
}
```

**Use Client Components when you need**:
- Event handlers (onClick, onChange)
- State hooks (useState, useReducer)
- Effect hooks (useEffect)
- Browser APIs (localStorage, window)
- Context (useContext)

```typescript
'use client';

import { useState } from 'react';

export default function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    await cartService.add(productId, 1);
    setLoading(false);
  };
  
  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
```

### 3. File Upload Pattern (CRITICAL)

**Rule**: All file uploads must use `mediaService.upload()`.

```typescript
'use client';

import { useState } from 'react';
import { mediaService } from '@/services/media.service';

export default function ProductForm() {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    setUploading(true);
    
    try {
      const uploadPromises = files.map(file => 
        mediaService.upload({
          file,
          context: 'product' // or 'auction', 'shop', etc.
        })
      );
      
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.url);
      
      setImages(prev => [...prev, ...urls]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
        disabled={uploading}
      />
      
      {uploading && <div>Uploading...</div>}
      
      <div className="grid grid-cols-3 gap-4">
        {images.map((url, index) => (
          <img key={index} src={url} alt={`Product ${index + 1}`} />
        ))}
      </div>
    </div>
  );
}
```

### 4. TypeScript Patterns

**No `any` Types** - Use proper typing:

```typescript
// ❌ WRONG
const data: any = await fetch('/api/products');

// ✅ CORRECT
interface ProductResponse {
  products: Product[];
  total: number;
}
const data: ProductResponse = await productsService.getProducts();
```

**Use Utility Types**:
```typescript
// Partial - Make all properties optional
type ProductUpdate = Partial<Product>;

// Pick - Select specific properties
type ProductSummary = Pick<Product, 'id' | 'name' | 'price'>;

// Omit - Exclude specific properties
type ProductInput = Omit<Product, 'id' | 'createdAt'>;
```

### 5. Error Handling Pattern

Always handle errors in async operations:

```typescript
async function createProduct(data: ProductInput) {
  try {
    const product = await productsService.create(data);
    toast.success('Product created successfully');
    router.push(`/products/${product.id}`);
  } catch (error: any) {
    console.error('Failed to create product:', error);
    toast.error(error.message || 'Failed to create product');
  }
}
```

---

## 📝 Common Tasks

### Task 1: Adding a New Page

**Steps**:
1. Create page in `src/app/(routes)/your-page/page.tsx`
2. Decide if Server or Client Component
3. Fetch data using service layer
4. Style with Tailwind CSS

**Example**:
```typescript
// src/app/products/[id]/page.tsx
import { productsService } from '@/services/products.service';
import ProductDisplay from '@/components/products/ProductDisplay';

export default async function ProductPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const product = await productsService.getById(params.id);
  
  return <ProductDisplay product={product} />;
}
```

### Task 2: Adding a New API Route

**Steps**:
1. Create route in `src/app/api/your-endpoint/route.ts`
2. Implement HTTP methods (GET, POST, PATCH, DELETE)
3. Use Firebase Admin SDK for database operations
4. Return consistent JSON responses

**Example**:
```typescript
// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/app/api/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const db = getFirestoreAdmin();
    let query = db.collection('products');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.get();
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    const db = getFirestoreAdmin();
    const docRef = await db.collection('products').add({
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const doc = await docRef.get();
    const product = { id: doc.id, ...doc.data() };
    
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
```

### Task 3: Adding a New Service

**Steps**:
1. Create service file in `src/services/your-service.service.ts`
2. Define service class with methods
3. Use `apiService` for HTTP calls
4. Export singleton instance
5. Add to `src/services/index.ts`

**Example**: See "Creating a New Service" in Critical Patterns section above.

### Task 4: Creating a Component

**Steps**:
1. Determine if Server or Client Component
2. Create in appropriate directory (`src/components/`)
3. Define prop types with TypeScript
4. Use Tailwind for styling
5. Follow existing component patterns

**Example**:
```typescript
// src/components/products/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link 
      href={`/products/${product.id}`}
      className="block rounded-lg border p-4 hover:shadow-lg transition"
    >
      <div className="relative h-48 mb-4">
        <Image
          src={product.images[0] || '/placeholder.png'}
          alt={product.name}
          fill
          className="object-cover rounded"
        />
      </div>
      
      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-2">{product.description}</p>
      <p className="text-2xl font-bold text-blue-600">
        ₹{product.price.toLocaleString('en-IN')}
      </p>
      
      {product.featured && (
        <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
          Featured
        </span>
      )}
    </Link>
  );
}
```

---

## 🧪 Testing & Validation

### After Making Changes

**1. Type Check**:
```bash
npm run type-check
```

**2. Build Test**:
```bash
npm run build
```

**3. Manual Testing**:
- Test the specific feature you changed
- Check related functionality
- Test error scenarios

**4. Use Test Workflows**:
```bash
# Run all test workflows
npm run test:workflows:all

# Run specific workflow
npm run test:workflow:1
```

### Verification Checklist

After implementing a feature:
- ✅ TypeScript compiles without errors
- ✅ Build succeeds
- ✅ Feature works as expected
- ✅ Error handling tested
- ✅ No console errors
- ✅ Responsive design works
- ✅ Service layer used correctly

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

### 2. Component Patterns

```typescript
// Client Components (interactive)
"use client";
import { useState } from "react";

// Server Components (default, no directive needed)
// Use for data fetching, static content

// Component organization
components / feature - name / ComponentName.tsx; // Main component
SubComponent.tsx; // Related components
````,

### 3. API Route Pattern

```typescript
// API routes in src/app/api/[endpoint]/route.ts
export async function GET(request: Request) {
  // Handle GET requests
}

export async function POST(request: Request) {
  // Handle POST requests
}
```

### 4. Media Upload Pattern (Images & Videos)

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

### 5. Firebase Storage Architecture Pattern (Advanced)

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

### 5. Firebase Realtime Database Pattern (Socket.IO Replacement)

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

### 6. State Management

```typescript
// Use Context for global state
import { useAuth } from "@/contexts/AuthContext";

// Use custom hooks for feature state
import { useCart } from "@/hooks/useCart";
import { useAuctionSocket } from "@/hooks/useAuctionSocket";
```

### 7. FREE Tier Caching Pattern (Redis Replacement)

**Location**: `src/lib/memory-cache.ts`

**Usage in Services**:

```typescript
import { memoryCache } from "@/lib/memory-cache";

// Set cache with TTL (in seconds)
memoryCache.set("products-list", products, 300); // Cache for 5 minutes

// Get from cache
const cached = memoryCache.get("products-list");
if (cached) {
  return cached;
}

// Delete specific key
memoryCache.delete("products-list");

// Clear all cache
memoryCache.clear();

// Get statistics
const stats = memoryCache.getStats();
console.log(`Cache hits: ${stats.hits}, misses: ${stats.misses}`);
```

**Usage in Middleware**:

```typescript
// Updated cache middleware uses memoryCache automatically
import { withCache } from "@/app/api/middleware/cache";

export async function GET(req: NextRequest) {
  return withCache(req, handler, {
    ttl: 300, // 5 minutes (in seconds)
    key: "custom-cache-key", // Optional
  });
}
```

**Features**:

- ✅ TTL support with automatic expiration
- ✅ Auto-cleanup every 5 minutes
- ✅ Statistics tracking (hits, misses, size)
- ✅ Zero external dependencies
- ✅ Works on single server (perfect for Vercel)

**Limitations**:

- Cache clears on server restart (acceptable with Vercel's instant cold starts)
- Not suitable for multi-server setups (use Redis if scaling beyond 1000 users)

### 8. FREE Tier Rate Limiting Pattern

**Location**: `src/lib/rate-limiter.ts`

**Usage in Middleware**:

```typescript
import { withRateLimit } from "@/app/api/middleware/ratelimiter";

export async function POST(req: NextRequest) {
  return withRateLimit(req, handler, {
    limiterType: "auth", // 'api' | 'auth' | 'search'
    message: "Too many login attempts",
  });
}
```

**Direct Usage**:

```typescript
import {
  apiRateLimiter,
  authRateLimiter,
  strictRateLimiter,
} from "@/lib/rate-limiter";

// Check if request is allowed
const allowed = apiRateLimiter.check(userId);
if (!allowed) {
  return { error: "Rate limit exceeded" };
}

// Reset specific identifier
apiRateLimiter.reset(userId);

// Get statistics
const cleaned = apiRateLimiter.cleanup();
console.log(`Cleaned ${cleaned} expired entries`);
```

**Pre-configured Limiters**:

- `apiRateLimiter`: 200 requests per minute (general API)
- `authRateLimiter`: 5 requests per minute (login/register)
- `strictRateLimiter`: 10 requests per minute (sensitive operations)

**Features**:

- ✅ Sliding window algorithm
- ✅ Multiple limiter instances
- ✅ Auto-cleanup of expired entries
- ✅ Zero external dependencies
- ✅ Configurable limits per window

### 9. FREE Tier Error Tracking Pattern (Sentry Replacement)

**Location**: `src/lib/firebase-error-logger.ts`

**Usage in Components**:

```typescript
import {
  logError,
  logPerformance,
  logUserAction,
} from "@/lib/firebase-error-logger";

// Log errors (automatically sends to Firebase Analytics + Discord for critical)
try {
  await riskyOperation();
} catch (error) {
  logError(
    error,
    {
      userId: currentUser?.uid,
      url: window.location.href,
      component: "ProductPage",
      action: "addToCart",
    },
    "high"
  ); // 'low' | 'medium' | 'high' | 'critical'
}

// Log performance metrics
const start = performance.now();
await fetchProducts();
const duration = performance.now() - start;
logPerformance("fetch-products", duration, { category: "electronics" });

// Log user actions
logUserAction("product-view", { productId, category });
```

**Automatic Error Handling**:

Error handlers are initialized automatically in root layout via `ErrorInitializer` component.

**Features**:

- ✅ Firebase Analytics integration (FREE tier)
- ✅ Discord notifications for critical errors
- ✅ Global error and unhandled rejection handlers
- ✅ Performance tracking
- ✅ User action logging
- ✅ Severity levels (low, medium, high, critical)

**Discord Setup**:

1. Create Discord server
2. Create notification channel
3. Channel Settings → Integrations → Webhooks
4. Copy webhook URL to `.env` as `DISCORD_WEBHOOK_URL`

### 10. FREE Tier Team Notifications (Slack Replacement)

**Location**: `src/lib/discord-notifier.ts`

**Usage**:

```typescript
import {
  notifyError,
  notifyOrder,
  notifyUser,
  notifySystem,
} from "@/lib/discord-notifier";

// Error notifications
await notifyError(new Error("Payment failed"), { userId, orderId, amount });

// Order notifications
await notifyOrder("new", {
  orderId: "ORD123",
  amount: 1999,
  customer: "John Doe",
});

// User events
await notifyUser("registration", {
  userId: "user123",
  email: "user@example.com",
  name: "John Doe",
});

// System alerts
await notifySystem("deployment", {
  version: "1.2.0",
  environment: "production",
});
```

**Notification Types**:

- **Errors**: Formatted with stack trace and context
- **Orders**: New, completed, cancelled with order details
- **Users**: Registrations, escalations
- **System**: Health checks, deployments, low inventory

**Features**:

- ✅ Rich Discord embeds with colors
- ✅ Severity indicators
- ✅ Automatic retry on failure
- ✅ Zero cost (webhook-based)
- ✅ Team collaboration in Discord

## Cost Optimization & FREE Tier Architecture

### Overview

The platform has been optimized for small-scale businesses with **ZERO monthly costs** by eliminating all paid third-party services and using Firebase FREE tier + custom in-memory solutions.

### Cost Savings

| Service        | Before              | After                        | Savings        |
| -------------- | ------------------- | ---------------------------- | -------------- |
| Error Tracking | Sentry ($26/mo)     | Firebase Analytics + Discord | **$26/mo**     |
| Caching        | Redis ($10/mo)      | In-memory cache              | **$10/mo**     |
| Real-time      | Socket.IO (hosting) | Firebase Realtime Database   | **Variable**   |
| Notifications  | Slack ($0)          | Discord webhooks             | **$0**         |
| **TOTAL**      | **$36+/mo**         | **$0/mo**                    | **$432+/year** |

### Migration Strategy

**Phase 1**: Remove paid dependencies

- Uninstalled Sentry, Redis, Socket.IO packages
- Removed config files and middleware references

**Phase 2**: Implement FREE alternatives

- Created `memory-cache.ts` for caching
- Created `rate-limiter.ts` for API protection
- Created `discord-notifier.ts` for team alerts
- Created `firebase-error-logger.ts` for error tracking
- Created `firebase-realtime.ts` for real-time features

**Phase 3**: Update architecture

- Updated middleware to use FREE libraries
- Migrated auction system to Firebase Realtime Database
- Added error tracking to root layout
- Configured Vercel deployment

**Phase 4**: Testing & validation

- See `FIREBASE-MIGRATION-CHECKLIST.md` for complete steps

### When to Scale Up

Stay on FREE tier until reaching these thresholds:

1. **>1000 daily active users** → Consider Redis Cloud
2. **>$10K monthly revenue** → Add Sentry for advanced monitoring
3. **>100 concurrent auction bidders** → Upgrade Firebase plan
4. **>10GB Firebase Storage** → Optimize or upgrade

### Documentation

- **Migration Guide**: `FIREBASE-MIGRATION-CHECKLIST.md` (comprehensive checklist)
- **Cost Analysis**: `COST-OPTIMIZATION-GUIDE.md` (detailed comparison)
- **Setup Instructions**: See Firebase Console setup in migration checklist

---

## 🔧 Troubleshooting

### Common Issues & Solutions

**Issue 1: "Cannot find module" error**

**Cause**: Import path incorrect or file doesn't exist

**Solution**:
```typescript
// Check import path uses @ alias
import { productsService } from '@/services/products.service';

// Not relative paths from deeply nested files
import { productsService } from '../../../services/products.service';
```

**Issue 2: "Property does not exist on type" error**

**Cause**: Using wrong type or type not updated

**Solution**:
1. Check type definition in `src/types/`
2. Ensure service returns correct type
3. Use proper TypeScript utility types

**Issue 3: "Hydration mismatch" error**

**Cause**: Server-rendered HTML doesn't match client

**Solution**:
- Don't use browser-only APIs (localStorage, window) in Server Components
- Use `useEffect` for browser-only code in Client Components
- Ensure data fetching is consistent

**Issue 4: API route returns 404**

**Cause**: Route file not in correct location

**Solution**:
- API routes must be in `src/app/api/`
- File must be named `route.ts`
- Example: `src/app/api/products/route.ts` → `/api/products`

**Issue 5: Firebase permission denied**

**Cause**: Firestore security rules blocking request

**Solution**:
1. Check user is authenticated
2. Verify security rules in Firebase Console
3. Ensure correct permissions for role

**Issue 6: File upload fails**

**Cause**: Not using mediaService or incorrect context

**Solution**:
```typescript
// ✅ CORRECT
const result = await mediaService.upload({
  file,
  context: 'product' // Use correct context
});

// ❌ WRONG
const storage = getStorage();
await uploadBytes(ref(storage, path), file); // Don't use Firebase SDK directly
```

### Getting Help

1. **Check documentation** in `/NDocs`
2. **Read [Common Issues](../guides/COMMON-ISSUES.md)**
3. **Search existing code** for similar implementations
4. **Check Firebase Console** for backend errors
5. **Review browser console** for frontend errors

---

## 🎯 Tool Usage Guidelines

### When to Use Each Tool

**`semantic_search`** - Find code by concept or functionality
```
Good query: "product creation form with image upload"
Use when: Looking for implementation examples
```

**`grep_search`** - Find exact strings or patterns
```
Good query: "mediaService.upload"
Use when: Finding all usages of specific function/variable
```

**`file_search`** - Find files by name pattern
```
Good query: "**/products/**/*.tsx"
Use when: Locating specific files
```

**`read_file`** - Read file contents
```
Use when: Need to understand existing code before editing
Always read before editing!
```

**`insert_edit_into_file`** - Make changes to existing files
```
Use when: Adding or modifying code
Prefer this over replace_string_in_file for new code
```

**`replace_string_in_file`** - Replace exact strings
```
Use when: Updating specific text (like variable names)
Include 3-5 lines of context before and after
```

### Tool Usage Best Practices

**Before Editing Any File**:
1. Use `semantic_search` to understand the feature
2. Use `read_file` to see current implementation
3. Use `grep_search` to find related code
4. Then make your edits

**Example Workflow**:
```
Task: "Add featured filter to product page"

Step 1: Search for similar implementations
→ semantic_search("product filtering featured flag")

Step 2: Read the product page
→ read_file("src/app/products/page.tsx")

Step 3: Find related filter code
→ grep_search("status filter", isRegexp=false, includePattern="**/products/**")

Step 4: Read filter component
→ read_file("src/components/filters/ProductFilters.tsx")

Step 5: Make edits
→ insert_edit_into_file() or replace_string_in_file()

Step 6: Verify
→ Run type-check and build
```

---

## 📚 Key Files to Know

### Constants (Check These First!)

**`src/constants/api-routes.ts`**
- All API endpoint definitions
- Use these constants instead of hardcoding URLs

**`src/constants/database.ts`**
- Firestore collection names
- Always use these constants

**`src/constants/inline-fields.ts`**
- Form field configurations
- For inline editing features

**`src/constants/bulk-actions.ts`**
- Bulk operation definitions
- Admin/seller bulk actions

### Services (Never Skip!)

**`src/services/api.service.ts`**
- Base HTTP client
- DON'T use directly; use specific services

**`src/services/products.service.ts`**
- Product CRUD operations

**`src/services/auctions.service.ts`**
- Auction operations & bidding

**`src/services/cart.service.ts`**
- Shopping cart management

**`src/services/orders.service.ts`**
- Order processing

**25+ other services** - Check `src/services/index.ts`

### Custom Libraries (FREE Tier)

**`src/lib/memory-cache.ts`**
- In-memory caching (Redis replacement)
- Use for temporary data storage

**`src/lib/rate-limiter.ts`**
- API rate limiting
- Prevents abuse

**`src/lib/firebase-realtime.ts`**
- Real-time auction bidding
- WebSocket replacement

**`src/lib/firebase-error-logger.ts`**
- Error tracking (Sentry replacement)
- Logs to Firebase Analytics

**`src/lib/discord-notifier.ts`**
- Team notifications
- Sends alerts to Discord

**`src/lib/date-utils.ts`**
- Safe date handling
- Always use `safeToISOString()`

### Types

**`src/types/`**
- All TypeScript type definitions
- Check here before creating new types

---

## 🎓 Learning Path for AI Agents

### First Time Working on This Project?

**Phase 1: Foundation (30 minutes)**
1. Read this AI Agent Guide completely
2. Skim [Architecture Overview](../architecture/ARCHITECTURE-OVERVIEW.md)
3. Review [Service Layer Guide](../architecture/SERVICE-LAYER-GUIDE.md)
4. Check project structure in IDE

**Phase 2: Patterns (30 minutes)**
1. Read [Component Patterns](../architecture/COMPONENT-PATTERNS.md)
2. Study [Development Guide](../development/DEVELOPMENT-GUIDE.md)
3. Review existing services in `src/services/`
4. Look at existing components in `src/components/`

**Phase 3: Hands-On (Start Coding!)**
1. Pick a simple task
2. Search for similar implementations
3. Read related code
4. Follow established patterns
5. Test your changes

### Quick Reference Checklist

Before starting any task, verify:
- [ ] I understand the service layer pattern
- [ ] I know to use Server Components by default
- [ ] I will never call APIs directly from components
- [ ] I will use TypeScript strict mode
- [ ] I will test my changes after implementation
- [ ] I will read existing code before editing
- [ ] I will use real APIs (no mocks)
- [ ] I will follow existing patterns

---

## 💡 Pro Tips

### Code Quality

1. **Keep it simple** - Don't over-engineer solutions
2. **Be consistent** - Follow existing code style
3. **Name things well** - Use descriptive variable/function names
4. **Comment complex logic** - But code should be self-documenting
5. **Handle edge cases** - Think about error scenarios

### Performance

1. **Use Server Components** when possible (smaller bundle)
2. **Lazy load heavy components** with dynamic imports
3. **Optimize images** with Next.js Image component
4. **Cache API responses** when appropriate
5. **Use pagination** for large datasets

### Best Practices

1. **DRY** (Don't Repeat Yourself) - Extract reusable code
2. **Single Responsibility** - Each function/component does one thing
3. **Error Handling** - Always handle async errors
4. **Type Safety** - Use TypeScript properly
5. **Test Edge Cases** - Don't just test happy path

---

## 🚀 Available Services

### Core Services

| Service | Import Path | Purpose |
|---------|-------------|---------|
| `productsService` | `@/services/products.service` | Product CRUD |
| `auctionsService` | `@/services/auctions.service` | Auction management |
| `cartService` | `@/services/cart.service` | Shopping cart |
| `ordersService` | `@/services/orders.service` | Order processing |
| `shopsService` | `@/services/shops.service` | Shop management |
| `categoriesService` | `@/services/categories.service` | Categories |
| `usersService` | `@/services/users.service` | User profiles |
| `authService` | `@/services/auth.service` | Authentication |
| `reviewsService` | `@/services/reviews.service` | Product reviews |
| `addressesService` | `@/services/addresses.service` | User addresses |
| `couponsService` | `@/services/coupons.service` | Discount coupons |
| `supportService` | `@/services/support.service` | Support tickets |
| `notificationsService` | `@/services/notifications.service` | Notifications |
| `mediaService` | `@/services/media.service` | File uploads |
| `favoritesService` | `@/services/favorites.service` | Wishlist |

**Usage Example**:
```typescript
import { productsService } from '@/services/products.service';

const products = await productsService.getProducts({
  status: 'published',
  categoryId: 'electronics',
  page: 1,
  limit: 20
});
```

---

## 📞 Getting Help

**Documentation**:
- 📖 [Complete Docs](../README.md) - Master index
- 🏗️ [Architecture](../architecture/ARCHITECTURE-OVERVIEW.md) - System design
- 💻 [Development](../development/DEVELOPMENT-GUIDE.md) - Coding guide
- 🚀 [Deployment](../deployment/DEPLOYMENT-GUIDE.md) - Production setup
- 🔧 [Common Issues](../guides/COMMON-ISSUES.md) - Troubleshooting

**Code Examples**:
- Services: `src/services/`
- Components: `src/components/`
- API Routes: `src/app/api/`
- Types: `src/types/`

**Test Workflows**:
- Location: `src/lib/test-workflows/`
- Run all: `npm run test:workflows:all`
- 11 comprehensive E2E workflows with 140+ steps

---

## ✅ Final Checklist

Before completing any task:

- [ ] Code follows service layer pattern
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Feature tested manually
- [ ] Error scenarios handled
- [ ] Existing patterns followed
- [ ] No console errors
- [ ] Responsive design works
- [ ] No hardcoded values (use constants)
- [ ] Server/Client components used appropriately

---

## 🎯 Quick Decision Tree

**"Should I use Server or Client Component?"**
- Need interactivity? → Client
- Just displaying data? → Server

**"How do I fetch data?"**
- Always use service layer
- Never direct API calls

**"Where do I put this code?"**
- Page? → `src/app/(routes)/`
- API? → `src/app/api/`
- Component? → `src/components/`
- Utility? → `src/lib/`
- Service? → `src/services/`

**"How do I upload files?"**
- Always use `mediaService.upload()`
- Never use Firebase SDK directly

**"I'm stuck, what do I do?"**
1. Read this guide
2. Search existing code
3. Check [Common Issues](../guides/COMMON-ISSUES.md)
4. Read relevant documentation

---

**You're ready to start coding! Remember: Read first, code second, test always.** 🚀

---

**Last Updated**: November 18, 2025  
**Maintained By**: Development Team  
**For**: AI Agents working on JustForView.in
