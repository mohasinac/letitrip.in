# AI Agent Development Guide - JustForView.in

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
- **Firebase**: Firestore (DB), Storage (files), Auth
- **Socket.IO**: Real-time auction bidding
- **Sentry**: Error tracking and monitoring

## Key Patterns to Follow

### 1. Component Patterns

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

### 2. Service Layer Pattern

```typescript
// ALWAYS use existing services - found in src/services/
import { productService } from "@/services/products.service";

// Services handle:
// - API calls
// - Error handling
// - Type safety
// - Authentication headers

// Example usage:
const products = await productService.getProducts(filters);
```

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

### 4. State Management

```typescript
// Use Context for global state
import { useAuth } from "@/contexts/AuthContext";

// Use custom hooks for feature state
import { useCart } from "@/hooks/useCart";
import { useAuctionSocket } from "@/hooks/useAuctionSocket";
```

## Common Tasks Guide

### Adding a New Feature

1. **Check existing patterns**: Search for similar features first
2. **Use semantic_search**: Find related code before implementing
3. **Follow structure**: Place files in appropriate directories
4. **Use services**: Never make direct API calls in components
5. **Add types**: Define TypeScript interfaces in src/types/

### Editing Components

1. **Read first**: Always read the full file before editing
2. **Match style**: Follow existing code patterns
3. **Use tools**: Use replace_string_in_file or insert_edit_into_file
4. **Group changes**: All changes to one file in one action
5. **Check errors**: Fix any new errors immediately

### Working with API Routes

**CRITICAL**: Always use centralized route constants from `@/constants/api-routes`. Never hardcode API paths.

#### Import Route Constants

```typescript
// Import specific route groups you need
import {
  PRODUCT_ROUTES,
  AUCTION_ROUTES,
  ADMIN_ROUTES,
} from "@/constants/api-routes";

// Import helper for query parameters
import { buildUrl } from "@/constants/api-routes";
```

#### Use Route Constants in Services

```typescript
// ✅ CORRECT: Use constants
class ProductService {
  async getProduct(slug: string) {
    return apiService.get(PRODUCT_ROUTES.BY_SLUG(slug));
  }

  async listProducts(filters: ProductFilters) {
    return apiService.get(buildUrl(PRODUCT_ROUTES.LIST, filters));
  }
}

// ❌ WRONG: Hardcoded paths
class ProductService {
  async getProduct(slug: string) {
    return apiService.get(`/api/products/${slug}`); // NO!
  }
}
```

#### Available Route Groups

- **AUTH_ROUTES**: `/api/auth/*` - Login, register, logout
- **PRODUCT_ROUTES**: `/api/products/*` - Product CRUD, reviews, related
- **AUCTION_ROUTES**: `/api/auctions/*` - Auction operations, bidding
- **CATEGORY_ROUTES**: `/api/categories/*` - Category management
- **SHOP_ROUTES**: `/api/shops/*` - Shop operations, seller products
- **CART_ROUTES**: `/api/cart/*` - Cart operations
- **ORDER_ROUTES**: `/api/orders/*` - Order management, checkout
- **ADMIN_ROUTES**: `/api/admin/*` - Admin operations, homepage settings
- **SELLER_ROUTES**: `/api/seller/*` - Seller dashboard operations

#### Dynamic Routes Pattern

```typescript
// Routes with parameters use functions
PRODUCT_ROUTES.BY_ID(productId); // /api/products/123
PRODUCT_ROUTES.BY_SLUG(slug); // /api/products/slug/my-product
AUCTION_ROUTES.PLACE_BID(auctionId); // /api/auctions/123/bid

// Query parameters use buildUrl helper
buildUrl(PRODUCT_ROUTES.LIST, {
  category: "electronics",
  sort: "price-asc",
  page: 1,
}); // /api/products?category=electronics&sort=price-asc&page=1
```

#### When Creating New API Routes

1. **Add to constants first**: Update `src/constants/api-routes.ts`
2. **Group logically**: Add to appropriate route group (AUTH, PRODUCT, etc.)
3. **Use functions for IDs**: Dynamic routes need function format
4. **Document in code**: Add comments for complex routes
5. **Update services**: Use constants in all service methods

#### Anti-Patterns to Avoid

```typescript
// ❌ String concatenation
const url = "/api/products/" + productId;

// ❌ Template literals without constants
const url = `/api/auctions/${id}/bid`;

// ❌ Manual query string building
const url = `/api/products?category=${cat}&page=${page}`;

// ❌ Relative paths in apiService
apiService.get("admin/homepage"); // Missing /api prefix!
```

#### Benefits of Route Constants

