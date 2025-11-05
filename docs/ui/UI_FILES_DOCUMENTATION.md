# 📚 UI Files Documentation

**Last Updated:** November 4, 2025  
**Status:** Complete Documentation with API Migration Details

---

## 📊 Table of Contents

1. [Overview](#overview)
2. [Page Components](#page-components)
3. [Shared Components](#shared-components)
4. [Context Providers](#context-providers)
5. [API Integration Status](#api-integration-status)
6. [Component Architecture](#component-architecture)

---

## Overview

This document provides comprehensive documentation for all UI files in the application, including their purpose, props, state management, API calls, and usage examples.

### File Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── products/          # Product pages
│   ├── categories/        # Category pages
│   ├── profile/          # User profile pages
│   ├── checkout/         # Checkout flow
│   ├── orders/           # Order management
│   └── admin/            # Admin pages
├── components/           # Reusable components
│   ├── products/        # Product components
│   ├── wishlist/        # Wishlist components
│   ├── address/         # Address components
│   └── admin/           # Admin components
└── contexts/            # React Context providers
```

---

## Page Components

### 1. Product Detail Page

**File:** `src/app/products/[slug]/page.tsx`  
**Route:** `/products/[slug]`  
**Status:** ✅ Fully Migrated to API Services

#### Purpose

Displays detailed information about a single product including images, price, variants, specifications, and related products.

#### State Management

```typescript
const [product, setProduct] = useState<Product | null>(null);
const [loading, setLoading] = useState(true);
const [quantity, setQuantity] = useState(1);
const [selectedImage, setSelectedImage] = useState(0);
const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
const [variantProducts, setVariantProducts] = useState<Product[]>([]);
const [imageZoom, setImageZoom] = useState(false);
```

#### API Calls (Using Services ✅)

```typescript
// 1. Fetch product details
const product = await api.products.getProduct(slug);

// 2. Fetch related products
const products = await api.products.getRelatedProducts(productId);

// 3. Fetch variant products (same category)
const data = await api.products.getProductsByCategory(category, {
  limit: 8,
});
```

#### Key Features

- **Image Gallery:** 5 images with zoom on hover
- **Price Display:** Shows price, compare at price, discount percentage
- **Stock Status:** Real-time stock availability
- **Quantity Selector:** Min/max validation
- **Add to Cart:** Integrates with CartContext
- **Wishlist Toggle:** Integrates with WishlistContext
- **Product Variants:** Shows similar products from same category
- **Related Products:** AI-based recommendations
- **Specifications:** Technical details in table format
- **Recently Viewed:** Tracks in localStorage

#### User Interactions

1. **View Product:** Loads product data on mount
2. **Change Image:** Click thumbnail to update main image
3. **Zoom Image:** Hover over main image
4. **Add to Cart:** Validates stock and adds to cart
5. **Add to Wishlist:** Toggles wishlist status
6. **Buy Now:** Adds to cart and redirects to cart page
7. **Share:** Uses Web Share API or copies link

#### Code Example

```typescript
const fetchProduct = async () => {
  try {
    setLoading(true);
    const product = await api.products.getProduct(slug);
    setProduct(product as any);

    if (product.category) {
      fetchVariantProducts(product.category, product.id);
      fetchRelatedProducts(product.id);
    }

    trackRecentlyViewed(product as any);
  } catch (error: any) {
    console.error("Error fetching product:", error);
    toast.error("Failed to load product");
    router.push("/products");
  } finally {
    setLoading(false);
  }
};
```

---

### 2. Products Listing Page

**File:** `src/app/products/page.tsx`  
**Route:** `/products`  
**Status:** ✅ Migrated to API Services

#### Purpose

Displays a list of all products with filtering, sorting, and search capabilities.

#### State Management

```typescript
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [filters, setFilters] = useState<ProductFilters>({});
const [sortBy, setSortBy] = useState<string>("relevance");
const [page, setPage] = useState(1);
```

#### API Calls (Using Services ✅)

```typescript
// Fetch products with filters
const { products, total, totalPages } = await api.products.getProducts({
  category: selectedCategory,
  search: searchQuery,
  minPrice: minPrice,
  maxPrice: maxPrice,
  sortBy: sortBy,
  inStock: inStockOnly,
  page: page,
  limit: 20,
});
```

#### Key Features

- **Search:** Real-time product search
- **Filters:** Category, price range, stock status
- **Sorting:** Price, name, newest, popularity
- **Pagination:** Load more functionality
- **Grid/List View:** Toggle between layouts
- **Empty State:** Shown when no products found

---

### 3. Category Pages

**File:** `src/app/categories/[slug]/page.tsx`  
**Route:** `/categories/[slug]`  
**Status:** ✅ Migrated to API Services

#### Purpose

Displays products within a specific category with subcategories and filters.

#### API Calls (Using Services ✅)

```typescript
// 1. Fetch category data
const categoryData = await api.categories.getCategory(slug);

// 2. Fetch subcategories
const subcats = await api.categories.getSubcategories(categoryData.id);

// 3. Fetch products in category
const data = await api.products.getProductsByCategory(category.id, filters);
```

#### Key Features

- **Breadcrumbs:** Navigation hierarchy
- **Subcategories:** Quick access to child categories
- **Product Filtering:** Same as products page
- **Category Description:** SEO-friendly description

---

### 4. Profile Page

**File:** `src/app/profile/page.tsx`  
**Route:** `/profile`  
**Status:** ✅ Migrated to API Services

#### Purpose

User profile dashboard showing account information and statistics.

#### State Management

```typescript
const [userData, setUserData] = useState<any>(null);
const [loading, setLoading] = useState(true);
const [stats, setStats] = useState({
  orders: 0,
  wishlist: 0,
  addresses: 0,
});
```

#### API Calls (Using Services ✅)

```typescript
// 1. Fetch user profile
const profile = await api.user.getProfile();

// 2. Fetch user statistics
const userStats = await api.user.getUserStats();
const addresses = await api.user.getAddresses();

// Statistics include:
// - totalOrders: Total number of orders
// - totalSpent: Total amount spent
// - totalReviews: Number of reviews written
// - wishlistCount: Items in wishlist
```

#### Key Features

- **Profile Card:** Avatar, name, email, phone, member since
- **Stats Cards:** Orders, wishlist, addresses count
- **Quick Actions:** Links to orders, addresses, tracking, settings
- **Role-Based Access:** Admin/Seller dashboard links
- **Logout Button:** Sign out functionality

#### User Flow

1. **Load Profile:** Fetches user data on mount
2. **View Stats:** Displays order, wishlist, address counts
3. **Navigate:** Quick links to other profile pages
4. **Logout:** Signs out and redirects to home

---

### 5. Profile Edit Page

**File:** `src/app/profile/edit/page.tsx`  
**Route:** `/profile/edit`  
**Status:** ⏳ Needs Migration

#### Purpose

Allows users to edit their profile information including name, phone, and avatar.

#### Current API Calls (Needs Migration ❌)

```typescript
// BEFORE (Using fetch - needs migration)
const uploadResponse = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});

const response = await fetch("/api/user/profile", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(updateData),
});
```

#### Migration Needed ⚠️

```typescript
// AFTER (Should use API services)
// 1. Upload avatar
const uploadResult = await api.user.uploadAvatar(photoFile);

// 2. Update profile
const updatedProfile = await api.user.updateProfile({
  name: formData.name,
  phone: formData.phone,
  avatar: uploadResult.url,
});
```

#### Key Features

- **Avatar Upload:** Image upload with crop editor
- **WhatsApp-style Editor:** Crop and adjust image
- **Form Validation:** Name and phone validation
- **Preview:** Shows changes before saving
- **Cancel:** Discards changes

---

### 6. Profile Settings Page

**File:** `src/app/profile/settings/page.tsx`  
**Route:** `/profile/settings`  
**Status:** ⏳ Needs Migration

#### Purpose

User preferences and notification settings.

#### Current API Calls (Needs Migration ❌)

```typescript
// BEFORE (Using fetch - needs migration)
await fetch("/api/user/preferences", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(preferences),
});
```

#### Migration Needed ⚠️

```typescript
// AFTER (Should use API services)
await api.user.updateProfile({
  preferences: {
    currency: selectedCurrency,
    language: selectedLanguage,
    notifications: {
      email: emailNotifications,
      sms: smsNotifications,
      push: pushNotifications,
    },
  },
});
```

#### Key Features

- **Currency Selection:** Choose preferred currency
- **Language Settings:** Select language preference
- **Email Notifications:** Toggle email alerts
- **Order Updates:** Control order notifications
- **Promotional Emails:** Marketing preferences
- **Password Change:** Redirect to password change page
- **Delete Account:** Account deletion with confirmation

---

### 7. Orders List Page

**File:** `src/app/profile/orders/page.tsx`  
**Route:** `/profile/orders`  
**Status:** ✅ Migrated to API Services

#### Purpose

Displays user's order history with filtering and search.

#### API Calls (Using Services ✅)

```typescript
// Fetch orders with filters
const { orders, total, totalPages } = await api.orders.getOrders({
  status: selectedStatus,
  search: searchQuery,
  page: page,
  limit: 10,
});
```

#### Key Features

- **Order List:** All user orders with status
- **Status Filter:** Filter by order status
- **Search:** Search orders by ID or product name
- **Order Details Link:** Navigate to detail page
- **Order Status Badge:** Visual status indicator
- **Empty State:** No orders message

---

### 8. Order Detail Page

**File:** `src/app/orders/[id]/page.tsx`  
**Route:** `/orders/[id]`  
**Status:** ✅ Migrated to API Services

#### Purpose

Shows detailed information about a specific order.

#### API Calls (Using Services ✅)

```typescript
// 1. Fetch order details
const order = await api.orders.getOrder(orderId);

// 2. Track order
const tracking = await api.orders.trackOrder(orderId);

// 3. Cancel order
await api.orders.cancelOrder(orderId, reason);

// 4. Download invoice
await api.orders.downloadInvoice(orderId);
```

#### Key Features

- **Order Summary:** Products, quantities, prices
- **Order Status:** Current status and timeline
- **Shipping Address:** Delivery address details
- **Payment Info:** Payment method and status
- **Tracking:** Real-time order tracking
- **Cancel Order:** Cancel pending orders
- **Download Invoice:** PDF invoice download
- **Reorder:** Add items back to cart

---

### 9. Checkout Page

**File:** `src/app/checkout/page.tsx`  
**Route:** `/checkout`  
**Status:** ⏳ Needs Migration

#### Purpose

Complete checkout flow with address selection and payment.

#### Current API Calls (Needs Migration ❌)

```typescript
// BEFORE (Using fetch - needs migration)
const response = await fetch("/api/seller/coupons/validate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ code: couponCode }),
});

const orderResponse = await fetch("/api/payment/razorpay/create-order", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ amount: totalAmount }),
});

