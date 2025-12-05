# Unused Code Cleanup Summary

## Overview

Systematic removal of unused components, backward compatibility code, and dead code from the codebase.

## Files Removed

### Constants (2 files, ~1017 lines)

- `src/constants/inline-fields.ts` (833 lines)
  - Reason: Not imported anywhere
  - Contained: Validation functions and inline form field configurations
- `src/constants/page-texts.ts` (184 lines)
  - Reason: Not imported anywhere
  - Contained: Page-specific text constants

### Hooks (2 files)

- `src/hooks/useFormWithDraft.ts`
  - Reason: Not imported anywhere
  - Purpose: Form draft management
- `src/hooks/useSortableList.ts`
  - Reason: Not imported anywhere
  - Purpose: Sortable list functionality

## Backward Compatibility Analysis

### Kept (Still in Use)

The following backward compatibility code is **actively used** and cannot be removed:

#### Transform File Aliases (6 files)

1. **category.transforms.ts**

   - `parentId`: Used in `InlineCategorySelectorWithCreate.tsx`
   - `featured`, `isActive`, `sortOrder`: Used in various category components

2. **shop.transforms.ts**

   - `productCount`: Used in 5 files (ProductFilters, ShopHeader, ShopStats, ShopCard, transforms)
   - `follower_count`: Used in 4 files (ShopStats, follow route, admin edit page)
   - `featured`, `isBanned`: Used in shop management

3. **product.transforms.ts**

   - `costPrice`: Used in admin products edit page (2 occurrences)
   - `originalPrice`: Used in 5+ files (ShopProducts, ProductTable)

4. **order.transforms.ts**

   - Various backward compatibility aliases for order management

5. **review.transforms.ts**

   - Backward compatibility for review data structure

6. **auction.transforms.ts**
   - Backward compatibility for auction data structure

**Total Usage**: 15+ files actively use these aliases

### Already Removed (E036 Epic)

The following deprecated components were already removed in a previous refactoring:

- `Input` component
- `Select` component
- `MobileFormInput` component
- `MobileFormSelect` component
- `MobileTextarea` component

## Component Analysis

### All Components Verified as Used

Checked all 25 component directories:

- ✅ `admin/` - Used in admin pages
- ✅ `auction/` - Used in auction pages
- ✅ `auth/` - Used in authentication flows
- ✅ `cards/` - Used throughout application
- ✅ `cart/` - Used in cart functionality
- ✅ `category/` - Used in category pages
- ✅ `checkout/` - Used in checkout flow
- ✅ `common/` - Shared components
- ✅ `events/` - Used in events system
- ✅ `faq/` - Used in FAQ page and homepage (2 pages)
- ✅ `filters/` - Used in product/auction filtering
- ✅ `forms/` - Used in form handling
- ✅ `homepage/` - Used in homepage
- ✅ `layout/` - Used in layout components (Footer uses footer.ts constants)
- ✅ `legal/` - Used in 4 legal pages (terms, privacy, refund, shipping)
- ✅ `media/` - Used in media handling
- ✅ `mobile/` - Used in mobile views
- ✅ `navigation/` - Used in navigation (SearchBar uses searchable-routes.ts)
- ✅ `product/` - Used in product pages
- ✅ `products/` - Used in products listing
- ✅ `seller/` - Used in seller pages
- ✅ `shop/` - Used in shop pages
- ✅ `ui/` - Shared UI components
- ✅ `user/` - Used in user pages
- ✅ `wizards/` - Used in wizard flows

**Result**: No unused components found

## Search Patterns Used

### Backward Compatibility Detection

```regex
(backward compatibility|backwards compatibility|legacy|deprecated|TODO: remove|FIXME: remove|@deprecated)
```

- Found: 50 matches
- Action: Verified each instance - all are documentation or actively used code

### Component Import Verification

- Checked each component directory for imports
- Verified usage in pages and other components
- Confirmed all components are actively used

### Constants Verification

Checked all 23 constant files:

- `api-routes.ts` ✅ Used
- `bulk-actions.ts` ✅ Used (4+ admin pages)
- `categories.ts` ✅ Used
- `colors.ts` ✅ Used
- `comparison.ts` ✅ Used (3 files)
- `database.ts` ✅ Used
- `faq.ts` ✅ Used
- `filters.ts` ✅ Used
- `footer.ts` ✅ Used (Footer component)
- `form-fields.ts` ✅ Used (4+ admin pages)
- ~~`inline-fields.ts`~~ ❌ **REMOVED** - Not imported
- `limits.ts` ✅ Used
- `location.ts` ✅ Used
- `media.ts` ✅ Used
- `navigation.ts` ✅ Used
- ~~`page-texts.ts`~~ ❌ **REMOVED** - Not imported
- `routes.ts` ✅ Used
- `searchable-routes.ts` ✅ Used (SearchBar)
- `site.ts` ✅ Used
- `statuses.ts` ✅ Used
- `storage.ts` ✅ Used
- `tabs.ts` ✅ Used (4+ layout pages)
- `validation-messages.ts` ✅ Used

### Hooks Verification

Checked all 29 hook files:

- All test files ✅ Valid
- All implementation files except 2 ✅ Used
- ~~`useFormWithDraft.ts`~~ ❌ **REMOVED** - Not imported
- ~~`useSortableList.ts`~~ ❌ **REMOVED** - Not imported

### Types Verification

Checked all type directories and files:

- `api/` ✅ Used
- `backend/` ✅ Used
- `entities/` ✅ Used
- `frontend/` ✅ Used
- `homepage.ts` ✅ Used
- `inline-edit.ts` ✅ Used (5+ files)
- `media.ts` ✅ Used
- `shared/` ✅ All files used
- `transforms/` ✅ Used
- `ui/` ✅ Used

**Result**: No unused types found

## Total Cleanup

### Files Deleted

- 4 files removed
- ~1017+ lines of code removed

### Previous Cleanups (Related Commits)

1. **d3f9a673**: Removed 27 index.ts re-export files (211 files updated)
2. **4f99f4cc**: Eliminated 13 duplicate functions (106 lines)
3. **abbee5e8**: Removed backward compatibility re-exports (11 files migrated)
4. **aa8bc0ae**: Updated IMPORTS-INVENTORY.md
5. **59366ffa**: Deleted 7 unused utility files (~2095 lines)

### Grand Total Cleanup

- **38 files deleted**
- **~3200+ lines removed**
- **222 files updated**

## Conclusion

The codebase has been thoroughly cleaned:

- ✅ All re-export index files removed
- ✅ All duplicate functions eliminated
- ✅ All unused utility files deleted
- ✅ All unused constants removed
- ✅ All unused hooks removed
- ✅ All components verified as used
- ✅ Backward compatibility code verified as necessary (cannot remove)

The remaining code is actively used in production. Further cleanup would require:

1. Refactoring transform files to remove backward compatibility aliases (breaking change)
2. Migrating 15+ files to use new property names
3. Updating database schema to use new naming conventions
