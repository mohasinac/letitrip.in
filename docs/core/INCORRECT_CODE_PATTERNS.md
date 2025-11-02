# ❌ Common Incorrect Code Patterns and Solutions

**Project:** HobbiesSpot.com - Beyblade Ecommerce Platform  
**Last Updated:** November 2, 2025

---

## Table of Contents

1. [React & Component Patterns](#react--component-patterns)
2. [State Management Anti-Patterns](#state-management-anti-patterns)
3. [TypeScript Mistakes](#typescript-mistakes)
4. [API & Data Fetching](#api--data-fetching)
5. [Form Validation](#form-validation)
6. [Performance Issues](#performance-issues)
7. [Security Vulnerabilities](#security-vulnerabilities)

---

## React & Component Patterns

### ❌ **Incorrect:** Using Index as Key

```tsx
// DON'T DO THIS
{
  items.map((item, index) => <div key={index}>{item.name}</div>);
}
```

### ✅ **Correct:** Use Unique IDs

```tsx
// DO THIS
{
  items.map((item) => <div key={item.id}>{item.name}</div>);
}
```

**Why:** Using index causes issues with reordering, deletions, and state preservation.

---

### ❌ **Incorrect:** Direct State Mutation

```tsx
// DON'T DO THIS
const addItem = (newItem) => {
  items.push(newItem); // ❌ Mutates state
  setItems(items);
};
```

### ✅ **Correct:** Create New Array

```tsx
// DO THIS
const addItem = (newItem) => {
  setItems([...items, newItem]); // ✅ New array
};

// Or for objects
setUser({ ...user, name: "New Name" });
```

---

### ❌ **Incorrect:** useEffect Without Cleanup

```tsx
// DON'T DO THIS
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 1000);
}, []);
```

### ✅ **Correct:** Cleanup on Unmount

```tsx
// DO THIS
useEffect(() => {
  let isMounted = true;
  const interval = setInterval(() => {
    if (isMounted) fetchData();
  }, 1000);

  return () => {
    isMounted = false;
    clearInterval(interval); // Cleanup
  };
}, []);
```

---

### ❌ **Incorrect:** Conditional Hooks

```tsx
// DON'T DO THIS
if (condition) {
  useEffect(() => {
    // ...
  }, []);
}
```

### ✅ **Correct:** Condition Inside Hook

```tsx
// DO THIS
useEffect(() => {
  if (condition) {
    // ...
  }
}, [condition]);
```

---

## State Management Anti-Patterns

### ❌ **Incorrect:** Unnecessary State

```tsx
// DON'T DO THIS
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [fullName, setFullName] = useState(""); // ❌ Derived state

useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

### ✅ **Correct:** Compute on Render

```tsx
// DO THIS
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const fullName = `${firstName} ${lastName}`; // ✅ Derived value
```

---

### ❌ **Incorrect:** useState for Async Data

```tsx
// DON'T DO THIS
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  fetchData()
    .then((d) => setData(d))
    .catch((e) => setError(e))
    .finally(() => setLoading(false));
}, []);
```

### ✅ **Correct:** Use Custom Hook or SWR

```tsx
// DO THIS - Custom Hook
const { data, loading, error } = useProducts();

// OR with SWR
const { data, error, isLoading } = useSWR("/api/products", fetcher);
```

---

## TypeScript Mistakes

### ❌ **Incorrect:** Using `any`

```typescript
// DON'T DO THIS
function processData(data: any) {
  return data.value; // ❌ No type safety
}
```

### ✅ **Correct:** Proper Types

```typescript
// DO THIS
interface Data {
  value: string;
}

function processData(data: Data): string {
  return data.value; // ✅ Type-safe
}
```

---

### ❌ **Incorrect:** Optional Chaining Everywhere

```typescript
// DON'T DO THIS
const value = data?.user?.profile?.address?.street?.name; // ❌ Too defensive
```

### ✅ **Correct:** Validate at Boundaries

```typescript
// DO THIS
if (!data?.user?.profile) {
  throw new Error("Invalid data structure");
}

const street = data.user.profile.address.street.name; // ✅ Known shape
```

---

### ❌ **Incorrect:** Non-null Assertion

```typescript
// DON'T DO THIS
const value = data!.property!; // ❌ Bypasses type safety
```

### ✅ **Correct:** Proper Guards

```typescript
// DO THIS
if (!data || !data.property) {
  throw new Error("Data is required");
}

const value = data.property; // ✅ Type narrowed
```

---

## API & Data Fetching

### ❌ **Incorrect:** Fetch in Component

```tsx
// DON'T DO THIS
function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return <div>{data?.value}</div>;
}
```

### ✅ **Correct:** Use API Client

```tsx
// DO THIS
import { apiGet } from "@/lib/api/client";

function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    apiGet("/api/data").then(setData);
  }, []);

  return <div>{data?.value}</div>;
}
```

**Why:** `apiGet` handles authentication, caching, retries, and error formatting.

---

### ❌ **Incorrect:** No Error Handling

```typescript
// DON'T DO THIS
const data = await fetch("/api/data").then((r) => r.json());
```

### ✅ **Correct:** Handle Errors

```typescript
// DO THIS
try {
  const response = await fetch("/api/data");

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  return data;
} catch (error) {
  console.error("Fetch failed:", error);
  throw error;
}
```

---

### ❌ **Incorrect:** Client-Side Authentication

```typescript
// DON'T DO THIS - Client-side
import { getFirestore } from "firebase/firestore";

const db = getFirestore();
await db.collection("sensitiveData").doc(id).delete(); // ❌ Bypasses security
```

### ✅ **Correct:** Server-Side with Admin SDK

```typescript
// DO THIS - Server-side API route
import { getAdminDb } from "@/lib/database/admin";

export async function DELETE(request: NextRequest) {
  const user = await verifyToken(request);
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const db = getAdminDb();
  await db.collection("sensitiveData").doc(id).delete(); // ✅ Authorized

  return NextResponse.json({ success: true });
}
```

---

## Form Validation

### ❌ **Incorrect:** Validate on Submit Only

```tsx
// DON'T DO THIS
const handleSubmit = () => {
  if (!email) {
    setError("Email required");
    return;
  }

  if (!isValidEmail(email)) {
    setError("Invalid email");
    return;
  }

  // ... more validation
  submitForm();
};
```

### ✅ **Correct:** Use Validation Schema

```tsx
// DO THIS
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Must be 8+ characters"),
});