const orderCreateResponse = await fetch("/api/orders/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(orderData),
});
```

#### Migration Needed ⚠️

```typescript
// AFTER (Should use API services)
// Note: May need to create additional service methods

// 1. Validate coupon (needs new service method)
// Could add to OrderService or create CouponService
const couponValidation = await api.orders.validateCoupon(couponCode);

// 2. Create order
const order = await api.orders.createOrder({
  items: cartItems,
  shippingAddress: selectedAddress,
  paymentMethod: paymentMethod,
  couponCode: appliedCoupon?.code,
});

// 3. Payment integration stays as-is (Razorpay SDK)
// These are payment gateway specific calls
```

#### Key Features

- **Address Selection:** Choose or add shipping address
- **Address Form:** Add new address inline
- **Cart Summary:** Review items before checkout
- **Coupon Code:** Apply discount coupons
- **Payment Methods:** Razorpay, PayPal, COD
- **Order Summary:** Total with taxes and discounts
- **Place Order:** Create order and initiate payment

#### Payment Flow

1. **Select Address:** User chooses shipping address
2. **Apply Coupon:** Optional discount code
3. **Select Payment:** Choose payment method
4. **Place Order:** Create order in database
5. **Payment Gateway:** Redirect to payment page
6. **Verify Payment:** Confirm payment success
7. **Order Confirmation:** Show success page

---

### 10. Categories Page

**File:** `src/app/categories/page.tsx`  
**Route:** `/categories`  
**Status:** ✅ Migrated to API Services

#### Purpose

Browse all product categories in tree or grid view.

#### API Calls (Using Services ✅)

```typescript
// Fetch category tree
const categoryTree = await api.categories.getCategoryTree();

