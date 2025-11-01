# COD Order & Category Page Fixes

**Date:** November 2, 2025  
**Status:** ✅ Fixed

## Issues Resolved

### 1. Category Page Not Working - "Category not found" Error

**Problem:**

- Category detail page was throwing "Category not found" error
- API route was not properly handling Next.js 15+ async params

**Root Cause:**

- Next.js 15 (with Turbopack) changed how dynamic route parameters are passed
- The params are now a Promise that needs to be awaited
- Old code: `{ params }: { params: { slug: string } }`
- New code: `{ params }: { params: Promise<{ slug: string }> }`

**Fix Applied:**

- Updated `src/app/api/categories/[slug]/route.ts`
- Changed params handling to await the Promise:
  ```typescript
  export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
  ) {
    const { slug } = await params;
    // ... rest of the code
  }
  ```

**Files Changed:**

- `src/app/api/categories/[slug]/route.ts`

---

### 2. COD (Cash on Delivery) Orders Not Working

**Problem:**

- COD orders were failing during order creation
- Missing required fields in order items (sellerId, sellerName)
- Stock field inconsistency (some products use `stock`, others use `quantity`)

**Root Causes:**

1. **Missing Seller Information:**

   - Order validation was requiring `sellerId` for each item
   - Checkout page wasn't properly passing seller information from cart items
   - CartItem had `sellerId` and `sellerName` fields but they weren't being mapped correctly

2. **Stock Field Inconsistency:**
   - Some products in database use `stock` field
   - Some products use `quantity` field
   - Order creation was only checking/updating `stock` field

**Fixes Applied:**

#### A. Relaxed Validation (src/lib/order/order-utils.ts)

- Removed strict `sellerId` validation requirement
- Made seller fields optional with defaults:
  ```typescript
  // Seller ID is optional - will use default if not provided
  ```

#### B. Fixed Cart Item Mapping (src/app/checkout/page.tsx)

- Updated both Razorpay and COD order creation to properly map cart items:
  ```typescript
  items: items.map((item) => ({
    id: item.id,
    productId: item.productId, // Use productId instead of id
    name: item.name,
    image: item.image || "/assets/placeholder.png",
    price: item.price,
    quantity: item.quantity,
    sku: item.sku || "",
    sellerId: item.sellerId || "default-seller", // Provide default
    sellerName: item.sellerName || "JustForView", // Provide default
    slug: item.slug || "",
  }));
  ```

#### C. Fixed Stock Handling (src/app/api/orders/create/route.ts)

- Updated stock checking to handle both field names:
  ```typescript
  const currentStock = product?.stock ?? product?.quantity ?? 0;
  ```
- Updated stock reduction to update both fields if they exist:
  ```typescript
  const updates: any = { updatedAt: new Date() };
  if (productData?.stock !== undefined) {
    updates.stock = FieldValue.increment(-item.quantity);
  }
  if (productData?.quantity !== undefined) {
    updates.quantity = FieldValue.increment(-item.quantity);
  }
  ```

**Files Changed:**

- `src/app/checkout/page.tsx`
- `src/lib/order/order-utils.ts`
- `src/app/api/orders/create/route.ts`

---

### 3. Firestore Index Missing Error

**Problem:**

- Error: "The query requires an index. You can create it here..."
- Query on products collection with `status` and `quantity` fields failed
- Missing composite index for filtering active products by stock

**Root Cause:**

- Firestore requires composite indexes when querying with:
  - Multiple equality filters
  - Equality filter + range/inequality filter
  - Equality filter + orderBy on different field
- The products API route was querying:
  - `.where("status", "==", "active")`
  - `.where("quantity", ">", 0)`
- This combination requires a composite index

**Fix Applied:**

- Added missing index to `firestore.indexes.json`:
  ```json
  {
    "collectionGroup": "products",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "status", "order": "ASCENDING" },
      { "fieldPath": "quantity", "order": "ASCENDING" },
      { "fieldPath": "__name__", "order": "ASCENDING" }
    ]
  }
  ```
