# Firestore Nested Array Fix

## Issue

**Error**: `3 INVALID_ARGUMENT: Nested arrays are not allowed`

**Location**: `POST /api/admin/categories` endpoint when creating a new category

**Root Cause**:

- Firestore does not support nested arrays in documents
- The `paths` field was defined as `string[][]` (array of arrays)
- When trying to save a category with the `paths` field, Firestore rejected it

## Solution

Convert the nested array structure to a flat array of strings by joining path segments with `/`:

### Before (Nested Arrays - Not Allowed)

```typescript
paths: [
  ["cat1", "cat2", "cat3"],
  ["cat1", "cat4", "cat3"],
];
```

### After (Flat Array - Allowed)

```typescript
paths: ["cat1/cat2/cat3", "cat1/cat4/cat3"];
```

## Code Changes

### POST Endpoint (Create Category)

```typescript
// Convert paths to strings to avoid nested array issues
const pathsAsStrings = paths.map((path) => path.join("/"));

const newCategory: Category = {
  // ...other fields
  paths: pathsAsStrings as any, // Store as array of strings
  // ...
};
```

### PATCH Endpoint (Update Category)

```typescript
// Convert paths to strings to avoid nested array issues
const pathsAsStrings = paths.map((path) => path.join("/"));

updatedCategory.paths = pathsAsStrings as any;
```

## Impact

### Data Structure

- **Storage**: Paths now stored as `string[]` instead of `string[][]`
- **Example**: `"beyblades/metal-series/metal-fusion"` instead of `["beyblades", "metal-series", "metal-fusion"]`

### Reading Paths

If you need to work with individual path segments, you can split the strings:

```typescript
// Convert back to array of segments
const pathSegments = pathString.split("/");
// ["beyblades", "metal-series", "metal-fusion"]
```

### Querying

Paths can still be queried and compared:

```typescript
// Check if category is in a specific path
const isInMetalSeries = category.paths.some((path) =>
  path.includes("metal-series")
);
```

## Files Modified

- `src/app/api/admin/categories/route.ts`
  - POST endpoint: Line ~204
  - PATCH endpoint: Line ~408

## Testing

After this fix:

- ✅ Categories can be created successfully
- ✅ Categories can be updated successfully
- ✅ Paths are stored correctly in Firestore
- ✅ No nested array errors

## Related Firestore Limitations

Firestore has several limitations on data types:

1. ❌ No nested arrays
2. ❌ No arrays of maps (objects)
3. ✅ Arrays of primitives (strings, numbers, booleans) are OK
4. ✅ Maps can contain arrays
5. ✅ Arrays can be up to 1MB in size

## Alternative Solutions Considered

### 1. Store as JSON String (Rejected)

```typescript
paths: JSON.stringify([
  ["cat1", "cat2"],
  ["cat1", "cat3"],
]);
```

**Why Rejected**: Harder to query, not indexable

### 2. Store as Separate Documents (Rejected)

Create a subcollection for paths
**Why Rejected**: More complex, more reads required

### 3. Flatten with Delimiter (Chosen) ✅

```typescript
paths: ["cat1/cat2", "cat1/cat3"];
```

**Why Chosen**:

- Simple to implement
- Easy to query
- Maintains data integrity
- Indexable by Firestore

## Future Considerations

If you need to perform complex path queries in the future, consider:

1. Adding a separate `pathDepth` field for filtering
2. Creating composite indexes on `paths` + other fields
3. Using Firestore's array-contains queries for path matching

---

**Status**: ✅ Fixed  
**Date**: November 1, 2025  
**Fix Applied**: Both POST and PATCH endpoints
