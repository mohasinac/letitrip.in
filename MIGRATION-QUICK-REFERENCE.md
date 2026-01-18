# Quick Migration Reference Guide

## 🚀 Quick Start

1. **Before Starting**: Read this entire file
2. **Check Tracker**: [`MIGRATION-TRACKER.md`](./MIGRATION-TRACKER.md)
3. **Check Action Plan**: [`MIGRATION-ACTION-PLAN.md`](./MIGRATION-ACTION-PLAN.md)
4. **Pick a Task**: Start with Phase 1
5. **Make Changes**: Follow patterns below
6. **Test**: Verify functionality
7. **Commit**: Use proper commit format
8. **Update Tracker**: Mark progress

---

## 📚 Documentation Links

- **Main README**: [README.md](./README.md)
- **Library README**: [react-library/README.md](./react-library/README.md)
- **Migration Tracker**: [MIGRATION-TRACKER.md](./MIGRATION-TRACKER.md)
- **Action Plan**: [MIGRATION-ACTION-PLAN.md](./MIGRATION-ACTION-PLAN.md)
- **Library Docs**: [react-library/docs/](./react-library/docs/)

---

## 🎯 Core Principles

### 1. Library is Pure React ⚛️

```typescript
// ❌ DON'T DO THIS in react-library
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// ✅ DO THIS in react-library
// Use plain React components
// Accept callbacks for navigation
// Use standard HTML <a> and <img> tags
```

### 2. Main App Uses Next.js 🔄

```typescript
// ✅ DO THIS in main app (src/)
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@letitrip/react-library';

// Wrap library components with Next.js features
<Button onClick={() => router.push('/page')}>Click</Button>
<Link href="/page"><Button>Click</Button></Link>
```

### 3. Use Wrappers 🎁

```typescript
// Create wrappers in src/components/wrappers/

// LinkWrapper.tsx
import Link from "next/link";
export function LinkWrapper({ href, children, ...props }) {
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}

// Use in pages
import { ProductCard } from "@letitrip/react-library";
import { LinkWrapper } from "@/components/wrappers/LinkWrapper";

<ProductCard product={product} LinkComponent={LinkWrapper} />;
```

### 4. Service Adapters 🔌

```typescript
// Create adapters in src/lib/adapters/

// ProductServiceAdapter.ts
import { ProductService } from "@letitrip/react-library";
import { fetchProducts } from "@/services/product-service";

export const productServiceAdapter: ProductService = {
  async getProducts(params) {
    return await fetchProducts(params);
  },
  // ... other methods
};

// Use in components
import { ProductList } from "@letitrip/react-library";
import { productServiceAdapter } from "@/lib/adapters/ProductServiceAdapter";

<ProductList service={productServiceAdapter} />;
```

---

## 🔄 Migration Patterns

### Pattern 1: Simple Component Replacement

**Before**:

```typescript
// src/components/Button.tsx
export function Button({ children, onClick, variant = "primary" }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

**After**:

```typescript
// Delete src/components/Button.tsx

// In pages/components
import { Button } from "@letitrip/react-library";

<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>;
```

### Pattern 2: Component with Next.js Link

**Before**:

```typescript
// src/components/ProductCard.tsx
import Link from "next/link";

export function ProductCard({ product }) {
  return (
    <Link href={`/products/${product.slug}`}>
      <div className="card">
        <img src={product.image} alt={product.name} />
        <h3>{product.name}</h3>
        <p>{product.price}</p>
      </div>
    </Link>
  );
}
```

**After**:

```typescript
// Delete src/components/ProductCard.tsx

// In pages
import { ProductCard } from '@letitrip/react-library';
import Link from 'next/link';

// Option 1: Wrap entire card
<Link href={`/products/${product.slug}`}>
  <ProductCard product={product} />
</Link>

// Option 2: Use LinkComponent prop
<ProductCard
  product={product}
  LinkComponent={Link}
  linkHref={`/products/${product.slug}`}
/>
```

### Pattern 3: Component with API Call

**Before**:

```typescript
// src/components/ProductList.tsx
import { useEffect, useState } from "react";
import { fetchProducts } from "@/services/product-service";

export function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchProducts();
      setProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
```

**After**:

```typescript
// Delete src/components/ProductList.tsx

// Create adapter in src/lib/adapters/ProductServiceAdapter.ts
import { ProductService } from "@letitrip/react-library";
import { fetchProducts } from "@/services/product-service";

export const productServiceAdapter: ProductService = {
  async getProducts(params) {
    return await fetchProducts(params);
  },
};

