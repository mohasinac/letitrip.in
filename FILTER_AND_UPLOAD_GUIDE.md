# Filter Sidebar & Upload Management Implementation Guide

## Overview

This guide covers three major UX improvements:
1. **FilterSidebar** - Advanced filtering for all list views
2. **Constants-based approach** - Centralized database and storage naming
3. **Upload Context & Recovery** - Handle failed uploads gracefully

---

## 1. FilterSidebar Component

### Design Requirements

**Desktop (≥ 1024px):**
- Always visible on the left side
- Fixed width: 280px
- Sticky positioning
- Scrollable content

**Tablet (768px - 1023px):**
- Collapsible with toggle button
- Slide-in/out animation
- Overlay on content when open

**Mobile (< 768px):**
- Hidden by default
- Full-screen modal when open
- Bottom sheet animation

### Component Structure

```tsx
// /src/components/common/FilterSidebar.tsx

import { ReactNode, useState, useEffect } from 'react';
import { X, Filter } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  onReset: () => void;
  children: ReactNode;
  title?: string;
  appliedCount?: number;
}

export function FilterSidebar({
  isOpen,
  onClose,
  onApply,
  onReset,
  children,
  title = 'Filters',
  appliedCount = 0,
}: FilterSidebarProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Desktop: Always show
  // Tablet/Mobile: Show based on isOpen state
  const shouldShow = isDesktop || isOpen;

  return (
    <>
      {/* Backdrop for mobile/tablet */}
      {!isDesktop && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 lg:top-20
          h-screen lg:h-[calc(100vh-5rem)]
          w-full sm:w-96 lg:w-80
          bg-white border-r border-gray-200
          z-50 lg:z-10
          transition-transform duration-300
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
          ${!isDesktop && !isOpen ? '-translate-x-full' : 'translate-x-0'}
          lg:translate-x-0
          overflow-y-auto
        `}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold">{title}</h2>
            {appliedCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                {appliedCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-4 space-y-6">
          {children}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-2">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={onApply}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  );
}
```

### Filter Components Library

```tsx
// /src/components/common/FilterGroup.tsx
export function FilterGroup({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      {children}
    </div>
  );
}

// /src/components/common/FilterCheckbox.tsx
export function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

// /src/components/common/FilterRange.tsx
export function FilterRange({ label, min, max, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-700">{label}</label>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Min"
          value={value[0]}
          onChange={(e) => onChange([e.target.value, value[1]])}
          className="flex-1 px-3 py-2 border rounded-lg"
        />
        <span className="text-gray-400">-</span>
        <input
          type="number"
          placeholder="Max"
          value={value[1]}
          onChange={(e) => onChange([value[0], e.target.value])}
          className="flex-1 px-3 py-2 border rounded-lg"
        />
      </div>
    </div>
  );
}

// /src/components/common/FilterDateRange.tsx
export function FilterDateRange({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-700">{label}</label>
      <div className="space-y-2">
        <input
          type="date"
          value={value[0]}
          onChange={(e) => onChange([e.target.value, value[1]])}
          className="w-full px-3 py-2 border rounded-lg"
        />
        <input
          type="date"
          value={value[1]}
          onChange={(e) => onChange([value[0], e.target.value])}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
    </div>
  );
}
```

### Product Filters Example

```tsx
// /src/components/filters/ProductFilters.tsx

import { FilterSidebar } from '@/components/common/FilterSidebar';
import { FilterGroup, FilterCheckbox, FilterRange } from '@/components/common';
import { useFilters } from '@/hooks/useFilters';

export function ProductFilters({ isOpen, onClose }) {
  const { filters, setFilter, applyFilters, resetFilters, appliedCount } = useFilters({
    initialFilters: {
      categories: [],
      priceRange: [0, 10000],
      inStock: null,
      condition: [],
      rating: null,
    },
  });

  return (
    <FilterSidebar
      isOpen={isOpen}
      onClose={onClose}
      onApply={applyFilters}
      onReset={resetFilters}
      title="Product Filters"
      appliedCount={appliedCount}
    >
      <FilterGroup title="Availability">
        <FilterCheckbox
          label="In Stock Only"
          checked={filters.inStock}
          onChange={(e) => setFilter('inStock', e.target.checked)}
        />
      </FilterGroup>

      <FilterGroup title="Price Range">
        <FilterRange
          label="Price (₹)"
          min={0}
          max={100000}
          value={filters.priceRange}
          onChange={(value) => setFilter('priceRange', value)}
        />
      </FilterGroup>

      <FilterGroup title="Condition">
        {['New', 'Used', 'Refurbished'].map((condition) => (
          <FilterCheckbox
            key={condition}
            label={condition}
            checked={filters.condition.includes(condition)}
            onChange={(e) => {
              const updated = e.target.checked
                ? [...filters.condition, condition]
                : filters.condition.filter((c) => c !== condition);
              setFilter('condition', updated);
            }}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Rating">
        {[4, 3, 2, 1].map((rating) => (
          <FilterCheckbox
            key={rating}
            label={`${rating}★ & Up`}
            checked={filters.rating === rating}
            onChange={() => setFilter('rating', rating)}
          />
        ))}
      </FilterGroup>
    </FilterSidebar>
  );
}
```

### useFilters Hook

```tsx
// /src/hooks/useFilters.ts

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function useFilters({ initialFilters, onFilterChange }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(initialFilters);

  // Load filters from URL on mount
  useEffect(() => {
    const urlFilters = {};
    searchParams.forEach((value, key) => {
      try {
        urlFilters[key] = JSON.parse(value);
      } catch {
        urlFilters[key] = value;
      }
    });
    setFilters({ ...initialFilters, ...urlFilters });
  }, []);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, JSON.stringify(value));
      }
    });
    router.push(`?${params.toString()}`);
    
    // Callback for parent component
    onFilterChange?.(filters);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    router.push(window.location.pathname);
    onFilterChange?.(initialFilters);
  };

  const appliedCount = useMemo(() => {
    return Object.values(filters).filter((value) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    }).length;
  }, [filters]);

  return {
    filters,
    setFilter,
    applyFilters,
    resetFilters,
    appliedCount,
  };
}
```

---

## 2. Constants-Based Approach

### Database Constants

```typescript
// /src/constants/database.ts

