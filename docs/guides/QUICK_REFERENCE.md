# Quick Reference - Service Layer Architecture

## 🚀 Quick Start

### Import Services

```typescript
import { api, ProductService, StorageService } from "@/lib/api";
```

### Import Hooks

```typescript
import { useApiProducts, useApiCart, useApiCategories } from "@/hooks/data";
```

## 📦 All Available Services

```typescript
import { api } from "@/lib/api";

// Use any service via the api object
api.products.getProducts();
api.cart.getCart();
api.wishlist.getWishlist();
api.orders.getOrders();
api.reviews.getReviews();
api.user.getProfile();
api.categories.getCategories();
api.auth.register();
api.addresses.getAddresses();
api.payment.createRazorpayOrder();
api.search.search();
api.game.getBeyblades();
api.seller.getShop();
api.admin.getUsers();
api.upload.upload();
api.storage.uploadImage();
api.consent.saveConsent();
api.contact.submitContactForm();
api.heroBanner.getActiveBanners();
api.content.getPage();
```

## 🎯 Common Patterns

### Fetch Products

```typescript
import { useApiProducts } from "@/hooks/data";

const { products, loading, error } = useApiProducts({
  category: "beyblades",
  featured: true,
  limit: 10,
});
```

### Upload Image

```typescript
import { StorageService } from "@/lib/api";

const url = await StorageService.uploadImage(file, "products");
```

### Add to Cart

```typescript
import { useApiCart } from "@/hooks/data";

const { addToCart } = useApiCart();
await addToCart(productId, quantity);
```

### Get User Profile

```typescript
import { UserService } from "@/lib/api";

const profile = await UserService.getProfile();
```

### Search Products

```typescript
import { SearchService } from "@/lib/api";

const results = await SearchService.search("beyblade");
```

## ⚠️ Migration Quick Guide

### Replace Storage Uploads

```typescript
// ❌ Before
import { uploadToFirebase } from "@/lib/firebase/storage";
const url = await uploadToFirebase(file, path);

// ✅ After
import { StorageService } from "@/lib/api";
const url = await StorageService.uploadImage(file, folder);
```

### Replace Data Fetching

```typescript
// ❌ Before
import { collection, getDocs } from "firebase/firestore";
const snapshot = await getDocs(collection(db, "products"));

// ✅ After
import { ProductService } from "@/lib/api";
const { products } = await ProductService.getProducts();
```

### Replace Hooks

```typescript
// ❌ Before
import { useProducts } from "@/hooks/data/useFirebase";

// ✅ After
import { useApiProducts } from "@/hooks/data";
```

## 🔍 Find Firebase Imports (VS Code)

**Search Pattern**: `from.*firebase`  
**Include**: `src/app/**,src/components/**,src/hooks/**,src/contexts/**`  
**Exclude**: `src/app/api/**`

## ✅ Allowed Firebase Usage

Only in auth-related files:

```typescript
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/api/_lib/database/config";
```

## 📖 Full Documentation

- [Complete Guide](../API_SERVICES_COMPLETE_GUIDE.md)
- [Migration Summary](./SERVICE_LAYER_MIGRATION_SUMMARY.md)
- [Removal Checklist](./FIREBASE_REMOVAL_CHECKLIST.md)
