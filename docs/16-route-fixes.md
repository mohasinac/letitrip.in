# Route Fixes - Use Slug as Document ID

## Strategy

**Use slug as the Firestore document ID** for SEO consistency.

- `doc.id === slug` for all entities with slugs
- No need to query by slug - just use `doc(slug).get()`
- Eliminates id vs slug confusion
- Better SEO - URLs always match document IDs

### Affected Collections

| Collection | Current             | After                          |
| ---------- | ------------------- | ------------------------------ |
| shops      | `add()` → random ID | `doc(slug).set()` → slug is ID |
| products   | `add()` → random ID | `doc(slug).set()` → slug is ID |
| categories | `add()` → random ID | `doc(slug).set()` → slug is ID |
| auctions   | `add()` → random ID | `doc(slug).set()` → slug is ID |
| blog       | `add()` → random ID | `doc(slug).set()` → slug is ID |

---

## Implementation Status

### ✅ Phase 1: Update Create APIs (COMPLETED)

- [x] `src/app/api/shops/route.ts` - Use `doc(slug).set()` instead of `add()`
- [x] `src/app/api/products/route.ts` - Use `doc(slug).set()`
- [x] `src/app/api/categories/route.ts` - Use `doc(slug).set()`
- [x] `src/app/api/auctions/route.ts` - Use `doc(slug).set()`
- [x] `src/app/api/blog/route.ts` - Use `doc(slug).set()`

### ✅ Phase 2: Update Get By Slug APIs (COMPLETED)

- [x] `src/app/api/shops/[slug]/route.ts` - Direct doc fetch with query fallback
- [x] `src/app/api/products/[slug]/route.ts` - Direct doc fetch with query fallback
- [x] `src/app/api/categories/[slug]/route.ts` - Direct doc fetch with query fallback
- [x] `src/app/api/auctions/[id]/route.ts` - Direct doc fetch with query fallback
- [x] `src/app/api/blog/[slug]/route.ts` - Direct doc fetch with query fallback

### Phase 3: Update Services (Optional)

- [ ] `getBySlug()` can use direct document fetch
- [ ] Remove `getById()` - use `getBySlug()` everywhere
- [ ] Update all callers to use slug consistently

### Phase 4: Fix Existing Data (Migration - As Needed)

- [ ] Create migration script to copy existing docs to slug-based IDs
- [ ] Update foreign key references (shopId → shopSlug)

---

## Implementation Pattern

### Creating New Documents

```typescript
// Before (auto-generated ID)
const docRef = await collection.add(data);

// After (slug as ID)
const existingDoc = await collection.doc(slug).get();
if (existingDoc.exists) {
  return error("Slug already exists");
}
await collection.doc(slug).set({ ...data, slug });
return { id: slug, ...data };
```

### Fetching by Slug

````typescript
// Direct doc access first, fallback for backward compatibility
let doc = await collection.doc(slug).get();
if (!doc.exists) {
  const snapshot = await collection.where("slug", "==", slug).limit(1).get();
  if (snapshot.empty) {
    return notFound();
  }
  doc = snapshot.docs[0];
}
const data = doc.data();

```typescript
// Use getById instead of getBySlug for shop
if (auction.shopId) {
  const shopData = await shopsService.getById(auction.shopId);
  setShop(shopData);
}
````

### 4. `src/constants/api-routes.ts`

Verify these routes exist:

```typescript
SHOP_ROUTES = {
  LIST: "/shops",
  BY_SLUG: (slug: string) => `/shops/slug/${slug}`,
  BY_ID: (id: string) => `/shops/${id}`,
};
```

---

## Testing After Fix

```bash
# Test each route
curl http://localhost:3000/api/shops/slug/test-shop
curl http://localhost:3000/api/shops/abc123-id
curl http://localhost:3000/api/auctions/slug/test-auction
curl http://localhost:3000/api/categories/slug/test-category
```

Verify pages load without "not found" errors:

- `/shops/test-shop`
- `/auctions/test-auction`
- `/categories/test-category`