// In page
import { ProductList } from "@letitrip/react-library";
import { productServiceAdapter } from "@/lib/adapters/ProductServiceAdapter";
import Link from "next/link";

<ProductList service={productServiceAdapter} LinkComponent={Link} />;
```

### Pattern 4: Form Component

**Before**:

```typescript
// src/components/LoginForm.tsx
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

**After**:

```typescript
// Delete src/components/LoginForm.tsx

// In page
import { FormInput, Button } from "@letitrip/react-library";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormInput label="Email" type="email" {...register("email")} />
      <FormInput label="Password" type="password" {...register("password")} />
      <Button type="submit">Login</Button>
    </form>
  );
}
```

### Pattern 5: Hook Replacement

**Before**:

```typescript
// src/hooks/useDebounce.ts
import { useEffect, useState } from "react";

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

**After**:

```typescript
// Delete src/hooks/useDebounce.ts

// In components
import { useDebounce } from "@letitrip/react-library";

const debouncedValue = useDebounce(value, 500);
```

### Pattern 6: Utility Replacement

**Before**:

```typescript
// src/lib/formatters.ts
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(price);
}
```

**After**:

```typescript
// Delete src/lib/formatters.ts

// In components
import { formatPrice } from "@letitrip/react-library";

const formattedPrice = formatPrice(1234.56); // ₹1,234.56
```

---

## 📋 Migration Checklist (Per Component/Page)

### Before Starting

- [ ] Read component/page code
- [ ] Identify dependencies
- [ ] Check if library has equivalent
- [ ] Plan migration approach

### During Migration

- [ ] Import from library
- [ ] Create wrappers if needed
- [ ] Create adapters if needed
- [ ] Update all usages
- [ ] Update imports
- [ ] Test functionality

### After Migration

- [ ] Remove old component/utility
- [ ] Fix any errors
- [ ] Test thoroughly
- [ ] Commit with proper message
- [ ] Update tracker

---

## 🔍 Finding Component Usages

### Find all imports of a component:

```bash
# PowerShell
Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" | Select-String "import.*ProductCard"

# Or use grep
grep -r "import.*ProductCard" src/
```

### Find all usages of a component:

```bash
# PowerShell
Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" | Select-String "<ProductCard"

# Or use grep
grep -r "<ProductCard" src/
```

### Find all utility usages:

```bash
# PowerShell
Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" | Select-String "formatPrice"
```

---

## 📝 Commit Message Format

### Template:

```
<type>: <short description>

<detailed description>

<list of changes>

<affected files>
```

### Types:

- `migrate`: Migrating component/page to library
- `fix`: Bug fix
- `refactor`: Code refactoring
- `chore`: Maintenance (e.g., deleting tests)
- `docs`: Documentation only

### Examples:

#### Example 1: Component Migration

```
migrate: Button component to use library version

Replaced custom Button component with @letitrip/react-library Button.
Updated all usages across the application.

Changes:
- Deleted src/components/Button.tsx
- Updated 45 files to import from library
- Added LinkWrapper for navigation buttons
- Tested all button variations

Affected Areas:
- All pages using buttons
- Form components
- Admin dashboard
```

#### Example 2: Page Migration

```
migrate: Product listing page to use library components

Migrated product listing page to use library ProductCard,
SearchBar, FilterSidebar, and Pagination components.

Changes:
- Replaced custom components with library versions
- Created ProductServiceAdapter for API integration
- Added LinkWrapper for product navigation
- Updated search and filter functionality
- Tested with various filter combinations

File: src/app/(public)/products/page.tsx
```

#### Example 3: Hook Migration

```
migrate: Replace custom useDebounce with library hook

Removed custom useDebounce implementation and replaced
with library version across all components.

Changes:
- Deleted src/hooks/useDebounce.ts
- Updated 12 components to use library hook
- Verified debounce behavior matches previous implementation

Affected Components:
- SearchBar
- ProductList
- AuctionList
- ShopList
```

#### Example 4: Cleanup

```
chore: delete all test files as per migration plan

Removed all test files to prepare for migration.
Tests will be recreated after migration is complete.

