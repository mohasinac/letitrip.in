# 📋 Development Guidelines

**Project:** HobbiesSpot.com - Beyblade Ecommerce Platform  
**Last Updated:** November 1, 2025

---

## Table of Contents

1. [Code Organization](#code-organization)
2. [File Size Limits](#file-size-limits)
3. [Naming Conventions](#naming-conventions)
4. [Component Guidelines](#component-guidelines)
5. [TypeScript Standards](#typescript-standards)
6. [Performance Best Practices](#performance-best-practices)
7. [Security Guidelines](#security-guidelines)
8. [Testing Requirements](#testing-requirements)

---

## Code Organization

### Directory Structure Rules

```
src/
├── app/          # Next.js App Router pages & API routes
├── components/   # React components (organized by feature)
├── lib/          # Server-side utilities
├── utils/        # Client-side utilities
├── hooks/        # Custom React hooks
├── contexts/     # React contexts
├── types/        # TypeScript type definitions
└── styles/       # Global styles
```

**Rules:**

- Keep server-side code in `lib/`
- Keep client-side code in `utils/`
- Use `"use client"` directive only when needed
- Organize components by feature, not by type

---

## File Size Limits

### **Primary Rule: 300 Lines Maximum**

Every file should aim to stay **under 300 lines of code**.

**Why?**

- Easier to understand and maintain
- Faster code reviews
- Better testability
- Encourages modular design

### When to Split Files

**If a file exceeds 300 lines, consider:**

1. **Extract Components**

   ```tsx
   // Before: 500-line page.tsx
   export default function Page() {
     return (
       <div>
         {/* 200 lines of form */}
         {/* 200 lines of table */}
       </div>
     );
   }

   // After: Split into focused files
   // page.tsx (100 lines)
   import { ProductForm } from "./components/ProductForm";
   import { ProductTable } from "./components/ProductTable";

   export default function Page() {
     return (
       <div>
         <ProductForm />
         <ProductTable />
       </div>
     );
   }
   ```

2. **Create Tab Components**

   ```tsx
   // Shop page split into tabs
   /seller/shop/page.tsx (main orchestrator)
   /seller/shop/components/
     ├── BasicInfoTab.tsx
     ├── AddressTab.tsx
     └── SeoTab.tsx
   ```

3. **Extract Utilities**
   ```typescript
   // Move helper functions to separate files
   /utils/aadiilnotv.ts / utils / formatting.ts;
   ```

### File Size Examples from Project

**✅ Good Examples:**

- `PageHeader.tsx` - 150 lines
- `ModernDataTable.tsx` - 250 lines
- `BasicInfoTab.tsx` - 289 lines

**⚠️ Edge Cases (Allowed):**

- Main orchestrator files: up to 400 lines
- Complex multi-step forms: up to 350 lines
- Must document why exception is needed

**❌ Bad Examples:**

- Any file over 500 lines without splitting

---

## Naming Conventions

### Files

| Type       | Pattern          | Example                  |
| ---------- | ---------------- | ------------------------ |
| Components | PascalCase       | `UserProfile.tsx`        |
| Utilities  | camelCase        | `validation.ts`          |
| Hooks      | use + PascalCase | `useAuth.ts`             |
| API Routes | lowercase        | `route.ts`               |
| Pages      | lowercase        | `page.tsx`, `layout.tsx` |
| Types      | camelCase        | `index.ts`, `api.ts`     |
| Constants  | UPPER_SNAKE      | `CONSTANTS.ts`           |
| Multi-word | kebab-case       | `error-handler.ts`       |

### Variables and Functions

```typescript
// Variables: camelCase
const userName = "John";
const isLoading = true;
const productCount = 10;

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Functions: camelCase, verb + noun
function getUserById(id: string) {}
function validateEmail(email: string) {}
function formatCurrency(amount: number) {}

// Event handlers: handle + Event
const handleClick = () => {};
const handleSubmit = async () => {};
const handleInputChange = (e) => {};

// Boolean variables: is/has/should + adjective
const isVisible = true;
const hasAccess = false;
const shouldRender = true;
```

### Components

```typescript
// Component names: PascalCase, descriptive
export const UserProfile = () => {};
export const ProductCard = () => {};
export const MobileBottomNav = () => {};

// Unified components: Unified prefix
export const UnifiedButton = () => {};
export const UnifiedCard = () => {};

// Page components: [Feature]Page
export default function ProductsPage() {}
export default function CheckoutPage() {}
```

---

## Component Guidelines

### 1. Component Structure

```tsx
/**
 * ComponentName
 * Brief description of what this component does
 */

"use client"; // Only if needed

import React from "react";
import { cn } from "@/lib/utils";

// 1. Props interface
export interface ComponentNameProps {
  /** Description of prop */
  title: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// 2. Component definition
export const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  children,
  className,
  onClick,
}) => {
  // 3. Hooks (if any)
  const [state, setState] = useState("");

  // 4. Derived values
  const isActive = state === "active";

  // 5. Handlers
  const handleClick = () => {
    onClick?.();
  };

  // 6. Effects (if any)
  useEffect(() => {
    // ...
  }, []);

  // 7. Render
  return (
    <div className={cn("base-classes", className)} onClick={handleClick}>
      <h2>{title}</h2>
      {children}
    </div>
  );
};

// 8. Default export (optional)
export default ComponentName;
```

### 2. Component Best Practices

**DO:**

- ✅ Use TypeScript interfaces for props
- ✅ Add JSDoc comments for exported components
- ✅ Use `cn()` utility for className merging
- ✅ Use path aliases (`@/...`)
- ✅ Extract complex logic to custom hooks
- ✅ Keep components focused (single responsibility)
- ✅ Provide default props where appropriate

**DON'T:**

- ❌ Use `any` types
- ❌ Mix business logic with presentation
- ❌ Create giant components (> 300 lines)
- ❌ Use inline styles (use Tailwind classes)
- ❌ Hardcode values (use constants)
- ❌ Nest components deeply (> 3-4 levels)

### 3. Prop Naming

```typescript
// Boolean props: is/has/should prefix
interface Props {
  isVisible: boolean;
  hasError: boolean;
  shouldAnimate: boolean;
}

// Handler props: on + Event
interface Props {
  onClick: () => void;
  onSubmit: (data: FormData) => void;
  onChange: (value: string) => void;
}

// Number props: descriptive names
interface Props {
  maxLength: number;
  itemCount: number;
  pageSize: number;
}
```

---

## TypeScript Standards

### 1. Always Use Types

```typescript
// ❌ BAD
function processUser(user: any) {
  return user.name;
}

// ✅ GOOD
interface User {
  id: string;
  name: string;
  email: string;
}

function processUser(user: User): string {
  return user.name;
}
```

### 2. Strict Configuration

**tsconfig.json must include:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 3. Type vs Interface

```typescript
// Use INTERFACE for object shapes (can be extended)
interface User {
  id: string;
  name: string;
}

// Use TYPE for unions, intersections, utilities
type Status = "active" | "inactive" | "pending";
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### 4. Avoid Type Assertions

```typescript
// ❌ BAD
const user = data as User;

// ✅ GOOD
if (isUser(data)) {
  const user: User = data; // Type narrowed
}

function isUser(data: unknown): data is User {
  return (
    typeof data === "object" && data !== null && "id" in data && "name" in data
  );
}
```

---

## Performance Best Practices

### 1. Optimize Re-renders

```tsx
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* ... */}</div>;
});

// Use useCallback for functions passed as props
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return items.reduce(/* complex calculation */);
}, [items]);
```

### 2. Code Splitting

```tsx
// Dynamic imports for large components
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <Skeleton />,
  ssr: false, // Client-only if needed
});
```

### 3. Image Optimization

```tsx
// Always use Next.js Image
import Image from "next/image";

<Image
  src="/product.jpg"
  alt="Product"
  width={800}
  height={600}
  priority // For above-the-fold images
  placeholder="blur" // Optional
/>;
```

### 4. Minimize Bundle Size

- Tree-shake unused code
- Use imports wisely: `import { Button } from '@/components/ui/unified'`
- Avoid large libraries when small alternatives exist
- Check bundle analyzer: `npm run analyze`

---

## Security Guidelines

### 1. Authentication & Authorization

```typescript
// Client-side: Check auth state
const { user, loading } = useAuth();

if (loading) return <Loading />;
if (!user) redirect("/login");

// Server-side: Always verify tokens
export async function POST(request: NextRequest) {
  const user = await verifyToken(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Proceed with operation
}
```

### 2. Input Validation

```typescript
// Always validate user input
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().min(18).max(120),
});

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error },
      { status: 400 }
    );
  }

  // Use validated data
  const { email, password, age } = result.data;
}
```

### 3. Sensitive Data

**NEVER:**

- ❌ Expose API keys in client code
- ❌ Store passwords in plain text
- ❌ Send sensitive data in URLs
- ❌ Log sensitive information

**ALWAYS:**

- ✅ Use environment variables for secrets
- ✅ Hash passwords before storage
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Sanitize user input
- ✅ Use server-side operations for sensitive data

### 4. XSS Prevention

```tsx
// Next.js/React automatically escapes content
<div>{userInput}</div> // ✅ Safe

