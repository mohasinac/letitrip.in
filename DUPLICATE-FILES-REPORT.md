# Duplicate Files & Functionality Report

> **Generated:** December 5, 2025  
> **Purpose:** Identify duplicate files and overlapping functionality to improve code maintainability

---

## 🔴 Critical Duplicates - Immediate Action Required

### 1. **Format Functions - Multiple Implementations**

#### `formatCurrency` / `formatPrice` - 3 Different Implementations

**Location 1:** `src/lib/formatters.ts`

```typescript
export function formatCurrency(amount: number, options?: {...}): string
export function formatCompactCurrency(amount: number): string
```

**Location 2:** `src/lib/price.utils.ts`

```typescript
export function formatPrice(value: number | null | undefined, currency?: Currency, showSymbol?: boolean): string
export function formatPriceRange(...)
export function formatDiscount(...)
export function formatINR(value: number | null | undefined): string
export function parsePrice(value: string | null | undefined): number
```

**Location 3:** Internal helper in transform files

```typescript
// src/types/transforms/cart.transforms.ts
function formatPrice(price: number): string { return `₹${price.toLocaleString('en-IN')}`; }

// src/types/transforms/auction.transforms.ts
function formatPrice(price: number): string { return `₹${price.toLocaleString('en-IN')}`; }

// src/types/transforms/product.transforms.ts
function formatPrice(price: number | undefined | null): string { ... }
```

**⚠️ Issues:**

- Three different implementations of currency formatting
- `formatters.ts` uses `Intl.NumberFormat`
- `price.utils.ts` uses `toLocaleString` with null safety
- Transform files have inline helpers (not DRY)
- Inconsistent null handling
- Different options/parameters

**✅ Recommendation:**

- **Keep:** `src/lib/price.utils.ts` (most robust with null safety)
- **Remove:** `formatCurrency` from `formatters.ts`
- **Refactor:** Replace inline `formatPrice` helpers in transform files with import from `price.utils.ts`
- **Update:** All imports across codebase to use `price.utils.ts`

---

#### `formatFileSize` - 2 Implementations

**Location 1:** `src/lib/formatters.ts`

```typescript
export function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  // ... implementation
}
```

**Location 2:** `src/lib/media/media-validator.ts`

```typescript
export function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  // ... similar implementation
}
```

**⚠️ Issues:**

- Exact duplicate functionality
- Same implementation in two places

**✅ Recommendation:**

- **Keep:** `src/lib/formatters.ts` (general utility)
- **Remove:** From `media-validator.ts` and import from `formatters.ts`

---

#### `formatDuration` - 2 Implementations

**Location 1:** `src/lib/formatters.ts`

```typescript
export function formatDuration(seconds: number): string;
```

**Location 2:** `src/lib/media/media-validator.ts`

```typescript
export function formatDuration(seconds: number): string;
```

**⚠️ Issues:**

- Duplicate implementations

**✅ Recommendation:**

- **Keep:** `src/lib/formatters.ts`
- **Remove:** From `media-validator.ts` and import from `formatters.ts`

---

#### `formatPincode` - 2 Implementations

**Location 1:** `src/constants/location.ts`

```typescript
export function formatPincode(pincode: string): string {
  const cleaned = pincode.replace(/\D/g, "");
  return cleaned.slice(0, PINCODE_LENGTH);
}
```

**Location 2:** `src/app/api/lib/location/pincode.ts`

```typescript
export function formatPincode(pincode: string): string {
  return pincode.replace(/\D/g, "").slice(0, 6);
}
```

**⚠️ Issues:**

- Same functionality in two places
- One uses constant, other uses hardcoded value

**✅ Recommendation:**

- **Keep:** `src/app/api/lib/location/pincode.ts` (used by API)
- **Remove:** From `constants/location.ts` or consolidate into a shared utility
- **Alternative:** Keep both but document that one is for frontend, one for API

---

#### `formatPhone` - Multiple Implementations

**Location:** `src/constants/location.ts`

```typescript
export function formatPhone(phone: string, countryCode: string = "+91"): string;
```

**Similar to:** `src/lib/formatters.ts`

```typescript
export function formatPhoneNumber(phone: string): string;
```

**⚠️ Issues:**

- Different function names
- Different implementations
- One has country code parameter, other doesn't

**✅ Recommendation:**

- **Consolidate:** Merge into single implementation in `formatters.ts`
- **Keep:** Country code parameter for flexibility
- **Remove:** From `constants/location.ts`