/**
 * Firestore collection names
 * Use these constants everywhere instead of string literals
 */
export const COLLECTIONS = {
  // Core resources
  SHOPS: 'shops',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  
  // Orders & transactions
  ORDERS: 'orders',
  ORDER_ITEMS: 'orderItems',
  RETURNS: 'returns',
  REFUNDS: 'refunds',
  
  // Marketing
  COUPONS: 'coupons',
  REVIEWS: 'reviews',
  
  // Users & auth
  USERS: 'users',
  SESSIONS: 'sessions',
  
  // Financial
  PAYOUTS: 'payouts',
  TRANSACTIONS: 'transactions',
  
  // Shipping
  SHIPMENTS: 'shipments',
  CARRIERS: 'carriers',
  
  // Media
  MEDIA: 'media',
  MEDIA_METADATA: 'mediaMetadata',
  
  // System
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'auditLogs',
  SYSTEM_SETTINGS: 'systemSettings',
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

/**
 * Subcollections for nested data
 */
export const SUBCOLLECTIONS = {
  SHOP_ANALYTICS: 'analytics',
  SHOP_SETTINGS: 'settings',
  USER_ADDRESSES: 'addresses',
  USER_WISHLIST: 'wishlist',
  USER_CART: 'cart',
  PRODUCT_VARIANTS: 'variants',
  PRODUCT_REVIEWS: 'reviews',
} as const;
```

### Storage Constants

```typescript
// /src/constants/storage.ts

/**
 * Cloud Storage bucket paths
 * Use these constants for all file uploads
 */
export const STORAGE_BUCKETS = {
  // Shop related
  SHOP_LOGOS: 'shops/logos',
  SHOP_BANNERS: 'shops/banners',
  SHOP_DOCUMENTS: 'shops/documents',
  
  // Product related
  PRODUCT_IMAGES: 'products/images',
  PRODUCT_VIDEOS: 'products/videos',
  PRODUCT_THUMBNAILS: 'products/thumbnails',
  PRODUCT_DOCUMENTS: 'products/documents',
  
  // Category related
  CATEGORY_IMAGES: 'categories/images',
  CATEGORY_ICONS: 'categories/icons',
  
  // User related
  USER_AVATARS: 'users/avatars',
  USER_DOCUMENTS: 'users/documents',
  
  // Returns & refunds
  RETURN_MEDIA: 'returns/media',
  RETURN_VIDEOS: 'returns/videos',
  
  // Reviews
  REVIEW_IMAGES: 'reviews/images',
  REVIEW_VIDEOS: 'reviews/videos',
  
  // Orders
  ORDER_INVOICES: 'orders/invoices',
  ORDER_RECEIPTS: 'orders/receipts',
  SHIPPING_LABELS: 'orders/shipping-labels',
  
  // System
  TEMP_UPLOADS: 'temp',
  ARCHIVED: 'archived',
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

/**
 * File naming conventions
 */
export function getStoragePath(
  bucket: StorageBucket,
  resourceId: string,
  filename: string
): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${bucket}/${resourceId}/${timestamp}-${sanitizedFilename}`;
}

/**
 * Get URL from storage path
 */
export function getStorageUrl(path: string): string {
  const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET;
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media`;
}
```

### Media Constants

```typescript
// /src/constants/media.ts

export const MEDIA_LIMITS = {
  // Image limits
  IMAGE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  IMAGE_MIN_WIDTH: 200,
  IMAGE_MIN_HEIGHT: 200,
  IMAGE_MAX_WIDTH: 4000,
  IMAGE_MAX_HEIGHT: 4000,
  
  // Video limits
  VIDEO_MAX_SIZE: 100 * 1024 * 1024, // 100MB
  VIDEO_MAX_DURATION: 60, // seconds
  VIDEO_MIN_DURATION: 1,
  
  // Product specific
  PRODUCT_MAX_IMAGES: 10,
  PRODUCT_MAX_VIDEOS: 3,
  
  // Review specific
  REVIEW_MAX_IMAGES: 5,
  REVIEW_MAX_VIDEOS: 2,
  
  // Return specific
  RETURN_MAX_IMAGES: 10,
  RETURN_MAX_VIDEOS: 3,
} as const;

export const ALLOWED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const ALLOWED_VIDEO_FORMATS = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
] as const;

