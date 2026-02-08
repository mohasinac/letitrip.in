# TypeScript Errors Fix Plan

## Status: 127 Errors Remaining (was 128)

### ✅ Completed (1 error fixed)

1. Added `prepareForFirestore` imports to 9 repository files

### Priority 1: Schema Property Issues (40+ errors)

These errors indicate API routes are using fields that don't exist in schema interfaces.

**FAQs Schema - Missing Properties:**

- `viewCount` (should be in `stats.views`)
- `helpfulCount` (should be in `stats.helpful`)
- `notHelpfulVotes` (needs to be added)
- `helpfulVotes` (needs to be added)
- `featured` (missing from schema)
- `order` (missing from schema)

**Products Schema - Missing Properties:**

- `views` (should be in `stats.views` or add top-level)
- `availableQuantity` (missing)

**Reviews Schema - Missing Properties:**

- `helpfulCount` (exists, but `notHelpfulCount` missing)
- `helpfulVotes` (needs to be added)
- `notHelpfulVotes` (needs to be added)
- `reportCount` (missing)

**Orders Schema - Missing Properties:**

- `orderDate` (missing from schema)

**Categories Schema - Missing Properties:**

- `metrics` (missing from create data)

**Coupons Schema - Missing Properties:**

- `stats` (needs default value)

**Site Settings Schema - Wrong Property Names:**

- API uses `businessInfo` but schema has different structure
- API uses `contactInfo` but schema has different structure

**Solution:** Either:
A) Update schemas to match API usage (add missing fields)
B) Update API code to match schemas (remove fields or use correct paths)

### Priority 2: FieldValue Import Issues (17 errors)

Files using `db.FieldValue` or `this.db.FieldValue` without proper import:

**Files:**

- `category-metrics.ts` (10 occurrences)
- `categories.repository.ts` (4 occurrences)
- `coupons.repository.ts` (2 occurrences)
- `faqs.repository.ts` (1 occurrence)

**Fix:** Import and use `FieldValue` from firebase-admin/firestore

### Priority 3: Repository Method Name Issues (4 errors)

**site-settings.repository:**

- API calls `getSettings()` but method is `getSingleton()`
- API calls `updateSettings()` but method is `updateSingleton()`

**homepage-sections.repository:**

- API calls `findEnabled()` but method doesn't exist (should be `findAll()` with filter)

### Priority 4: Type Mismatches (10+ errors)

**Issues:**

- Validation schemas return strings but schemas expect enums
- `z.record(z.unknown())` needs 2 parameters
- `error.errors` doesn't exist (Zod v5 issue)
- Date strings not converted to Date objects

### Priority 5: Protected Method Access (1 error)

`productRepository.getCollection()` is protected, can't access from API route

### Priority 6: Test Files (4 errors)

`StorageManager.getAll()` method doesn't exist in tests

## Recommended Fix Order

1. **Fix Schema Properties** - Add missing fields or update API code (will fix 40+ errors)
2. **Fix FieldValue Usage** - Add imports and change usage pattern (will fix 17 errors)
3. **Fix Repository Method Names** - Rename or add missing methods (will fix 4 errors)
4. **Fix Type Mismatches** - Cast types or update schemas (will fix 10+ errors)
5. **Fix Protected Access** - Use public method or make query in API (will fix 1 error)
6. **Fix Test Files** - Skip for now or update tests (4 errors)

## Fastest Path to 0 Errors

**Option A: Update Schemas (Recommended)**

- Add missing properties to schema interfaces
- Provides defaults for new fields
- Maintains backward compatibility

**Option B: Update API Code**

- Remove usage of non-existent properties
- Use correct property paths
- May break existing functionality

**Decision Needed:** Which approach should we take for schema mismatches?