- **Type Safety**: Full TypeScript autocomplete
- **Consistency**: No typos or path mismatches
- **Maintainability**: Change routes in one place
- **Debugging**: Easier to track API calls
- **No /api/api bugs**: Prevents duplicate path prefixes

## Domain-Specific Knowledge

### Auction System

- **Types**: Regular, Reverse, Silent auctions
- **States**: upcoming, active, ended
- **Real-time**: Socket.IO for live updates
- **Auto-bidding**: Users can set maximum bids
- **Scheduling**: Automated start/end times

### E-commerce Features

- **Multi-vendor**: Multiple shops/sellers
- **Categories**: Hierarchical category system (see constants/categories.ts)
- **Cart**: Session-based shopping cart
- **Coupons**: Discount code system
- **Orders**: Complete order lifecycle

### User Roles (RBAC)

- **admin**: Full system access
- **seller**: Can create products/auctions
- **user**: Regular customer
- **guest**: Unauthenticated visitor

### Media Handling

- **Storage**: Firebase Storage
- **Types**: Images and videos
- **Optimization**: Automatic resize/compress
- **Queue**: Upload queue system for multiple files

## Debugging & Testing

### Available Scripts

```bash
# API testing
node scripts/test-api.js

# Auction system testing
node scripts/test-auction-automation.js

# Load testing
node scripts/load-test.js

# Production monitoring
node scripts/monitor-production.js
```

### Error Checking

- Use `get_errors` tool after edits
- Check Sentry for production errors
- Review `logs/` directory for application logs

### Common Issues

1. **Auth errors**: Check Firebase config in .env.local
2. **Socket errors**: Ensure socket-server.ts is running
3. **Upload errors**: Verify Firebase Storage rules
4. **Build errors**: Run `npm run build` to check

## Mobile Optimization Guide

### Mobile Detection Utilities

**Location**: `src/hooks/useMobile.ts`

```typescript
// Detect mobile viewport
import { useIsMobile, useDeviceType, useBreakpoint } from "@/hooks/useMobile";

const isMobile = useIsMobile(768); // Custom breakpoint
const deviceType = useDeviceType(); // 'mobile' | 'tablet' | 'desktop'
const isTabletUp = useBreakpoint("md"); // Tailwind breakpoint

// Platform detection
import { isIOS, isAndroid } from "@/hooks/useMobile";
if (isIOS()) {
  /* iOS-specific code */
}
if (isAndroid()) {
  /* Android-specific code */
}

// Touch device detection
const isTouch = useIsTouchDevice();

// Viewport dimensions
const { width, height } = useViewport();
```

### Mobile Components

**MobileStickyBar** (`src/components/common/MobileStickyBar.tsx`)

- Sticky bottom action bar for product/auction pages
- Auto-hides on desktop (useIsMobile hook)
- Supports both product and auction modes
- Price/bid display with add to cart/place bid buttons

```typescript
<MobileStickyBar
  type="product" // or "auction"
  price={1999}
  originalPrice={2999}
  inStock={true}
  onAddToCart={handleAddToCart}
  onBuyNow={handleBuyNow}
  onAddToWishlist={handleWishlist}
/>
```

**MobileFilterDrawer** (`src/components/common/MobileFilterDrawer.tsx`)

- Bottom sheet with smooth slide-up animation
- Auto body scroll lock when open
- Backdrop overlay
- Sticky header and footer
- Apply/Reset buttons

```typescript
<MobileFilterDrawer
  isOpen={isFilterOpen}
  onClose={() => setIsFilterOpen(false)}
  onApply={handleApply}
  onReset={handleReset}
  title="Filters"
>
  {/* Filter content */}
</MobileFilterDrawer>
```

### Responsive Design Patterns

**Breakpoints** (from Tailwind config):

- `sm`: 640px - Small devices
- `md`: 768px - Tablets
- `lg`: 1024px - Laptops
- `xl`: 1280px - Desktops
- `2xl`: 1536px - Large screens

**Mobile-First Approach**:

```typescript
// Stack vertically on mobile, horizontal on desktop
className = "flex flex-col md:flex-row gap-4";

// Hide on mobile, show on desktop
className = "hidden md:block";

// Show on mobile only
className = "block md:hidden";

// Touch targets (minimum 44px)
className = "min-h-[44px] min-w-[44px]";
```

**Common Mobile Patterns**:

- Horizontal scroll sections with arrows
- Collapsible filter sidebars → bottom drawers
- Sticky action bars at bottom
- Hamburger menus for navigation
- Touch-optimized carousels

### Mobile Testing Checklist