const handleSubmit = () => {
  const result = schema.safeParse(formData);

  if (!result.success) {
    setErrors(result.error.flatten().fieldErrors);
    return;
  }

  submitForm(result.data);
};
```

---

### ❌ **Incorrect:** Not Showing Error Message

```tsx
// DON'T DO THIS
<UnifiedInput
  error={!!errors.name} // ❌ Boolean only
/>
```

### ✅ **Correct:** Show Error Message

```tsx
// DO THIS
<UnifiedInput error={!!errors.name} />;
{
  errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>;
}
```

---

## Performance Issues

### ❌ **Incorrect:** Inline Functions in Props

```tsx
// DON'T DO THIS
<Button onClick={() => handleClick(id)} /> // ❌ New function every render
```

### ✅ **Correct:** useCallback

```tsx
// DO THIS
const handleButtonClick = useCallback(() => {
  handleClick(id);
}, [id]);

<Button onClick={handleButtonClick} />;
```

---

### ❌ **Incorrect:** Large Dependency Arrays

```tsx
// DON'T DO THIS
useEffect(() => {
  // ...
}, [user, products, orders, cart, wishlist /* ... 10 more */]); // ❌
```

### ✅ **Correct:** Extract to Custom Hook

```tsx
// DO THIS
function useCartSync() {
  useEffect(() => {
    // Sync logic
  }, [cart, user.id]); // Focused deps
}

