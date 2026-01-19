# Code Cleanup Report

## Summary

Analysis of `/src` directory to identify and remove unused or duplicate code that can be replaced by `@letitrip/react-library`.

---

## ✅ Files That Can Be Safely Deleted

### Hooks (5 files)

#### 1. `/src/hooks/useDialogState.ts` ❌ DELETE

- **Reason**: Exact duplicate of library version
- **Replacement**: `import { useDialogState } from "@letitrip/react-library"`
- **Usage**: ✅ Not used in codebase (0 imports found)

#### 2. `/src/hooks/usePasswordFieldState.ts` ❌ DELETE

- **Reason**: Exact duplicate of library version
- **Replacement**: `import { usePasswordFieldState } from "@letitrip/react-library"`
- **Usage**: ⚠️ Used in `LoginRegisterContext.tsx` - needs migration

#### 3. `/src/hooks/useSafeLoad.ts` ❌ DELETE

- **Reason**: Exact duplicate of library version
- **Replacement**: `import { useSafeLoad } from "@letitrip/react-library"`
- **Usage**: ✅ Not used in codebase (0 imports found)

#### 4. `/src/hooks/useVirtualList.ts` ❌ DELETE

- **Reason**: Exact duplicate of library version
- **Replacement**: `import { useVirtualList } from "@letitrip/react-library"`
- **Usage**: ✅ Not used in codebase (0 imports found)

#### 5. `/src/hooks/useConversationState.ts` ❌ DELETE

- **Reason**: Exact duplicate of library version
- **Replacement**: `import { useConversationState } from "@letitrip/react-library"`
- **Usage**: ⚠️ Used in `src/app/(protected)/user/messages/page.tsx` - needs migration

### Utilities (1 file)

#### 6. `/src/lib/utils.ts` ❌ DELETE

- **Reason**: Only contains `cn()` function which is in library
- **Replacement**: `import { cn } from "@letitrip/react-library"`
- **Usage**: ✅ Not used in codebase (already migrated)

---

## 🔄 Files That Need Migration Before Deletion

### 1. LoginRegisterContext.tsx

**File**: `src/contexts/LoginRegisterContext.tsx`

**Current**:

```typescript
import {
  usePasswordFieldState,
  UsePasswordFieldStateReturn,
} from "@/hooks/usePasswordFieldState";
```

**Change to**:

```typescript
import {
  usePasswordFieldState,
  type UsePasswordFieldStateReturn,
} from "@letitrip/react-library";
```

### 2. User Messages Page

**File**: `src/app/(protected)/user/messages/page.tsx`

**Current**:

```typescript
import { useConversationState } from "@/hooks/useConversationState";
```

**Change to**:

```typescript
import { useConversationState } from "@letitrip/react-library";
```

---

## 🟡 Files to Keep (With Notes)

### Wrapper Hooks (Keep - Needed for Context Injection)

#### `useAuthActions.ts` ✅ KEEP

- Wraps library hook to inject `AuthActionsContext`
- Small, maintainable wrapper
- **Purpose**: App-specific context binding

#### `useAuthState.ts` ✅ KEEP

- Wraps library hook to inject `AuthStateContext`
- Small, maintainable wrapper
- **Purpose**: App-specific context binding

### App-Specific Hooks (Keep - Business Logic)

#### `useHeaderStats.ts` ✅ KEEP

- Fetches header statistics (cart count, notifications, etc.)
- Uses polling for real-time updates
- **Purpose**: App-specific business logic

#### `useNavigationGuard.ts` ✅ KEEP (Review)

- Next.js-specific implementation
- Library has generic version
- **Recommendation**: Consider migrating to library version as base

#### `useFetchResourceList.ts` ✅ KEEP (Review)

- App-specific resource fetching
- Library has `useResourceList`
- **Recommendation**: Compare and potentially migrate

#### `useUrlPagination.ts` ✅ KEEP (Review)

- Next.js-specific with `useSearchParams`, `usePathname`
- Library version is framework-agnostic
- **Recommendation**: Keep app version, it's adapted for Next.js

### Query Hooks (Keep - All App-Specific)

All files in `/src/hooks/queries/`:

- `useCart.ts`
- `useCategory.ts`
- `useOrder.ts`
- `useProduct.ts`
- `useShop.ts`
- `useUser.ts`

**Reason**: Domain-specific React Query hooks

---

## 📋 Cleanup Checklist

- [ ] **Step 1**: Update `LoginRegisterContext.tsx` import
- [ ] **Step 2**: Update `user/messages/page.tsx` import
- [ ] **Step 3**: Delete `useDialogState.ts`
- [ ] **Step 4**: Delete `usePasswordFieldState.ts`
- [ ] **Step 5**: Delete `useSafeLoad.ts`
- [ ] **Step 6**: Delete `useVirtualList.ts`
- [ ] **Step 7**: Delete `useConversationState.ts`
- [ ] **Step 8**: Delete `lib/utils.ts`
- [ ] **Step 9**: Run TypeScript check: `npm run type-check`
- [ ] **Step 10**: Run build: `npm run build`
- [ ] **Step 11**: Test affected pages

---

## 🎯 Expected Results

### Files Deleted

- 5 hook files
- 1 utility file
- **Total**: 6 files

### Lines of Code Reduced

- Approximate reduction: ~800 lines
- Reduced maintenance burden
- Single source of truth (library)

### Imports Updated

- 2 files updated to use library imports

---

## 🚀 Execution Plan

### Phase 1: Migrate Imports (5 minutes)

1. Update `LoginRegisterContext.tsx`
2. Update `user/messages/page.tsx`
3. Commit: "refactor: migrate hooks to library imports"

### Phase 2: Delete Files (2 minutes)

1. Delete 6 files listed above
2. Commit: "chore: remove duplicate hooks/utils available in library"

### Phase 3: Verify (10 minutes)

1. Run `npm run type-check`
2. Run `npm run build`
3. Test messages page
4. Test login/register functionality

---

## ⚠️ Risks & Mitigation

| Risk                           | Likelihood | Impact | Mitigation                           |
| ------------------------------ | ---------- | ------ | ------------------------------------ |
| Breaking change in library API | Low        | High   | Library is stable, well-tested       |
| Missing imports after deletion | Low        | Medium | TypeScript will catch at build time  |
| Runtime errors                 | Low        | Medium | Test affected pages before deploying |

---

## 📊 Metrics

### Before Cleanup

- Duplicate hooks: 5
- Duplicate utilities: 1
- Total duplicates: 6
- Maintenance overhead: High

### After Cleanup

- Duplicate hooks: 0
- Duplicate utilities: 0
- Total duplicates: 0
- Maintenance overhead: Low

---

## 🔗 References

- Main documentation: `/src/index.md`
- Library documentation: `/react-library/docs/index.md`
- Migration guide: `/MIGRATION-QUICK-REFERENCE.md`

---

**Created**: January 19, 2026  
**Status**: Ready for execution  
**Estimated Time**: 20 minutes
