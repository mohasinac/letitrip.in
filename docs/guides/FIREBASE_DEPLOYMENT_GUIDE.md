# Firebase Deployment Guide

## 📋 Overview

This guide covers deploying Firestore indexes, security rules, and Storage rules for the seller panel system.

**Last Updated:** October 31, 2025  
**Status:** Ready for Deployment

---

## 🔥 What's Been Updated

### Firestore Rules (`firestore.rules`)

✅ **Admin Full Access**: Admins can now perform ALL operations across all collections  
✅ **Seller Products**: Enhanced with admin override  
✅ **Seller Coupons**: Enhanced with admin override  
✅ **Seller Sales**: Enhanced with admin override  
✅ **Seller Shops**: Enhanced with admin override  
✅ **Seller Orders**: New collection rules added  
✅ **Seller Shipments**: New collection rules added  
✅ **Seller Alerts**: New collection rules added

**Key Changes:**

- Admin (`role == 'admin'`) can bypass ownership checks
- Admin can create, read, update, delete ALL seller resources
- Validation functions remain in place for data integrity
- Sellers can still manage their own resources

### Firestore Indexes (`firestore.indexes.json`)

✅ **Seller Products**: 3 composite indexes  
✅ **Seller Coupons**: 2 composite indexes  
✅ **Seller Sales**: 2 composite indexes  
✅ **Seller Orders**: 3 composite indexes (NEW)  
✅ **Seller Shipments**: 2 composite indexes (NEW)  
✅ **Seller Alerts**: 3 composite indexes (NEW)  
✅ **Orders**: 2 composite indexes (NEW)

**Total Indexes:** 17 seller-related indexes

### Storage Rules (`storage.rules`)

✅ **Admin Full Access**: Admins can read/write ALL paths  
✅ **Avatars**: Enhanced with admin override  
✅ **Seller Shop Assets**: Enhanced with admin override  
✅ **Seller Product Media**: Enhanced with admin override  
✅ **Products**: Enhanced with admin override  
✅ **Auctions**: Enhanced with admin override  
✅ **Reviews**: Enhanced with admin override

---

## 🚀 Deployment Commands

### Option 1: Deploy Everything at Once

```powershell
# Deploy all Firebase configurations
firebase deploy --only firestore,storage

# Or more explicitly:
firebase deploy --only firestore:indexes,firestore:rules,storage
```

### Option 2: Deploy Step by Step

```powershell
# Step 1: Deploy Firestore indexes (takes 5-10 minutes to build)
firebase deploy --only firestore:indexes

# Step 2: Deploy Firestore security rules (instant)
firebase deploy --only firestore:rules

# Step 3: Deploy Storage security rules (instant)
firebase deploy --only storage
```

### Recommended: Deploy Separately

```powershell
# 1. Deploy indexes first (this takes time, run it and continue working)
firebase deploy --only firestore:indexes

# 2. While indexes build, deploy rules (instant)
firebase deploy --only firestore:rules

# 3. Deploy storage rules (instant)
firebase deploy --only storage
```

---

## ⏱️ Expected Deployment Times

| Component         | Time         | Can Continue Working? |
| ----------------- | ------------ | --------------------- |
| Firestore Indexes | 5-15 minutes | ✅ Yes                |
| Firestore Rules   | < 30 seconds | ✅ Yes                |
| Storage Rules     | < 30 seconds | ✅ Yes                |

**Note:** Index building happens in the background. You can continue development while they build.

---

## 🔍 Verify Deployment

### 1. Check Firestore Indexes

```powershell
# Open Firebase Console
firebase open firestore:indexes
```

Or visit: https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/indexes

**Look for:**

- ✅ All 17+ indexes showing "Enabled" status
- ⚠️ Some showing "Building" (wait for completion)
- ❌ Any showing "Error" (re-deploy if needed)

### 2. Check Firestore Rules

```powershell
# Open Firebase Console
firebase open firestore:rules
```

**Verify:**

