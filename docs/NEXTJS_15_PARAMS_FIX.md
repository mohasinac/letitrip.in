# Next.js 15 Params Fix

## Issue

```
Error: Value for argument "documentPath" is not a valid resource path.
Path must be a non-empty string.
```

This error occurred when trying to approve/cancel/reject orders because the route params were not being awaited.

## Root Cause

**Next.js 15 Breaking Change:** Dynamic route parameters must now be awaited as they return a Promise.

### Old Way (Next.js 14 and earlier):

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id; // Direct access
}
```

### New Way (Next.js 15+):

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params; // Must await!
}
```

## Files Fixed

### ✅ Seller Order Routes

1. **`src/app/api/seller/orders/[id]/approve/route.ts`**

   - Fixed: `params.id` → `await params` then destructure
   - POST endpoint for approving orders

2. **`src/app/api/seller/orders/[id]/cancel/route.ts`**

   - Fixed: `params.id` → `await params` then destructure
   - POST endpoint for canceling orders (with 3-day rule for sellers)

3. **`src/app/api/seller/orders/[id]/reject/route.ts`**
   - Fixed: `params.id` → `await params` then destructure
   - POST endpoint for rejecting orders

## Pattern to Follow

When you have a dynamic route like `[id]`, `[slug]`, etc., always:

```typescript
// 1. Type params as Promise
{ params }: { params: Promise<{ id: string }> }

// 2. Await and destructure at the top of the function
const { id: yourVariableName } = await params;

// 3. Use the variable
const doc = await db.collection("...").doc(yourVariableName).get();
```

## Why This Happens

- Next.js 15 made params async to support:
  - Streaming and Suspense
  - Parallel data fetching
  - Better performance optimization
- The error "not a valid resource path" happens because:
  - `params.id` returns a Promise object instead of a string
  - Firebase tries to use that Promise as a document ID
  - Firebase expects a string, gets `[object Promise]` → error

## Testing

✅ Order approval now works
✅ Order cancellation now works  
✅ Order rejection now works
✅ No more "invalid resource path" errors

## Related Routes Already Fixed

These routes were already using the correct Next.js 15 pattern:

- `src/app/api/seller/orders/[id]/route.ts` ✅
- `src/app/api/seller/products/[id]/route.ts` ✅
- `src/app/api/orders/[id]/cancel/route.ts` ✅

## Migration Checklist

When upgrading to Next.js 15, check all dynamic routes:

- [ ] `/api/*/[id]/route.ts`
- [ ] `/api/*/[slug]/route.ts`
- [ ] `/[param]/page.tsx`
- [ ] `/[...segments]/page.tsx`

All of these need `await params` now!