// Filter root categories
const rootCategories = categoryTree.filter(
  (cat) => !cat.parentId && cat.isActive
);
```

#### Key Features

- **Category Grid:** Visual category cards
- **Category List:** Alternative list view
- **Search:** Filter categories by name
- **Product Count:** Shows products per category
- **Subcategories:** Displays child categories
- **Featured Badge:** Highlights featured categories

---

## Shared Components

### 1. Address Card Component

**File:** `src/components/address/AddressCard.tsx`  
**Purpose:** Display and manage individual address

#### Props

```typescript
interface AddressCardProps {
  address: Address;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
}
```

#### Features

- **Display:** Shows formatted address
- **Selection:** Checkmark for selected address
- **Default Badge:** Highlights default address
- **Actions:** Edit, delete, set as default buttons

---

### 2. Address Form Component

**File:** `src/components/address/AddressForm.tsx`  
**Purpose:** Create or edit address

#### Props

```typescript
interface AddressFormProps {
  address?: Address;
  onSubmit: (data: AddressFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

#### Features

- **Form Fields:** Name, phone, address lines, city, state, pincode
- **Validation:** Required field validation
- **Address Type:** Home, work, other
- **Default Toggle:** Set as default address
- **Submit/Cancel:** Save or discard changes

---

### 3. Wishlist Button Component

**File:** `src/components/wishlist/WishlistButton.tsx`  
**Purpose:** Add/remove product from wishlist

#### Props

```typescript
interface WishlistButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    slug: string;
  };
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}
```

#### API Integration ✅

```typescript
// Uses WishlistContext which uses WishlistService
const { addItem, removeItem, isInWishlist } = useWishlist();
```

#### Features

- **Heart Icon:** Filled when in wishlist
- **Toggle:** Add/remove on click
- **Toast:** Success/error notifications
- **Optimistic UI:** Updates immediately

---

### 4. Recently Viewed Component

**File:** `src/components/products/RecentlyViewed.tsx`  
**Purpose:** Show recently viewed products

#### Props

```typescript
interface RecentlyViewedProps {
  limit?: number;
  excludeId?: string;
  className?: string;
}
```

#### Features

- **LocalStorage:** Tracks view history
- **Limit:** Max products to show
- **Exclude:** Remove current product
- **Carousel:** Horizontal scroll

---

## Context Providers

### 1. Cart Context

**File:** `src/contexts/CartContext.tsx`  
**Status:** ✅ Migrated to API Services

#### State

```typescript
interface CartState {
  items: CartItem[];
  loading: boolean;
  subtotal: number;
  itemCount: number;
}
```

#### API Calls (Using Services ✅)

```typescript
// Get cart
const cart = await CartService.getCart();

// Save cart
await CartService.saveCart(items);

// Merge guest cart
await CartService.mergeGuestCart(guestItems);

// Sync cart
await CartService.syncCart();

// Clear cart
await CartService.clearCart();
```

#### Methods

- `addItem(item)` - Add item to cart
- `removeItem(itemId)` - Remove item from cart
- `updateQuantity(itemId, quantity)` - Update quantity
- `clearCart()` - Clear all items
- `syncCart()` - Sync prices with backend

---

### 2. Wishlist Context

**File:** `src/contexts/WishlistContext.tsx`  
**Status:** ✅ Migrated to API Services

#### State

```typescript
interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  itemCount: number;
}
```

#### API Calls (Using Services ✅)

```typescript
// Get wishlist
const wishlist = await WishlistService.getWishlist();

// Add item
await WishlistService.addItem(item);

// Remove item
await WishlistService.removeItem(itemId);

// Clear wishlist
await WishlistService.clearWishlist();

// Check if in wishlist
const exists = await WishlistService.isInWishlist(productId);
```

#### Methods

- `addItem(item)` - Add to wishlist
- `removeItem(itemId)` - Remove from wishlist
- `clearWishlist()` - Clear all items
- `isInWishlist(productId)` - Check existence

---

### 3. Auth Context

**File:** `src/contexts/AuthContext.tsx`  
**Status:** Using Firebase Auth

#### State

```typescript
interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isSeller: boolean;
}
```

#### Methods

- `login(email, password)` - Email/password login
- `loginWithGoogle()` - Google OAuth
- `signup(email, password, name)` - Create account
- `logout()` - Sign out
- `resetPassword(email)` - Password reset

---

### 4. Currency Context

**File:** `src/contexts/CurrencyContext.tsx`  
**Purpose:** Handle multi-currency support

#### State

```typescript
interface CurrencyState {
  currency: string;
  exchangeRates: Record<string, number>;
  loading: boolean;
}
```

#### Methods

- `setCurrency(code)` - Change currency
- `formatPrice(amount)` - Format with currency symbol
- `convertPrice(amount, from, to)` - Convert between currencies

---

## API Integration Status

### ✅ Fully Migrated (Using API Services)

1. **Products**

   - Product detail page ✅
   - Products listing ✅
   - Product search ✅
   - Related products ✅

2. **Categories**

   - Category tree ✅
   - Category detail ✅
   - Products by category ✅

3. **User Profile**

   - Profile page ✅
   - User stats ✅
   - User addresses ✅

4. **Orders**

   - Orders list ✅
   - Order detail ✅
   - Order tracking ✅
   - Cancel order ✅

5. **Contexts**
   - Cart context ✅
   - Wishlist context ✅

### ⏳ Needs Migration (Still Using fetch())

1. **Profile**

   - Profile edit page ❌
   - Settings page ❌

2. **Checkout**

   - Checkout page ❌ (partial - needs coupon/payment services)

3. **Components**
   - SmartCategorySelector ❌
   - InteractiveHeroBanner ❌
   - BulkOperationsManagement ❌
   - Admin components ❌ (beyblade-related)

### 📊 Migration Progress

- **Total Files:** 40+
- **Migrated:** 10 (25%)
- **Pending:** 30 (75%)
- **Priority High:** 3 files
- **Priority Medium:** 5 files
- **Priority Low:** 22 files (admin/game)

---

## Component Architecture

### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
API Service Call (api.*.method())
    ↓
API Client (handles auth, caching, retry)
    ↓
Next.js API Route
    ↓
Firebase/Database
    ↓
Response
    ↓
Component State Update
    ↓
UI Re-render
```

### Error Handling Pattern

```typescript
try {
  setLoading(true);
  const data = await api.products.getProduct(slug);
  setProduct(data);
} catch (error) {
  console.error("Error:", error);
  toast.error("Failed to load product");
} finally {
  setLoading(false);
}
```

### Loading States

All pages implement:

1. **Initial Loading:** Skeleton or spinner
2. **Action Loading:** Disabled buttons with spinner
3. **Background Loading:** Subtle indicator
4. **Error State:** Error message with retry
5. **Empty State:** No data message

### Responsive Design

All components support:

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px
- **Large Desktop:** > 1536px

---

## Best Practices

### 1. Always Use API Services

```typescript
// ✅ Good
import { api } from "@/lib/api";
const products = await api.products.getProducts();

// ❌ Bad
const response = await fetch("/api/products");
```

### 2. Handle Loading States

```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

try {
  setLoading(true);
  setError(null);
  // API call
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
}
```

### 3. Use TypeScript Types

```typescript
import type { Product, Order, User } from "@/lib/api";
const [product, setProduct] = useState<Product | null>(null);
```

### 4. Implement Proper Error Handling

```typescript
catch (error: any) {
  console.error("Detailed error:", error);
  toast.error(error.message || "Something went wrong");

  // Optional: Fallback data
  if (hasLocalData) {
    setData(localData);
  }
}
```

### 5. Optimize Re-renders

```typescript
// Memoize expensive calculations
const total = useMemo(
  () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  [items]
);

// Memoize callbacks
const handleAdd = useCallback(() => {
  addToCart(product);
}, [product]);
```

---

## Quick Reference

### Import API Services

```typescript
import { api } from "@/lib/api";
```

### Common API Calls

```typescript
// Products
await api.products.getProducts(filters);
await api.products.getProduct(slug);
await api.products.searchProducts(query);

// Orders
await api.orders.getOrders();
await api.orders.createOrder(data);
await api.orders.getOrder(id);

// User
await api.user.getProfile();
await api.user.updateProfile(data);
await api.user.getAddresses();

// Categories
await api.categories.getCategoryTree();
await api.categories.getCategory(slug);
```

### Documentation Links

- **API Services Guide:** `docs/API_SERVICES_COMPLETE_GUIDE.md`
- **Migration Guide:** `QUICK_MIGRATION_GUIDE.md`
- **Migration Progress:** `API_MIGRATION_PROGRESS.md`
- **Implementation:** `API_SERVICES_IMPLEMENTATION_COMPLETE.md`

---

**Last Updated:** November 4, 2025  
**Maintainer:** Development Team  
**Status:** Living Document - Updated as features are added