1. **Viewport sizes**: Test 375px (mobile), 768px (tablet), 1024px+ (desktop)
2. **Touch targets**: All buttons minimum 44×44px
3. **Gestures**: Swipe, pinch-to-zoom where applicable
4. **Orientation**: Both portrait and landscape
5. **Performance**: Fast load times on mobile networks
6. **Keyboard**: Mobile keyboard doesn't break layout

## Best Practices for AI Agents

### 1. Context Gathering

- Use `semantic_search` for understanding features
- Use `grep_search` for finding specific patterns
- Use `file_search` for locating files by name
- Read files before editing them

### 2. Making Changes

- **Group by file**: All changes to one file at once
- **Match patterns**: Follow existing code style
- **Use services**: Never bypass the service layer
- **Test immediately**: Run and verify changes
- **Mobile-first**: Consider mobile UX in all components

### 3. Communication

- Be concise, focus on code
- Don't create docs unless asked
- Show results, not plans
- Fix errors immediately

### 4. Tool Usage

- Use edit tools, not code blocks
- Run terminal commands directly
- Call multiple independent tools in parallel
- Don't repeat context

## Firebase Schema Hints

### Collections

- `users`: User profiles and settings
- `products`: Product listings
- `auctions`: Auction items and state
- `orders`: Order records
- `carts`: Shopping cart items
- `shops`: Seller shop information
- `categories`: Product categories
- `bids`: Auction bid history
- `coupons`: Discount codes

### Common Queries

- Active auctions: `status === 'active'`
- User's orders: `userId === currentUser.uid`
- Shop products: `shopId === shopId`

## Quick Command Reference

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build           # Production build

# Testing
npm test                # Run tests
node scripts/test-api.js # Test API endpoints

# Utilities
npm run lint            # Lint code
```

## When to Use Which Tool

- **semantic_search**: Understanding features, finding examples
- **grep_search**: Finding specific code patterns
- **file_search**: Locating files by glob pattern
- **read_file**: Getting file contents before editing
- **replace_string_in_file**: Simple, unique string replacements
- **insert_edit_into_file**: Complex edits with context
- **run_in_terminal**: Execute commands (PowerShell on Windows)

## Accessibility Support

### Available Utilities (`src/hooks/useAccessibility.ts`)

```typescript
// Focus management
const containerRef = useFocusTrap(isActive);

// Keyboard navigation
const { focusedIndex, handleKeyDown } = useKeyboardNavigation(items, onSelect, {
  loop: true,
  initialIndex: 0,
});

// Screen reader announcements
const { message, announce } = useAnnouncer();
announce("Item added to cart", "polite");

// Unique IDs for ARIA
const id = useId("dropdown");

// Motion preferences
const prefersReducedMotion = usePrefersReducedMotion();

// ARIA labels
const ratingLabel = getRatingLabel(4.5, 5); // "Rated 4.5 out of 5 stars"
const priceLabel = getPriceLabel(1999); // "Price: 1,999 INR"
```

### Accessibility Components (`src/components/common/Accessibility.tsx`)

```typescript
// Skip link for keyboard users
<SkipToContent contentId="main-content" />

// Live region for dynamic updates
<LiveRegion message="Loading..." priority="polite" />