// Dangerous: only if absolutely needed
<div dangerouslySetInnerHTML={{ __html: sanitize(userInput) }} />

// Sanitization function
import DOMPurify from 'dompurify';

function sanitize(html: string): string {
  return DOMPurify.sanitize(html);
}
```

---

## Testing Requirements

### 1. What to Test

**Priority 1 (Must Test):**

- API endpoints
- Authentication logic
- Payment processing
- Data validation
- Security-critical functions

**Priority 2 (Should Test):**

- Complex business logic
- Utility functions
- Custom hooks
- Form validation

**Priority 3 (Nice to Have):**

- UI components
- Integration tests
- E2E tests

### 2. Testing Pattern

```typescript
// Unit test example
describe("formatCurrency", () => {
  it("formats Indian rupees correctly", () => {
    expect(formatCurrency(1000)).toBe("₹1,000");
    expect(formatCurrency(1000000)).toBe("₹10,00,000");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("₹0");
  });

  it("handles negative numbers", () => {
    expect(formatCurrency(-500)).toBe("-₹500");
  });
});
```

### 3. Test Coverage Goals

- **API Routes:** 80%+ coverage
- **Utilities:** 70%+ coverage
- **Components:** 50%+ coverage (focus on logic)

---

## Code Review Checklist

Before submitting PR:

### Functionality

- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling implemented
- [ ] Loading states shown

### Code Quality

- [ ] Files under 300 lines (exceptions documented)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No console.logs in production code
- [ ] Proper error messages
- [ ] Functions have single responsibility

### TypeScript

- [ ] No `any` types
- [ ] Interfaces defined for props
- [ ] Return types specified
- [ ] Proper type guards used

### Performance

- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] Large components code-split
- [ ] Expensive operations memoized

### Security

- [ ] Input validated
- [ ] Authentication checked
- [ ] No secrets in client code
- [ ] SQL injection prevented (if applicable)

### Naming & Organization

- [ ] Descriptive variable names
- [ ] Consistent naming conventions
- [ ] Proper file organization
- [ ] Path aliases used (`@/`)

### Documentation

- [ ] JSDoc comments for exports
- [ ] README updated if needed
- [ ] Complex logic explained

---

## Git Commit Standards

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```
feat(auth): add password reset functionality

fix(cart): resolve quantity update bug

docs(api): update API documentation

refactor(products): split ProductForm into tabs

perf(images): implement lazy loading
```

---

## Quick Reference Card

| Guideline       | Rule                               |
| --------------- | ---------------------------------- |
| **File Size**   | < 300 lines (exceptions allowed)   |
| **TypeScript**  | No `any`, always use interfaces    |
| **Imports**     | Use path aliases (`@/`)            |
| **Components**  | PascalCase, focused, < 300 lines   |
| **Functions**   | camelCase, verb + noun             |
| **Variables**   | camelCase, descriptive             |
| **Constants**   | UPPER_SNAKE_CASE                   |
| **Props**       | Typed interfaces, JSDoc            |
| **Security**    | Server-side sensitive ops          |
| **Performance** | Memoize, code-split, optimize      |
| **Testing**     | API 80%, utils 70%, components 50% |
| **Git Commits** | type(scope): subject               |

---

_Last Updated: November 1, 2025_  
_For more details, see [PROJECT_STRUCTURE.md](./project/PROJECT_STRUCTURE.md) and [NAMING_CONVENTIONS.md](./project/NAMING_CONVENTIONS.md)_
