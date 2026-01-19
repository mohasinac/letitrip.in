# Quick Implementation Guide

## 🎯 Start Here

This guide helps you execute the [APP-RECONSTRUCTION-PLAN.md](./APP-RECONSTRUCTION-PLAN.md) step-by-step.

---

## 📋 Pre-Implementation Checklist

- [ ] Read [APP-RECONSTRUCTION-PLAN.md](./APP-RECONSTRUCTION-PLAN.md) completely
- [ ] Understand existing [src/index.md](./src/index.md) documentation
- [ ] Review [react-library/docs/index.md](./react-library/docs/index.md)
- [ ] Backup current codebase (if needed)
- [ ] Ensure all dependencies are installed: `npm install`
- [ ] Ensure library is built: `npm run lib:build`

---

## 🚀 Phase 1: Foundation (START HERE)

### Step 1.1: Clean Architecture Setup

```bash
# Create directory structure
npm run create:directories
```

Or manually:

```bash
# Windows PowerShell
New-Item -Path "src/components/layout/Header" -ItemType Directory -Force
New-Item -Path "src/components/layout/Footer" -ItemType Directory -Force
New-Item -Path "src/components/layout/Sidebar" -ItemType Directory -Force
New-Item -Path "src/components/wizards" -ItemType Directory -Force
New-Item -Path "src/components/tables" -ItemType Directory -Force
New-Item -Path "src/components/search" -ItemType Directory -Force
New-Item -Path "src/components/forms" -ItemType Directory -Force
New-Item -Path "src/components/dashboard" -ItemType Directory -Force
New-Item -Path "src/components/shared" -ItemType Directory -Force
```

### Step 1.2: Create Root Layout

**Priority: HIGH - Do this first!**

Files to create:

1. `src/app/layout.tsx` - Root layout with providers
2. `src/app/providers.tsx` - All context providers
3. `src/lib/react-query.ts` - React Query configuration

### Step 1.3: Create Base Layout Components

Files to create:

1. `src/components/layout/Header/Header.tsx`
2. `src/components/layout/Footer/Footer.tsx`
3. `src/components/layout/TabNavigation.tsx`

### Step 1.4: Global Search

Files to create:

1. `src/components/search/GlobalSearchBar.tsx`
2. `src/components/search/SearchResults.tsx`
3. `src/components/search/SearchResultItem.tsx`
4. `src/contexts/GlobalSearchContext.tsx`

### Step 1.5: Type Check

```bash
npm run type-check
```

Fix any errors before proceeding.

---

## 📝 Implementation Order

Follow this exact order to avoid dependency issues:

### 1. Core Infrastructure

- [ ] Root layout (`src/app/layout.tsx`)
- [ ] Providers (`src/app/providers.tsx`)
- [ ] React Query config (`src/lib/react-query.ts`)

### 2. Layout Components

- [ ] Header with global search
- [ ] Footer
- [ ] TabNavigation component

### 3. Shared Components

- [ ] LoadingSpinner
- [ ] ErrorMessage
- [ ] EmptyState
- [ ] Skeletons

### 4. Public Pages (Test as you build)

- [ ] Homepage
- [ ] Product listing
- [ ] Product detail
- [ ] Auction listing
- [ ] Auction detail

### 5. Authentication

- [ ] Login page
- [ ] Register page
- [ ] Password reset

### 6. Wizards (One at a time)

- [ ] Product Wizard
- [ ] Auction Wizard
- [ ] Shop Wizard
- [ ] Address Wizard

### 7. Tables with Inline Edit

- [ ] ProductsTable
- [ ] UsersTable
- [ ] OrdersTable

### 8. User Dashboard

- [ ] Dashboard overview
- [ ] Profile with tabs
- [ ] Orders with tabs
- [ ] Messages
- [ ] Wishlist

### 9. Admin Panel

- [ ] Admin dashboard
- [ ] Analytics with tabs
- [ ] Users management
- [ ] Products management
- [ ] Settings with tabs

### 10. Seller Dashboard

- [ ] Seller dashboard
- [ ] Product management
- [ ] Order management

---

## 🔍 Quick Commands

### Development

```bash
# Start dev server
npm run dev

# Type check only
npm run type-check

# Build locally
npm run build

# Analyze bundle
ANALYZE=true npm run build
```

### Testing Load

```bash
# Start production build locally
npm run build
npm run start

# Test with multiple browsers/tabs to simulate users
```

### Deployment

```bash
# Deploy to Vercel production
npm run deploy:prod

# Or using Vercel CLI
vercel --prod
```

---

## 📦 Key Import Patterns

### Use Library Components

```typescript
// ✅ CORRECT - Use library components
import {
  Button,
  Card,
  FormInput,
  DataTable,
  WizardForm,
  WizardStep,
  useDebounce,
  useQuery,
  formatCurrency,
  cn,
} from "@letitrip/react-library";
```

### Use App-Specific Code

```typescript
// ✅ CORRECT - Use app services
import { productsService } from "@/services/products.service";
import { ROUTES } from "@/constants/routes";
import { useHeaderStats } from "@/hooks/useHeaderStats";
import type { Product } from "@/types";
```

### Avoid Creating Duplicates

```typescript
// ❌ WRONG - Don't create these
import { cn } from "@/lib/utils"; // Use library version
import { useDialogState } from "@/hooks/useDialogState"; // Use library version

// ✅ CORRECT
import { cn, useDialogState } from "@letitrip/react-library";
```