- Admin can access all seller collections
- Validation functions are present
- Seller ownership checks work

### 3. Check Storage Rules

```powershell
# Open Firebase Console
firebase open storage:rules
```

**Verify:**

- Admin has full access to all paths
- `/avatars/` path exists
- `/sellers/{sellerId}/shop/` path exists
- `/sellers/{sellerId}/products/{productSlug}/` path exists

---

## 🧪 Testing After Deployment

### Test Admin Access

```typescript
// As admin user:
// 1. Create a product for any seller
POST /api/seller/products
Headers: { Authorization: Bearer {admin-token} }
Body: { sellerId: "any-seller-id", ...productData }

// 2. Update any seller's product
PUT /api/seller/products/{any-product-id}

// 3. Delete any seller's product
DELETE /api/seller/products/{any-product-id}

// 4. View any seller's coupons
GET /api/seller/coupons

// 5. Upload to any seller's storage path
POST /api/storage/upload
Body: { path: "sellers/any-seller-id/shop/logo.jpg", file }
```

### Test Seller Access

```typescript
// As seller user:
// 1. Create own product (should work)
POST /api/seller/products
Headers: { Authorization: Bearer {seller-token} }
Body: { sellerId: "{own-id}", ...productData }

// 2. Try to create product for another seller (should fail)
POST /api/seller/products
Body: { sellerId: "another-seller-id", ...productData }
// Expected: 403 Forbidden

// 3. View own coupons (should work)
GET /api/seller/coupons

// 4. Try to view another seller's coupons (should fail)
GET /api/seller/coupons?sellerId=another-seller-id
// Expected: Returns empty or 403
```

### Test Profile Picture Upload

```typescript
// Upload avatar (any authenticated user)
POST /api/storage/upload
Headers: { Authorization: Bearer {user-token} }
Body: {
  path: "avatars/{userId}.jpg",
  file: [image file]
}

// Verify:
// 1. File appears in Firebase Storage Console
// 2. Public URL is accessible
// 3. Image shows in profile without cache issues
```

---

## 📊 Firestore Collections Summary

### Existing Collections (Already Deployed)

- `users` - User profiles with role field
- `products` - Admin-managed products
- `categories` - Product categories
- `orders` - User orders
- `auctions` - Auction listings
- `carts` - User shopping carts
- `watchlists` - User wishlists

### New Seller Collections (Requires Index Deployment)

- `seller_products` - Seller product catalog
- `seller_coupons` - Seller coupons system
- `seller_sales` - Seller sales/discounts
- `seller_orders` - Orders assigned to sellers
- `seller_shipments` - Shipment tracking
- `seller_alerts` - Seller notifications
- `sellers` - Seller shop profiles

---

## 🗂️ Storage Paths Summary

### Existing Paths

- `/products/{productId}/` - Admin product images
- `/users/{userId}/profile/` - User profiles
- `/auctions/{auctionId}/` - Auction images
- `/categories/{categoryId}/` - Category images
- `/banners/` - Homepage banners

### New Seller Paths (Requires Rule Deployment)

- `/avatars/{fileName}` - User profile pictures (NEW)
- `/sellers/{sellerId}/shop/` - Shop logo, cover (NEW)
- `/sellers/{sellerId}/products/{productSlug}/` - Product media (NEW)
- `/sellers/{sellerId}/store/{assetType}/` - Store assets
- `/sellers/{sellerId}/verification/` - Verification documents

---

## ⚠️ Important Notes

### 1. Index Building Time

- First-time index deployment can take **10-15 minutes**
- Subsequent updates are faster (2-5 minutes)
- App will throw index errors until building completes
- **Solution:** Wait for all indexes to show "Enabled"

### 2. Admin Access Requirements

- User must have `role: 'admin'` in Firestore `/users/{uid}` document
- Admin token must include `role` claim in custom claims
- To set custom claims, use Admin SDK:
  ```javascript
  admin.auth().setCustomUserClaims(uid, { role: "admin" });
  ```