// Screen reader announcements
<Announcer message="Item added to cart" />
```

### Best Practices

- All interactive elements have min 44×44px touch targets
- Keyboard navigation supported (Tab, Arrow keys, Enter, Escape)
- ARIA labels on all images and buttons
- Focus visible on all interactive elements
- Screen reader compatible
- Reduced motion support for animations

## Testing Infrastructure

### Automated Tests

**Location**: `scripts/test-pages.js`

Tests all major API endpoints:

- Products (filters, pagination, search)
- Shops (listing, detail, products, reviews)
- Categories (tree, products, subcategories, hierarchy)
- Auctions (filters, status)
- Cart (merge functionality)

```bash
# Run automated API tests
node scripts/test-pages.js
```

### Manual Testing

**Location**: `TESTING-GUIDE.md`

Comprehensive checklists for:

- Functionality testing (all pages)
- Guest cart flow
- Mobile responsiveness
- Accessibility (keyboard, screen readers)
- Performance (load times, API calls)
- Deployment readiness

## Remember

1. **No mocks** - Real APIs are ready
2. **Code first** - Implementation over documentation
3. **Use services** - Never bypass the service layer
4. **Match patterns** - Follow existing code style
5. **Test changes** - Verify immediately
6. **Be concise** - Direct action over explanation
7. **Mobile-first** - Always consider responsive design
8. **Accessible** - Support keyboard, screen readers, and touch

---

_This guide is for AI agents. Focus on code implementation and follow the patterns established in the codebase._

## Media Upload with Automatic Cleanup

### Overview

The application includes a sophisticated media upload system with automatic cleanup when resource creation fails. This prevents orphaned files in Firebase Storage.

### The Problem

When creating resources (products, shops, hero slides, etc.), users upload media files first. If the resource creation fails afterward, those uploaded files become orphaned in Firebase Storage, wasting storage space and creating clutter.

### The Solution

**Hook**: `useMediaUploadWithCleanup` (located in `src/hooks/useMediaUploadWithCleanup.ts`)

This hook tracks all uploaded media and provides automatic cleanup if the parent resource fails to create.

### How It Works

1. **Upload Phase**: Media files are uploaded to Firebase Storage immediately
2. **Tracking**: Each uploaded file's URL is tracked by the hook
3. **Resource Creation**: Attempt to create the parent resource (product, shop, etc.)
4. **Success Path**: If creation succeeds, call `clearTracking()` to stop tracking (files are kept)
5. **Failure Path**: If creation fails, call `cleanupUploadedMedia()` to delete all tracked files

### API Endpoints

**Upload Media**

```
POST /api/media/upload
Body: FormData with file, context, contextId
Returns: { success, url, id }
```

**Delete Media**

```
DELETE /api/media/delete
Body: { url: string } or { path: string }
Returns: { success, message, path }
```

### Hook API

```typescript
const {
  // Upload functions
  uploadMedia, // Upload single file
  uploadMultipleMedia, // Upload multiple files

  // Cleanup functions
  cleanupUploadedMedia, // Delete all tracked files
  clearTracking, // Stop tracking without deleting
  removeFromTracking, // Remove specific file from tracking

  // State
  uploadedMedia, // Array of uploaded media objects
  isUploading, // Upload in progress
  isCleaning, // Cleanup in progress
  hasUploadedMedia, // True if any media tracked

  // Utilities
  getUploadedUrls, // Get array of uploaded URLs
} = useMediaUploadWithCleanup({
  onUploadSuccess: (url) => {},
  onUploadError: (error) => {},
  onCleanupComplete: () => {},
});
```

### Usage Pattern

```typescript
"use client";

import { useState } from "react";
import { useMediaUploadWithCleanup } from "@/hooks/useMediaUploadWithCleanup";
import { apiService } from "@/services/api.service";

export default function CreateResourceForm() {
  const [formData, setFormData] = useState({
    name: "",
    images: [],
  });

  const {
    uploadMultipleMedia,
    cleanupUploadedMedia,
    clearTracking,
    isUploading,
  } = useMediaUploadWithCleanup({
    onUploadSuccess: (url) => {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url],
      }));
    },
  });

  const handleFilesAdded = async (files) => {
    // Upload and track files
    await uploadMultipleMedia(
      files.map((f) => f.file),
      "product"
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Try to create resource
      await apiService.post("/products", formData);

      // Success! Clear tracking (keep files)
      clearTracking();

      router.push("/products");
    } catch (error) {
      // Failure! Clean up uploaded files
      await cleanupUploadedMedia();

      // Reset form
      setFormData((prev) => ({ ...prev, images: [] }));

      alert("Failed to create product. Uploaded images deleted.");
    }
  };

  const handleCancel = async () => {
    // Clean up on cancel
    await cleanupUploadedMedia();
    router.back();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}

      <MediaUploader onFilesAdded={handleFilesAdded} files={formData.images} />

      <button type="submit" disabled={isUploading}>
        Create
      </button>
      <button type="button" onClick={handleCancel}>
        Cancel
      </button>
    </form>
  );
}
```

### Best Practices

1. **Always use the cleanup hook** for forms that upload media
2. **Call `clearTracking()` on success** to stop tracking uploaded files
3. **Call `cleanupUploadedMedia()` on failure** to delete orphaned files
4. **Handle cancel/navigation** by cleaning up uploaded media
5. **Show loading states** using `isUploading` and `isCleaning` flags
6. **Navigation guard is enabled by default** - automatically prevents leaving with unsaved media

### Navigation Guard Feature

**Automatic Protection**: The cleanup hook includes a built-in navigation guard that prevents users from leaving the page when they have uploaded media that hasn't been saved.

**How it works**:

1. User uploads media → Navigation guard activates automatically
2. User tries to navigate away (back button, link, close tab) → Confirmation dialog appears
3. User confirms → Media is cleaned up automatically, then navigation proceeds
4. User cancels → Stays on page, media is preserved
5. Save succeeds → `clearTracking()` disables guard, free navigation

**Usage with Navigation Guard**:

```typescript
const {
  uploadMedia,
  cleanupUploadedMedia,
  clearTracking,
  confirmNavigation, // For programmatic navigation
  hasUploadedMedia,
} = useMediaUploadWithCleanup({
  // Guard enabled by default, customize if needed
  enableNavigationGuard: true,
  navigationGuardMessage: "You have unsaved images. Leave anyway?",

  onUploadSuccess: (url) => {},
  onCleanupComplete: () => {
    console.log("Media cleaned up before navigation");
  },
});

