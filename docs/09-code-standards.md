# Code Standards & Guidelines

> **Status**: ✅ Reference Document
> **Last Updated**: November 30, 2025

## File Naming Conventions

| Type       | Convention           | Example                        |
| ---------- | -------------------- | ------------------------------ |
| Components | PascalCase           | `ProductCard.tsx`              |
| Utilities  | camelCase            | `formatCurrency.ts`            |
| Hooks      | camelCase with `use` | `useSievePagination.ts`        |
| Services   | kebab-case           | `products.service.ts`          |
| Types      | kebab-case           | `product.types.ts`             |
| API Routes | kebab-case folders   | `api/products/[slug]/route.ts` |
| Constants  | kebab-case           | `api-routes.ts`                |
| Tests      | Same name + .test    | `ProductCard.test.tsx`         |

## Import Order

```typescript
// 1. React/Next.js
import { useState, useEffect } from "react";
import { NextRequest, NextResponse } from "next/server";

// 2. External libraries
import { z } from "zod";
import { toast } from "sonner";

// 3. Internal aliases (@/)
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

// 4. Relative imports
import { ProductCardSkeleton } from "./ProductCardSkeleton";

// 5. Types (always last)
import type { Product } from "@/types/product.types";
```

## Component Structure

```tsx
"use client"; // if client component

// Imports
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ComponentProps } from "./types";

// Types (if not in separate file)
interface Props extends ComponentProps {
  variant?: "default" | "compact";
}

// Component
export function MyComponent({ variant = "default", ...props }: Props) {
  // State
  const [loading, setLoading] = useState(false);

  // Derived state
  const isCompact = variant === "compact";

  // Effects
  useEffect(() => {
    // ...
  }, []);

  // Handlers
  const handleClick = () => {
    setLoading(true);
  };

  // Render
  return (
    <div className={isCompact ? "p-2" : "p-4"}>
      <Button onClick={handleClick} disabled={loading}>
        {loading ? "Loading..." : "Click me"}
      </Button>
    </div>
  );
}

// Default export (optional, prefer named exports)
export default MyComponent;
```

## API Route Structure

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { validateAuth } from "@/app/api/lib/auth";
import { z } from "zod";

// Validation schema
const createSchema = z.object({
  name: z.string().min(3),
  price: z.number().positive(),
});

// GET handler
export async function GET(request: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    // ... implementation
    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const auth = await validateAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate body
    const body = await request.json();
    const result = createSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors },
        { status: 400 }
      );
    }

    // Implementation
    const db = getFirestoreAdmin();
    // ...

    return NextResponse.json({ success: true, data: {} }, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Tailwind CSS Conventions

### Dark Mode Pattern

```tsx
// Always include dark mode variants
className = "bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

// Borders
className = "border border-gray-200 dark:border-gray-700";

// Hover states
className = "hover:bg-gray-100 dark:hover:bg-gray-700";
```

### Responsive Pattern

```tsx
// Mobile-first approach
className = "px-4 md:px-6 lg:px-8";
className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
```

### Spacing Consistency

```tsx
// Use consistent spacing scale
className = "p-4 space-y-4"; // Cards
className = "p-6 space-y-6"; // Sections
className = "gap-4"; // Grids
```

## Error Handling

### API Errors

```typescript
// Use consistent error response format
return NextResponse.json(
  {
    success: false,
    error: "Human readable message",
    code: "ERROR_CODE", // Optional
  },
  { status: 400 }
);
```

### Client Errors

```tsx
// Use toast for user feedback
import { toast } from "sonner";

try {
  await apiCall();
  toast.success("Action completed");
} catch (error) {
  toast.error(error instanceof Error ? error.message : "Something went wrong");
}
```

## Type Definitions

### API Response Types

```typescript
// Consistent response structure
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

### Entity Types

```typescript
// Use consistent field naming
interface BaseEntity {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;
}

interface Product extends BaseEntity {
  name: string;
  slug: string;
  price: number;
  // ...
}
```

## Testing Guidelines

### Unit Tests

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductCard } from "./ProductCard";

describe("ProductCard", () => {
  it("renders product name", () => {
    const product = { name: "Test Product", price: 100 };
    render(<ProductCard product={product} />);
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  it("handles click event", () => {
    const onClick = jest.fn();
    render(<ProductCard product={product} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### API Tests

```typescript
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

describe("Products API", () => {
  it("GET returns products", async () => {
    const request = new NextRequest("http://localhost/api/products");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

## Git Commit Messages

```
feat: add product quick view component
fix: resolve dark mode issue in DataTable
refactor: consolidate card components
docs: update API documentation
test: add unit tests for ProductCard
chore: update dependencies
```

## AI Agent Guidelines

See `/NDocs/getting-started/AI-AGENT-GUIDE.md` for:

- How to read existing code before editing
- Using existing patterns and architecture
- Testing changes after implementation
- Fixing errors immediately
- Using tools to edit files directly
- Running commands directly using tools