### 3. Rule Validation

- Validation functions check data structure
- Admin can bypass ownership but NOT validation
- Invalid data will still be rejected even for admins
- This ensures data integrity

### 4. Storage File Size Limits

- Avatars: 5MB max
- Shop assets: 5MB max
- Product images: 20MB max (for videos)
- Admin uploads: 50MB max

---

## 🐛 Troubleshooting

### Error: "Missing Index"

**Cause:** Firestore indexes still building or failed  
**Solution:**

1. Check index status in Firebase Console
2. Wait for "Building" to become "Enabled"
3. If "Error", re-deploy: `firebase deploy --only firestore:indexes`

### Error: "Permission Denied" (Admin User)

**Cause:** Custom claims not set or token not refreshed  
**Solution:**

1. Verify user has `role: 'admin'` in Firestore
2. Set custom claims via Admin SDK
3. Force token refresh in client:
   ```typescript
   await firebase.auth().currentUser?.getIdToken(true);
   ```

### Error: "Permission Denied" (Seller User)

**Cause:** Trying to access another seller's resources  
**Solution:**

- This is expected behavior
- Sellers can only access their own resources
- Admins must use admin accounts to access all resources

### Error: "Storage Upload Failed"

**Cause:** Storage rules not deployed or file too large  
**Solution:**

1. Deploy storage rules: `firebase deploy --only storage`
2. Check file size limits
3. Verify path structure matches rules

---

## 📝 Post-Deployment Checklist

- [ ] **Deploy Firestore indexes** - `firebase deploy --only firestore:indexes`
- [ ] **Deploy Firestore rules** - `firebase deploy --only firestore:rules`
- [ ] **Deploy Storage rules** - `firebase deploy --only storage`
- [ ] **Wait for indexes to build** (check Firebase Console)
- [ ] **Test admin access** (create/update/delete any resource)
- [ ] **Test seller access** (create/update own resources)
- [ ] **Test profile picture upload** (verify cache-busting works)
- [ ] **Test product creation** (verify SKU/slug uniqueness)
- [ ] **Test coupon creation** (verify code uniqueness)
- [ ] **Test sales creation** (verify discount validation)
- [ ] **Verify all 17+ indexes are "Enabled"**
- [ ] **Check Storage Console** (verify paths exist)
- [ ] **Run API tests** (Thunder Client/Postman)

---

## 🎯 Next Steps After Deployment

Once deployment is complete and verified:

1. **Test All Seller APIs** (17 endpoints):
   - Coupons: 6 endpoints
   - Sales: 6 endpoints
   - Products: 5 endpoints

2. **Implement Multi-Step Product Form**:
   - Step 1: Product Details
   - Step 2: Pricing & Inventory
   - Step 3: Media Upload
   - Step 4: Condition & Features
   - Step 5: SEO & Publishing

3. **Create Additional APIs**:
   - `GET /api/seller/products/categories/leaf` - Leaf categories
   - `POST /api/seller/products/[id]/media` - Media upload
   - `GET /api/seller/shop/addresses` - Pickup addresses

4. **Phase 4: Orders System**
   - Orders list page
   - Order detail page
   - Approval workflow
   - Invoice generation

---

## 📚 Related Documentation

- [SELLER_PANEL_PROGRESS.md](./SELLER_PANEL_PROGRESS.md) - Overall progress
- [PHASE3_PRODUCTS_SYSTEM.md](./PHASE3_PRODUCTS_SYSTEM.md) - Products system details
- [Firebase Console](https://console.firebase.google.com)

---

## 🔗 Quick Links

- **Firestore Indexes:** https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/indexes
- **Firestore Rules:** https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/rules
- **Storage Rules:** https://console.firebase.google.com/project/YOUR_PROJECT_ID/storage/rules
- **Firebase CLI Docs:** https://firebase.google.com/docs/cli

---

**Ready to Deploy?** Run the command and let's get your seller panel live! 🚀