export const IMAGE_QUALITY = {
  THUMBNAIL: 0.7,
  PREVIEW: 0.85,
  FULL: 0.95,
} as const;
```

### Usage Example

```typescript
// /src/lib/db/products.ts

import { COLLECTIONS } from '@/constants/database';
import { STORAGE_BUCKETS, getStoragePath } from '@/constants/storage';
import { db, storage } from '@/lib/firebase';

export async function createProduct(data: ProductData) {
  // 1. Create product document (images as null initially)
  const productRef = await db.collection(COLLECTIONS.PRODUCTS).add({
    ...data,
    mainImage: null,
    images: [],
    createdAt: new Date(),
  });

  // 2. Upload images to storage
  const uploadedImages = [];
  for (const imageFile of data.imageFiles) {
    const path = getStoragePath(
      STORAGE_BUCKETS.PRODUCT_IMAGES,
      productRef.id,
      imageFile.name
    );
    
    try {
      await storage.ref(path).put(imageFile);
      const url = await storage.ref(path).getDownloadURL();
      uploadedImages.push(url);
    } catch (error) {
      console.error('Image upload failed:', error);
      // Continue with other images
    }
  }

  // 3. Update product with image URLs
  if (uploadedImages.length > 0) {
    await productRef.update({
      mainImage: uploadedImages[0],
      images: uploadedImages,
    });
  }

  return { id: productRef.id, imagesUploaded: uploadedImages.length };
}
```

---

## 3. Upload Context & Recovery

### UploadContext

```tsx
// /src/contexts/UploadContext.tsx