// Programmatic navigation with guard
const handleGoToProducts = async () => {
  await confirmNavigation(async () => {
    router.push("/products");
  });
};

// Cancel button with guard
const handleCancel = async () => {
  if (hasUploadedMedia) {
    await confirmNavigation(() => router.back());
  } else {
    router.back();
  }
};
```

**Guard Options**:

- `enableNavigationGuard`: Enable/disable guard (default: true)
- `navigationGuardMessage`: Custom confirmation message
- `confirmNavigation()`: Helper for programmatic navigation

**Protected Scenarios**:

- ✅ Browser back/forward buttons
- ✅ Page refresh (Ctrl+R / Cmd+R)
- ✅ Close tab/window
- ✅ Link clicks (when using confirmNavigation)
- ✅ Programmatic router.push/replace

### Example Locations

- Full example: `src/components/examples/ExampleMediaCleanup.tsx`
- Navigation guard example: `src/components/examples/FormWithNavigationGuard.tsx`
- Real implementation in:
  - ✅ Hero slide creation/edit forms (`src/app/admin/hero-slides/`)
  - ✅ Review form (`src/components/product/ReviewForm.tsx`)
  - ✅ Category form (`src/components/admin/CategoryForm.tsx`)

### Preview Display

**Important**: The MediaUploader component shows previews automatically when you pass the `files` prop with MediaFile objects.

**Correct Pattern**:

```typescript
const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);

const handleFilesAdded = async (files: MediaFile[]) => {
  // Store files for preview display
  setUploadedFiles(files);

  // Upload to Firebase
  await uploadMedia(files[0].file, "product");
};

// Pass files to MediaUploader for preview
<MediaUploader
  onFilesAdded={handleFilesAdded}
  files={uploadedFiles} // This shows the preview!
/>;
```

**Why previews may not show**:

- ❌ Not passing `files` prop to MediaUploader
- ❌ Passing empty array to `files` prop
- ❌ Not storing MediaFile objects in state
- ❌ Trying to use `url` or `previewUrl` (use `preview` property)

### Media Service Methods

## Inline Edit & Quick Create Components

**Location**: `src/components/common/`  
**Guide**: `INLINE-EDIT-GUIDE.md`

### Components Available

```typescript
import {
  InlineEditRow, // Convert table rows to editable forms
  QuickCreateRow, // Add quick create at top of tables
  BulkActionBar, // Bulk operations with selection
  InlineImageUpload, // Small inline image uploader (64x64)
  MobileFilterSidebar, // Mobile filter sidebar with slide animation
  TableCheckbox, // Accessible checkboxes with indeterminate
} from "@/components/common/inline-edit";
```

### Usage Pattern

```typescript
// Define fields
const fields: InlineField[] = [
  { key: "name", type: "text", label: "Name", required: true },
  { key: "price", type: "number", label: "Price", min: 0 },
  { key: "image", type: "image", label: "Image", placeholder: "product" },
];

// In table
<tbody>
  <QuickCreateRow fields={fields} onSave={handleCreate} />
  {items.map((item) =>
    editingId === item.id ? (
      <InlineEditRow
        fields={fields}
        initialValues={item}
        onSave={handleSave}
        onCancel={() => setEditingId(null)}
      />
    ) : (
      <tr onDoubleClick={() => setEditingId(item.id)}>
        <td>
          <TableCheckbox checked={selected} onChange={setSelected} />
        </td>
        {/* cells */}
      </tr>
    )
  )}
</tbody>;
```

### Field Types Supported

- `text`, `email`, `url` - Text inputs
- `number` - Number input with min/max/step
- `textarea` - Multi-line text
- `select` - Dropdown with options
- `checkbox` - Boolean toggle
- `date` - Date picker
- `image` - Inline image upload

### Key Features

- ✅ Excel-like inline editing
- ✅ Validation with custom validators
- ✅ Keyboard shortcuts (Enter, Esc)
- ✅ Loading states
- ✅ Bulk operations
- ✅ Mobile responsive
- ✅ Accessible (WCAG compliant)

See `INLINE-EDIT-GUIDE.md` for complete documentation.