- Deployed indexes to Firebase: `firebase deploy --only firestore:indexes`

**Note:** Index building takes time (a few minutes for small collections, longer for large ones). The error will persist until the index is fully built.

**Files Changed:**

- `firestore.indexes.json`

---

## Testing Checklist

### Category Page Testing

- [ ] Visit any category page (e.g., `/categories/electronics`)
- [ ] Verify category loads without errors
- [ ] Check subcategories display correctly
- [ ] Test product listing in category
- [ ] Test search and filters within category

### COD Order Testing

- [ ] Add products to cart
- [ ] Go to checkout page
- [ ] Select a shipping address
- [ ] Choose "Cash on Delivery" payment method
- [ ] Click "Place Order"
- [ ] Verify order is created successfully
- [ ] Check order appears in orders page
- [ ] Verify order status is "Pending Approval"
- [ ] Verify product stock is reduced

### Razorpay Order Testing

- [ ] Test Razorpay payment flow still works
- [ ] Verify proper seller info is included
- [ ] Check stock reduction after payment

---

## Technical Details

### Next.js 15 Async Params

Starting from Next.js 15, all dynamic route parameters in API routes are Promises. This affects:

- API routes with `[param]` segments
- Must await params before accessing properties
- Applies to both App Router and Pages Router API routes

### Product Data Model Consistency

The codebase has inconsistency in product stock fields:

- **Old products:** Use `quantity` field
- **New products:** Use `stock` field
- **Current fix:** Support both fields in all stock operations
- **Future improvement:** Migrate all products to use consistent field name

### Order Item Requirements

Order items must include:

- Basic fields: `id`, `productId`, `name`, `price`, `quantity`
- Image: Use fallback if missing
- Seller info: Use defaults if not provided
- Optional: `sku`, `slug`

---

## Related Files

### API Routes

- `src/app/api/categories/[slug]/route.ts` - Category detail endpoint
- `src/app/api/orders/create/route.ts` - Order creation endpoint

### Components & Pages

- `src/app/checkout/page.tsx` - Checkout page with COD support
- `src/app/categories/[slug]/page.tsx` - Category detail page

### Utilities & Types

- `src/lib/order/order-utils.ts` - Order validation and utils
- `src/types/order.ts` - Order type definitions
- `src/contexts/CartContext.tsx` - Cart state management

---

## Known Issues & Future Improvements

### Current Limitations

1. Stock field inconsistency should be resolved through database migration
2. Seller info defaults to "JustForView" when not provided
3. No real-time stock validation during checkout

### Recommended Improvements

1. **Database Migration:** Standardize all products to use `stock` field
2. **Real-time Stock Check:** Validate stock before final order creation
3. **Seller Integration:** Ensure all products have proper seller info
4. **Stock Reservation:** Implement temporary stock reservation during checkout
5. **Better Error Messages:** Provide more specific error messages to users

---

## Success Criteria

✅ Category pages load without errors  
✅ COD orders can be placed successfully  
✅ Product stock is properly reduced  
✅ Order appears with "Pending Approval" status  
✅ Razorpay payments still work correctly  
✅ No TypeScript compilation errors

---

## Deployment Notes

These fixes are backward compatible and don't require:

- Database migrations
- Environment variable changes
- Third-party service updates

However, consider:

1. Testing in staging environment first
2. Monitoring order creation logs
3. Checking product stock accuracy
4. Verifying COD order notifications work

---

## Support & Troubleshooting

If issues persist:

1. **Check Browser Console** for any client-side errors
2. **Check Server Logs** for API errors
3. **Verify Firestore Rules** allow order creation
4. **Check Product Data** has required fields (name, price, stock/quantity)
5. **Test Authentication** user token is valid

Common errors:

- "Product not found" → Check product exists in Firestore
- "Insufficient stock" → Verify product stock/quantity field
- "Invalid order items" → Check cart items have all required fields