function MyComponent() {
  useCartSync();
}
```

---

### ❌ **Incorrect:** Heavy Computation on Every Render

```tsx
// DON'T DO THIS
function Component({ items }) {
  const expensiveValue = items.map(/* complex calculation */); // ❌ Every render

  return <div>{expensiveValue.length}</div>;
}
```

### ✅ **Correct:** useMemo

```tsx
// DO THIS
function Component({ items }) {
  const expensiveValue = useMemo(
    () => items.map(/* complex calculation */),
    [items]
  );

  return <div>{expensiveValue.length}</div>;
}
```

---

## Security Vulnerabilities

### ❌ **Incorrect:** Exposing Sensitive Data

```typescript
// DON'T DO THIS
export async function GET() {
  const users = await db.collection("users").get();

  return NextResponse.json(
    users.docs.map((doc) => doc.data()) // ❌ Includes passwords, tokens
  );
}
```

### ✅ **Correct:** Filter Sensitive Fields

```typescript
// DO THIS
export async function GET() {
  const users = await db.collection("users").get();

  return NextResponse.json(
    users.docs.map((doc) => {
      const { password, refreshToken, ...safeData } = doc.data();
      return safeData; // ✅ Only safe fields
    })
  );
}
```

---

### ❌ **Incorrect:** Client-Side Secret Keys

```javascript
// DON'T DO THIS
const apiKey = "sk_live_12345"; // ❌ Exposed in bundle
fetch(`https://api.service.com?key=${apiKey}`);
```

### ✅ **Correct:** Server-Side API Route

```typescript
// DO THIS - API Route
export async function POST(request: NextRequest) {
  const apiKey = process.env.SECRET_API_KEY; // ✅ Server-only

  const response = await fetch(`https://api.service.com`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  return NextResponse.json(await response.json());
}
```

---

### ❌ **Incorrect:** SQL Injection Equivalent

```typescript
// DON'T DO THIS
const query = db.collection("products").where("name", "==", userInput); // ❌ If using raw queries
```

### ✅ **Correct:** Parameterized Queries

```typescript
// DO THIS - Firestore handles this automatically
const query = db
  .collection("products")
  .where("name", "==", sanitize(userInput));

function sanitize(input: string): string {
  return input.trim().toLowerCase();
}
```

---

### ❌ **Incorrect:** No Rate Limiting

```typescript
// DON'T DO THIS
export async function POST(request: NextRequest) {
  // Anyone can call this endpoint unlimited times ❌
  await expensiveOperation();
  return NextResponse.json({ success: true });
}
```

### ✅ **Correct:** Add Rate Limiting

```typescript
// DO THIS
import { withRateLimit } from "@/lib/auth/middleware";

export const POST = withRateLimit(async (request: NextRequest) => {
  await expensiveOperation();
  return NextResponse.json({ success: true });
});
```

---

## File Organization

### ❌ **Incorrect:** Everything in One File

```tsx
// DON'T DO THIS - 1000+ line file
// page.tsx contains:
// - Component logic
// - Form validation
// - API calls
// - Helper functions
// - Styles
// - Types
```

### ✅ **Correct:** Split into Modules

```tsx
// DO THIS
// page.tsx (< 300 lines)
import { useProducts } from "@/hooks/useProducts";
import { ProductList } from "./components/ProductList";
import { ProductFilters } from "./components/ProductFilters";

export default function ProductsPage() {
  const { products, loading } = useProducts();

  return (
    <div>
      <ProductFilters />
      <ProductList products={products} loading={loading} />
    </div>
  );
}
```

**Rule:** Keep files under 300 lines when possible.

---

## Import Paths

### ❌ **Incorrect:** Relative Imports

```typescript
// DON'T DO THIS
import { Button } from "../../../components/ui/unified/Button";
import { apiGet } from "../../../lib/api/client";
```

### ✅ **Correct:** Path Aliases

```typescript
// DO THIS
import { Button } from "@/components/ui/unified/Button";
import { apiGet } from "@/lib/api/client";
```

**Why:** Easier refactoring, cleaner imports, less errors.

---

## Component Props

### ❌ **Incorrect:** Prop Drilling

```tsx
// DON'T DO THIS
<GrandParent user={user}>
  <Parent user={user}>
    <Child user={user} />
  </Parent>
</GrandParent>
```

### ✅ **Correct:** Context or Composition

```tsx
// DO THIS - Context
<AuthProvider>
  <GrandParent>
    <Parent>
      <Child /> {/* useAuth() inside */}
    </Parent>
  </GrandParent>
</AuthProvider>
```

---

## Quick Reference: Common Fixes

| ❌ Wrong                        | ✅ Correct                          |
| ------------------------------- | ----------------------------------- |
| `any` types                     | Proper TypeScript interfaces        |
| Index as key                    | Unique IDs as key                   |
| State mutation                  | New arrays/objects                  |
| Inline functions in JSX         | useCallback                         |
| No cleanup in useEffect         | Return cleanup function             |
| Client-side sensitive ops       | Server-side API routes              |
| Relative imports                | Path aliases (@/)                   |
| One giant file                  | Split into focused modules (<300L)  |
| Raw fetch()                     | apiGet/apiPost with error handling  |
| Secrets in client code          | Environment variables (server-side) |
| No error boundaries             | ErrorBoundary wrapper               |
| Prop drilling                   | Context or composition              |
| Validation on submit only       | Real-time + schema validation       |
| Missing TypeScript strict modes | Enable strict mode                  |

---

## Code Review Checklist

Before committing, check:

- [ ] No `any` types (use proper interfaces)
- [ ] All effects have cleanup
- [ ] No state mutations (use spread operator)
- [ ] Unique keys for lists (not index)
- [ ] Error handling on all async operations
- [ ] Path aliases used (`@/`)
- [ ] Files under 300 lines
- [ ] TypeScript errors resolved (`npm run type-check`)
- [ ] No console.logs left in production code
- [ ] Sensitive operations in API routes, not client
- [ ] Props properly typed
- [ ] Performance optimized (useMemo, useCallback where needed)

---

_Last Updated: November 2, 2025_  
_For more guidelines, see [DEVELOPMENT_GUIDELINES.md](./DEVELOPMENT_GUIDELINES.md)_