Deleted:
- tests/ directory
- test-results/ directory
- react-library/src/__tests__/
- All *.test.tsx and *.spec.tsx files
```

---

## 🧪 Testing Checklist

### For Each Component Migration:

- [ ] Component renders correctly
- [ ] Props work as expected
- [ ] Events fire correctly
- [ ] Styling looks correct
- [ ] No console errors
- [ ] Accessibility works

### For Each Page Migration:

- [ ] Page loads without errors
- [ ] All components render
- [ ] Navigation works
- [ ] Forms submit correctly
- [ ] Data loads correctly
- [ ] Loading states work
- [ ] Error states work
- [ ] Responsive design works
- [ ] No console errors

### For Each Hook/Utility Migration:

- [ ] Function works correctly
- [ ] Edge cases handled
- [ ] Type safety maintained
- [ ] No breaking changes

---

## ⚠️ Common Pitfalls

### 1. Next.js in Library ❌

```typescript
// ❌ DON'T: Using Next.js in library
import Link from "next/link";
import { useRouter } from "next/navigation";

// ✅ DO: Accept callbacks/components as props
interface Props {
  onNavigate?: (url: string) => void;
  LinkComponent?: React.ComponentType<any>;
}
```

### 2. Forgetting Wrappers ❌

```typescript
// ❌ DON'T: Library component won't navigate
<ProductCard product={product} href="/product/123" />

// ✅ DO: Wrap with Next.js Link
<Link href="/product/123">
  <ProductCard product={product} />
</Link>
```

### 3. Direct API Calls ❌

```typescript
// ❌ DON'T: Library making API calls directly
import { fetchProducts } from "@/services/product-service";

// ✅ DO: Use service adapter pattern
interface ProductService {
  getProducts(params): Promise<Product[]>;
}
```

### 4. Hardcoded Paths ❌

```typescript
// ❌ DON'T: Hardcoded paths in library
const url = "/api/products";

// ✅ DO: Accept base URL or service adapter
interface Props {
  apiBaseUrl?: string;
  service?: ProductService;
}
```

### 5. Incomplete Migration ❌

```typescript
// ❌ DON'T: Mix old and new components
import { Button } from "@letitrip/react-library";
import { Card } from "@/components/Card"; // old

// ✅ DO: Migrate all related components
import { Button, Card } from "@letitrip/react-library";
```

---

## 🚀 Quick Commands

### Delete Test Files

```powershell
# Delete test directories
Remove-Item -Path "tests" -Recurse -Force
Remove-Item -Path "test-results" -Recurse -Force
Remove-Item -Path "react-library/src/__tests__" -Recurse -Force
Remove-Item -Path "react-library/coverage" -Recurse -Force

# Delete test files
Get-ChildItem -Path "src","react-library/src" -Recurse -Include "*.test.tsx","*.test.ts","*.spec.tsx","*.spec.ts" | Remove-Item -Force

# Commit
git add -A
git commit -m "chore: remove all test files as per migration plan"
```

### Find Component Usages

```powershell
# Find imports
Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" | Select-String "import.*ComponentName"

# Find JSX usage
Get-ChildItem -Path "src" -Recurse -Include "*.tsx" | Select-String "<ComponentName"
```

### Run Development Server

```powershell
npm run dev
```

### Check for Errors

```powershell
npm run lint
npm run type-check
```

---

## 📊 Progress Tracking

### Daily Update

1. Update [`MIGRATION-TRACKER.md`](./MIGRATION-TRACKER.md)
2. Check off completed items
3. Note any issues or blockers
4. Update completion percentages

### Weekly Review

1. Review progress
2. Identify blockers
3. Adjust plan if needed
4. Communicate with team

---

## 🆘 When You're Stuck

### Troubleshooting Steps:

1. **Read Library Docs**: Check react-library documentation
2. **Check Examples**: Look at existing migrated components
3. **Search Codebase**: Find similar patterns
4. **Test Incrementally**: Make small changes and test
5. **Ask for Help**: Document issue in tracker

### Common Issues:

#### Library component not found

```typescript
// Error: Cannot find module '@letitrip/react-library'
// Solution: Check react-library/src/index.ts exports
```

#### Next.js features not working

```typescript
// Error: useRouter is not a function
// Solution: Use wrappers or callbacks
```

#### API calls failing

```typescript
// Error: fetch is not defined
// Solution: Create service adapter
```

---

## 📚 Additional Resources

- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **React Documentation**: https://react.dev/
- **Next.js Documentation**: https://nextjs.org/docs
- **React Hook Form**: https://react-hook-form.com/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## ✅ Success Criteria

### Code Quality

- No duplicated components
- Consistent patterns
- Clean imports
- No linting errors

### Functionality

- All features work
- No broken pages
- No console errors
- Good performance

### Documentation

- Tracker updated
- Commit messages clear
- Issues documented

---

_Keep this guide handy during migration. Refer to it often!_