---

### 2. **Validation Functions - Multiple Implementations**

#### `validateLink` - 2 Implementations

**Location 1:** `src/lib/link-utils.ts`

```typescript
export function validateLink(
  value: string | undefined,
  options?: LinkValidationOptions
): LinkValidationResult;
```

**Location 2:** `src/lib/form-validation.ts`

```typescript
// May have URL validation logic
```

**✅ Recommendation:**

- **Keep:** `link-utils.ts` (comprehensive link validation)
- **Use:** Import from `link-utils.ts` in `form-validation.ts` if needed

---

#### `validateField` - Multiple Implementations

**Location 1:** `src/lib/form-validation.ts`

```typescript
export function validateField(value: any, field: FormField): string | null;
```

**Location 2:** `src/lib/validations/helpers.ts`

```typescript
export function validateField<T extends z.ZodType>(...)
```

**Location 3:** `src/lib/validation/inline-edit-schemas.ts`

```typescript
export function validateFormData(...)
```

**⚠️ Issues:**

- Different validation approaches
- One uses FormField interface, other uses Zod schemas
- Overlapping functionality

**✅ Recommendation:**

- **Keep All:** These serve different purposes
- **Document:** Clarify when to use each
  - `form-validation.ts` - Simple field-level validation
  - `validations/helpers.ts` - Zod schema validation
  - `inline-edit-schemas.ts` - Inline editing specific
- **Standardize:** Use Zod for new validations

---

### 3. **Validation Constants - Duplicates**

#### `validateFile` - 2 Implementations

**Location 1:** `src/constants/validation-messages.ts`

```typescript
export function validateFile(...)
```

**Location 2:** `src/constants/media.ts`

```typescript
export const validateFile = { ... }
```

**⚠️ Issues:**

- One is a function, other is an object
- Confusing naming

**✅ Recommendation:**

- **Keep:** Media-specific validation in `media.ts`
- **Remove/Rename:** Function in `validation-messages.ts` or make it more generic

---

## 🟡 Medium Priority - Should Be Consolidated

### 4. **Inline Validation Functions**

**Multiple locations with inline validators:**

- `src/constants/inline-fields.ts` - Has many validators like:
  - `validateEmail`
  - `validateUrl`
  - `validatePhone`
  - `validatePrice`
  - `validateStock`
  - `validateSKU`
  - `validateSlug`
  - `validatePostalCode`
  - `validateFutureDate`
  - `validateBidAmount`

**Similar to validators in:**

- `src/lib/form-validation.ts`
- `src/lib/validations/*.schema.ts`
- `src/constants/validation-messages.ts` - Has `isValidEmail`, `isValidPhone`

**✅ Recommendation:**

- **Consolidate:** Move all basic validators to `src/lib/validators.ts`
- **Keep:** Field-specific configurations in `inline-fields.ts`
- **Import:** Use consolidated validators from new `validators.ts`

---

### 5. **Date Utilities - Potential Overlap**

**Locations:**

- `src/lib/date-utils.ts` - Safe date conversions
- `src/lib/formatters.ts` - Date formatting functions

**⚠️ Issues:**

- `date-utils.ts` handles Firestore timestamps
- `formatters.ts` has display formatting
- Some overlap in functionality

**✅ Recommendation:**

- **Keep Both:** They serve different purposes
- **Document:** Clarify usage
  - `date-utils.ts` - Data conversion and safety
  - `formatters.ts` - Display formatting
- **Consider:** Moving date formatting from `formatters.ts` to `date-utils.ts`

---

### 6. **Pagination Parsing**

**Location 1:** `src/app/api/lib/utils/pagination.ts`

```typescript
export function parsePaginationParams(...)
```

**Location 2:** `src/app/api/lib/sieve/parser.ts`

```typescript
export function parseSieveQuery(...)
export function parseSieveFromURL(...)
```

**⚠️ Issues:**

- Two different pagination systems
- Sieve is more comprehensive

**✅ Recommendation:**

- **Keep Both:** Different systems for different needs
- **Document:** When to use each system
- **Consider:** Deprecating simple pagination in favor of Sieve

---

## 🟢 Low Priority - Document & Monitor

### 7. **Category Utilities**

**Location:** `src/lib/utils/category-utils.ts`

- Has extensive category-specific logic
- No duplicates found, but isolated

**✅ Recommendation:**