import { createContext, useContext, useState, ReactNode } from 'react';

interface UploadTask {
  id: string;
  resourceType: 'product' | 'shop' | 'category' | 'return' | 'review';
  resourceId: string;
  file: File;
  fieldName: string; // e.g., 'mainImage', 'images[0]'
  status: 'pending' | 'uploading' | 'success' | 'failed';
  progress: number;
  error?: string;
  url?: string;
}

interface UploadContextValue {
  tasks: UploadTask[];
  addTask: (task: Omit<UploadTask, 'id' | 'status' | 'progress'>) => void;
  updateTask: (id: string, updates: Partial<UploadTask>) => void;
  removeTask: (id: string) => void;
  retryTask: (id: string) => Promise<void>;
  hasPendingUploads: boolean;
  getPendingTasksForResource: (resourceId: string) => UploadTask[];
}

const UploadContext = createContext<UploadContextValue | null>(null);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<UploadTask[]>([]);

  const addTask = (task: Omit<UploadTask, 'id' | 'status' | 'progress'>) => {
    const newTask: UploadTask = {
      ...task,
      id: `upload-${Date.now()}-${Math.random()}`,
      status: 'pending',
      progress: 0,
    };
    setTasks((prev) => [...prev, newTask]);
    
    // Auto-start upload
    uploadFile(newTask);
  };

  const updateTask = (id: string, updates: Partial<UploadTask>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const retryTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    updateTask(id, { status: 'pending', progress: 0, error: undefined });
    await uploadFile(task);
  };

  const uploadFile = async (task: UploadTask) => {
    try {
      updateTask(task.id, { status: 'uploading' });

      // Get storage path
      const bucketMap = {
        product: STORAGE_BUCKETS.PRODUCT_IMAGES,
        shop: STORAGE_BUCKETS.SHOP_LOGOS,
        category: STORAGE_BUCKETS.CATEGORY_IMAGES,
        return: STORAGE_BUCKETS.RETURN_MEDIA,
        review: STORAGE_BUCKETS.REVIEW_IMAGES,
      };

      const bucket = bucketMap[task.resourceType];
      const path = getStoragePath(bucket, task.resourceId, task.file.name);

      // Upload to storage
      const uploadTask = storage.ref(path).put(task.file);

      // Track progress
      uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        updateTask(task.id, { progress });
      });

      await uploadTask;

      // Get download URL
      const url = await storage.ref(path).getDownloadURL();

      // Update database
      await updateResourceMedia(task.resourceType, task.resourceId, task.fieldName, url);

      updateTask(task.id, { status: 'success', progress: 100, url });
    } catch (error) {
      updateTask(task.id, {
        status: 'failed',
        error: error.message,
      });
    }
  };

  const hasPendingUploads = tasks.some(
    (task) => task.status === 'pending' || task.status === 'uploading'
  );

  const getPendingTasksForResource = (resourceId: string) => {
    return tasks.filter(
      (task) =>
        task.resourceId === resourceId &&
        (task.status === 'pending' || task.status === 'uploading' || task.status === 'failed')
    );
  };

  return (
    <UploadContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        removeTask,
        retryTask,
        hasPendingUploads,
        getPendingTasksForResource,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUpload must be used within UploadProvider');
  }
  return context;
}
```

### Upload Progress Component

```tsx
// /src/components/common/UploadProgress.tsx