---

## 🎯 Focus Areas

### 1. Wizard Forms

**Every create/edit form should be a wizard with:**

- Step 1: Only required fields (quick completion)
- Step 2+: Optional/additional fields
- Final step: Review & submit

**Example**:

```typescript
<WizardForm>
  <WizardStep id="basic" title="Basic Info">
    {/* Only required fields */}
  </WizardStep>
  <WizardStep id="details" title="Details" optional>
    {/* Optional fields */}
  </WizardStep>
  <WizardStep id="review" title="Review" isReview>
    {/* Summary */}
  </WizardStep>
</WizardForm>
```

### 2. Inline Editing

**Every data table should support:**

- Inline row editing (double-click or edit button)
- Quick add row at top
- Bulk operations

**Example**:

```typescript
<DataTable
  data={products}
  columns={columns}
  editingRowId={editingId}
  onRowEdit={setEditingId}
  onRowSave={handleSave}
/>
```

### 3. Tab Navigation

**All sub-sections should use tabs as routes:**

```typescript
// Tabs are actual routes
/admin/settings          // Home tab
/admin/settings/tax      // Tax tab
/admin/settings/shipping // Shipping tab

// Use TabNavigation component
<TabNavigation tabs={[
  { label: 'Home', href: '/admin/settings' },
  { label: 'Tax', href: '/admin/settings/tax' },
]} />
```

### 4. Global Search

**Search should cover:**

- Products
- Auctions
- Shops
- Categories
- Orders (admin)
- Users (admin)
- Settings (admin)
- Pages
- Help articles

**With type filtering**:

```typescript
<GlobalSearchBar
  types={["all", "products", "auctions", "shops"]}
  onSearch={handleSearch}
/>
```

---

## ⚡ Performance Checklist

During implementation, ensure:

- [ ] Dynamic imports for heavy components
- [ ] Image optimization with Next.js Image
- [ ] Proper React Query caching
- [ ] Code splitting per route
- [ ] Lazy loading for below-fold content
- [ ] Debounced search inputs
- [ ] Pagination on all lists
- [ ] Proper loading states
- [ ] Error boundaries

---

## 🚨 Common Mistakes to Avoid

1. **Creating duplicate components**

   - Always check `@letitrip/react-library` first
   - Only create app-specific components

2. **Skipping type checking**

   - Run `npm run type-check` frequently
   - Fix type errors immediately

3. **Not using wizards**

   - All create/edit forms should be wizards
   - Step 1 must have only required fields

4. **Forgetting inline editing**

   - Tables should support inline row edit
   - Add quick-add functionality

5. **Hardcoding routes**

   - Use `ROUTES` constant from `@/constants/routes`
   - Never hardcode URLs

6. **Missing loading states**

   - Every async operation needs a loading state
   - Use skeletons from library

7. **Ignoring errors**

   - Use ErrorBoundary from library
   - Log errors properly

8. **Not testing type filtering in search**
   - Test search with each entity type
   - Ensure permissions work

---

## 📊 Progress Tracking

Use this to track your progress:

### Week 1: Foundation

- [ ] Core infrastructure complete
- [ ] Layout components complete
- [ ] Global search complete
- [ ] Type checks pass

### Week 2: Public Pages

- [ ] Homepage complete
- [ ] Product pages complete
- [ ] Auction pages complete
- [ ] Shop pages complete

### Week 3: Authentication

- [ ] Auth pages complete
- [ ] Auth flow working
- [ ] Protected routes working

### Week 4: User Dashboard

- [ ] Dashboard complete
- [ ] Profile with tabs complete
- [ ] Orders with tabs complete
- [ ] Other user pages complete

### Week 5: Wizards

- [ ] Product wizard complete
- [ ] Auction wizard complete
- [ ] Shop wizard complete
- [ ] Address wizard complete

### Week 6-7: Admin Panel

- [ ] Admin dashboard complete
- [ ] Analytics with tabs complete
- [ ] User management with inline edit complete
- [ ] Product management with inline edit complete
- [ ] Settings with tabs complete

### Week 8: Seller Dashboard

- [ ] Seller dashboard complete
- [ ] Product management complete
- [ ] Order management complete

### Week 9: API Enhancement

- [ ] Search API enhanced
- [ ] All APIs optimized
- [ ] Rate limiting configured

### Week 10: Testing

- [ ] Type checks pass
- [ ] Load testing complete (10/100/1000 users)
- [ ] Bundle optimized

### Week 11: Deployment

- [ ] Deployed to Vercel
- [ ] Production testing complete
- [ ] Monitoring configured

---

## 🆘 Help & Resources

### Documentation

- [APP-RECONSTRUCTION-PLAN.md](./APP-RECONSTRUCTION-PLAN.md) - Full plan
- [src/index.md](./src/index.md) - Current app structure
- [react-library/docs/index.md](./react-library/docs/index.md) - Library docs

### Commands

```bash
# Get help
npm run --help

# Check library components
cd react-library && npm run storybook

# View type errors
npm run type-check 2>&1 | less
```

---

## ✅ Ready to Start?

1. ✅ Read this guide
2. ✅ Read [APP-RECONSTRUCTION-PLAN.md](./APP-RECONSTRUCTION-PLAN.md)
3. ✅ Ensure dependencies installed
4. ✅ Ensure library built
5. 🚀 **START WITH PHASE 1: Foundation**

**First file to create**: `src/app/layout.tsx`

---

**Good luck! 🚀**