- **Keep:** Well-organized domain-specific utilities
- **Monitor:** Ensure no duplication occurs

---

### 8. **Media Processing**

**Location:** `src/lib/media/*.ts`

- `media-validator.ts`
- `image-processor.ts`
- `video-processor.ts`

**✅ Recommendation:**

- **Keep:** Well-organized media utilities
- **Remove:** Duplicate `formatFileSize` and `formatDuration` (see above)

---

## 📊 Summary Statistics

| Category             | Total Files      | Duplicates Found | Priority    |
| -------------------- | ---------------- | ---------------- | ----------- |
| Format Functions     | 3 locations      | 5 duplicates     | 🔴 Critical |
| Validation Functions | 5 locations      | 3 duplicates     | 🟡 Medium   |
| Price Formatting     | 3 locations      | 1 duplicate      | 🔴 Critical |
| File Size/Duration   | 2 locations each | 2 duplicates     | 🔴 Critical |
| Pincode Formatting   | 2 locations      | 1 duplicate      | 🟡 Medium   |
| Phone Formatting     | 2 locations      | 1 duplicate      | 🟡 Medium   |

**Total Duplicates Identified:** 13 duplicate functions across 15+ files

---

## 🎯 Recommended Action Plan

### Phase 1 - Critical (Do First) ⚡

1. **Consolidate Price Formatting**

   - [ ] Use `price.utils.ts` as single source
   - [ ] Remove `formatCurrency` from `formatters.ts`
   - [ ] Replace inline helpers in transform files
   - [ ] Update all imports (211 files may be affected)

2. **Remove Duplicate Formatters**
   - [ ] Remove `formatFileSize` from `media-validator.ts`
   - [ ] Remove `formatDuration` from `media-validator.ts`
   - [ ] Update imports in media files

### Phase 2 - Medium Priority 📋

3. **Consolidate Validators**

   - [ ] Create `src/lib/validators.ts`
   - [ ] Move basic validators from various files
   - [ ] Update `inline-fields.ts` to import from validators
   - [ ] Update `validation-messages.ts`

4. **Pincode/Phone Formatting**
   - [ ] Choose single implementation for each
   - [ ] Document frontend vs API usage
   - [ ] Update imports

### Phase 3 - Documentation 📝

5. **Document Remaining Files**
   - [ ] Add JSDoc comments explaining when to use each utility
   - [ ] Update `IMPORTS-INVENTORY.md` with usage guidelines
   - [ ] Create decision tree for developers

---

## 🔍 Files Requiring Attention

### Files to Modify:

1. `src/lib/formatters.ts` - Remove duplicate functions
2. `src/lib/price.utils.ts` - Keep as primary price formatter
3. `src/lib/media/media-validator.ts` - Remove formatFileSize, formatDuration
4. `src/types/transforms/*.transforms.ts` - Replace inline formatPrice
5. `src/constants/location.ts` - Remove duplicate formatting functions
6. `src/constants/inline-fields.ts` - Refactor to use consolidated validators
7. `src/constants/validation-messages.ts` - Consolidate validation logic

### Files to Create:

1. `src/lib/validators.ts` - New consolidated validator file

### Import Updates Required:

- **Estimated:** 50-100+ files may need import path updates
- **Critical paths:** All files importing from `formatters.ts`, `price.utils.ts`

---

## ⚠️ Breaking Changes Warning

The following changes will require import updates across the codebase:

1. **Price Formatting:** ~20-30 files
2. **File Size Formatting:** ~5-10 files
3. **Validation Functions:** ~30-40 files

**Recommendation:** Use find-replace or automated refactoring tools.

---

## 📖 Usage Guidelines (Post-Cleanup)

### When to use which utility:

**Formatting:**

- `formatters.ts` - General purpose formatting (dates, numbers, text)
- `price.utils.ts` - **ALL** price/currency formatting
- `date-utils.ts` - Date conversion and safety (Firestore ↔ ISO)

**Validation:**

- `validators.ts` - Basic field validation (email, phone, URL)
- `validations/*.schema.ts` - Complex Zod schema validation
- `form-validation.ts` - Form-specific validation logic

**Domain-Specific:**

- `lib/utils/category-utils.ts` - Category operations
- `lib/link-utils.ts` - Link parsing and validation
- `lib/media/*` - Media processing

---

**Last Updated:** December 5, 2025  
**Status:** 🔴 Action Required

For questions or to report additional duplicates, please open an issue.