import { useUpload } from '@/contexts/UploadContext';
import { X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export function UploadProgress() {
  const { tasks, removeTask, retryTask } = useUpload();

  if (tasks.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold">Uploads ({tasks.length})</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {tasks.map((task) => (
          <div key={task.id} className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {task.status === 'uploading' && (
                <Loader className="w-5 h-5 text-blue-500 animate-spin" />
              )}
              {task.status === 'success' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {task.status === 'failed' && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.file.name}</p>
                {task.status === 'uploading' && (
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}
                {task.status === 'failed' && (
                  <p className="text-xs text-red-600 mt-1">{task.error}</p>
                )}
              </div>

              {task.status === 'failed' && (
                <button
                  onClick={() => retryTask(task.id)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Retry
                </button>
              )}
              {task.status === 'success' && (
                <button
                  onClick={() => removeTask(task.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Pending Uploads Warning

```tsx
// /src/components/common/PendingUploadsWarning.tsx

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUpload } from '@/contexts/UploadContext';

export function PendingUploadsWarning() {
  const router = useRouter();
  const { hasPendingUploads } = useUpload();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPendingUploads) {
        e.preventDefault();
        e.returnValue = 'You have pending uploads. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasPendingUploads]);

  return null;
}
```

### Product Creation Flow with Upload Recovery

```tsx
// /src/app/seller/my-shops/[shopId]/products/create/page.tsx

export default function CreateProductPage() {
  const router = useRouter();
  const { addTask } = useUpload();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (data: ProductFormData) => {
    setIsSaving(true);

    try {
      // 1. Create product in database (without image URLs)
      const response = await fetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          mainImage: null,
          images: [],
        }),
      });

      const { product } = await response.json();

      // 2. Queue image uploads
      if (data.imageFiles?.length > 0) {
        data.imageFiles.forEach((file, index) => {
          addTask({
            resourceType: 'product',
            resourceId: product.id,
            file,
            fieldName: index === 0 ? 'mainImage' : `images[${index}]`,
          });
        });
      }

      // 3. Redirect to edit page (not back to list)
      router.push(`/seller/my-shops/${product.shopId}/products/${product.id}/edit?created=true`);
    } catch (error) {
      console.error('Product creation failed:', error);
      alert('Failed to create product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
}
```

### Edit Page with Upload Recovery

```tsx
// /src/app/seller/my-shops/[shopId]/products/[id]/edit/page.tsx

export default function EditProductPage({ params, searchParams }) {
  const { getPendingTasksForResource, retryTask } = useUpload();
  const pendingTasks = getPendingTasksForResource(params.id);
  const isNewlyCreated = searchParams.created === 'true';

  return (
    <div>
      {/* Show banner if just created with pending uploads */}
      {isNewlyCreated && pendingTasks.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="font-medium">Product created successfully!</p>
          <p className="text-sm text-gray-600 mt-1">
            {pendingTasks.length} image(s) are still uploading. You can continue editing.
          </p>
        </div>
      )}

      {/* Show failed uploads */}
      {pendingTasks.filter((t) => t.status === 'failed').length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-medium text-red-800">Some uploads failed</p>
          <div className="mt-2 space-y-2">
            {pendingTasks
              .filter((t) => t.status === 'failed')
              .map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{task.file.name}</span>
                  <button
                    onClick={() => retryTask(task.id)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Retry
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      <ProductForm product={product} />
    </div>
  );
}
```

---

## Implementation Checklist

### FilterSidebar
- [ ] Create FilterSidebar base component
- [ ] Create filter building blocks (FilterGroup, FilterCheckbox, FilterRange, FilterDateRange)
- [ ] Create resource-specific filter components (ProductFilters, ShopFilters, etc.)
- [ ] Implement useFilters hook with URL sync
- [ ] Add mobile responsive behavior
- [ ] Test on all screen sizes

### Constants
- [ ] Create database constants file
- [ ] Create storage constants file
- [ ] Create media constants file
- [ ] Update all existing code to use constants
- [ ] Add type safety for collection/bucket names
- [ ] Document naming conventions

### Upload Context
- [ ] Create UploadContext with provider
- [ ] Implement upload queue management
- [ ] Create UploadProgress component
- [ ] Create PendingUploadsWarning component
- [ ] Update create flows to redirect to edit page
- [ ] Add upload retry logic
- [ ] Handle failed upload scenarios
- [ ] Test with slow/unstable connections

---

Last Updated: November 7, 2025
