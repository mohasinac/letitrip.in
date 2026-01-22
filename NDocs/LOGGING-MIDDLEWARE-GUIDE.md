# Logging and Middleware Guide

## Overview

Comprehensive logging and middleware system for API routes and frontend components with error tracking, performance monitoring, and request/response logging.

## Components

### 1. API Middleware (`src/lib/api-middleware.ts`)

Server-side middleware for API routes with request/response logging, performance monitoring, and rate limiting.

### 2. Client Logger (`src/lib/client-logger.ts`)

Client-side logging for browser with performance tracking and user action monitoring.

### 3. Error Boundary (`src/components/common/ErrorBoundary.tsx`)

React error boundary for catching and displaying errors gracefully.

### 4. Error Pages

- `src/app/error.tsx` - General error page
- `src/app/global-error.tsx` - Fatal error page (500)
- `src/app/not-found.tsx` - 404 page

---

## API Middleware Usage

### Basic Usage

```typescript
// src/app/api/example/route.ts
import {
  withApiMiddleware,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/api-middleware";
import { NextRequest } from "next/server";

export const GET = withApiMiddleware(
  async (req: NextRequest) => {
    try {
      // Your API logic here
      const data = { message: "Hello World" };

      return createSuccessResponse(data);
    } catch (error) {
      return createErrorResponse("Failed to fetch data", 500);
    }
  },
  {
    requireAuth: false, // Optional: require authentication
    rateLimit: { max: 100, windowMs: 60000 }, // Optional: rate limiting
  },
);
```

### With Authentication

```typescript
import { withApiMiddleware, createSuccessResponse } from "@/lib/api-middleware";
import { requireAuth } from "@/lib/auth";

export const POST = withApiMiddleware(
  async (req: NextRequest) => {
    // Authentication already handled by middleware
    const session = await requireAuth(req);

    // Your protected logic here
    return createSuccessResponse({ userId: session.userId });
  },
  {
    requireAuth: true, // Middleware will check auth
  },
);
```

### With Validation

```typescript
import {
  withApiMiddleware,
  validateRequest,
  createSuccessResponse,
} from "@/lib/api-middleware";

const createProductSchema = {
  title: { type: "string", required: true },
  price: { type: "number", required: true },
  description: { type: "string", required: false },
};

export const POST = withApiMiddleware(async (req: NextRequest) => {
  // Validate request body
  const validation = await validateRequest(req, createProductSchema);
  if (!validation.valid) {
    return createErrorResponse(validation.errors.join(", "), 400);
  }

  const data = validation.data;
  // Create product with validated data

  return createSuccessResponse({ id: "123", ...data });
});
```

### Performance Monitoring

```typescript
import { PerformanceMonitor } from "@/lib/api-middleware";

const monitor = PerformanceMonitor.getInstance();

// Track performance automatically
export const GET = withApiMiddleware(async (req) => {
  // Middleware automatically tracks timing

  // Get metrics
  const metrics = monitor.getMetrics("/api/products");
  console.log(`Avg response time: ${metrics.avgDuration}ms`);

  return createSuccessResponse({ metrics });
});
```

### Rate Limiting

```typescript
import { withApiMiddleware, RateLimiter } from "@/lib/api-middleware";

const limiter = new RateLimiter(10, 60000); // 10 requests per minute

export const POST = withApiMiddleware(async (req: NextRequest) => {
  const clientId = req.headers.get("x-forwarded-for") || "anonymous";

  if (!limiter.check(clientId)) {
    return createErrorResponse("Rate limit exceeded", 429);
  }

  // Handle request
  return createSuccessResponse({ success: true });
});
```

---

## Client Logger Usage

### Basic Logging

```typescript
// In any component
import { logger } from "@/lib/client-logger";

export default function MyComponent() {
  logger.info("Component mounted", {}, "MyComponent");
  logger.debug("User data loaded", { count: 10 }, "MyComponent");
  logger.warn("API slow response", { time: 3000 }, "MyComponent");
  logger.error("Failed to save", error, "MyComponent");
}
```

### Performance Tracking

```typescript
import { PerformanceLogger } from "@/lib/client-logger";

const perfLogger = new PerformanceLogger();

export default function DataLoader() {
  useEffect(() => {
    perfLogger.startMark("data-load");

    fetchData().then(() => {
      perfLogger.endMark("data-load");
      const duration = perfLogger.measure(
        "data-load",
        "data-load-start",
        "data-load-end",
      );
      console.log(`Data loaded in ${duration}ms`);
    });
  }, []);
}
```

### User Action Tracking

```typescript
import { ActionLogger } from "@/lib/client-logger";

const actionLogger = new ActionLogger();

export default function ProductCard({ product }) {
  const handleClick = () => {
    actionLogger.trackClick("product-card", { productId: product.id });
    // Navigate to product
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    actionLogger.trackFormSubmit("add-to-cart", { productId: product.id });
    // Submit form
  };

  return (
    <div onClick={handleClick}>
      <form onSubmit={handleSubmit}>{/* Form content */}</form>
    </div>
  );
}
```

### API Call Wrapper

```typescript
import { loggedApiCall } from "@/lib/client-logger";

export async function fetchProducts() {
  return loggedApiCall("/api/products", {
    method: "GET",
  });
}

// Usage
const products = await fetchProducts();
// Automatically logs: request start, duration, success/failure
```

### Download Logs

```typescript
import { logger } from "@/lib/client-logger";

// In development/debugging
logger.downloadLogs(); // Downloads all logs as JSON
```

---

## Error Boundary Usage

### Wrap Components

```typescript
// Wrap any component that might throw errors
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function Page() {
  return (
    <ErrorBoundary>
      <RiskyComponent />
    </ErrorBoundary>
  );
}
```

### Custom Fallback UI

```typescript
<ErrorBoundary
  fallback={
    <div className="p-8 text-center">
      <p>Something went wrong in this section</p>
      <button onClick={() => window.location.reload()}>Reload</button>
    </div>
  }
>
  <MyComponent />
</ErrorBoundary>
```

### With Error Handler

```typescript
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Send to error tracking service
    console.error("Caught error:", error);
    logger.error("Error Boundary", error, "App");
  }}
>
  <MyComponent />
</ErrorBoundary>
```

### HOC Pattern

```typescript
import { withErrorBoundary } from "@/components/common/ErrorBoundary";

const SafeComponent = withErrorBoundary(RiskyComponent);

// Use it
<SafeComponent />;
```

### Async Error Handler

```typescript
import { useErrorHandler } from "@/components/common/ErrorBoundary";

export default function MyComponent() {
  const handleError = useErrorHandler();

  const fetchData = async () => {
    try {
      const response = await fetch("/api/data");
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
    } catch (error) {
      handleError(error); // Will be caught by error boundary
    }
  };
}
```

---

## Error Pages

### Default Error Page (`error.tsx`)

Automatically shown for any unhandled errors in app routes.

Features:

- Shows error message and stack trace in development
- Provides "Try Again" and "Go Home" buttons
- Logs errors to client logger
- Downloads logs button in dev mode

### Global Error Page (`global-error.tsx`)

Handles fatal server errors (500).

Features:

- Minimal HTML/CSS (no React context)
- Shows error digest/reference ID
- Development mode shows full stack trace
- Contact support link

### 404 Page (`not-found.tsx`)

Shown when route doesn't exist.

Features:

- Helpful navigation links
- Search functionality
- Suggestions for common pages
- Go back button

---

## Complete Example: Protected API Route

```typescript
// src/app/api/products/create/route.ts
import {
  withApiMiddleware,
  createSuccessResponse,
  createErrorResponse,
  validateRequest,
} from "@/lib/api-middleware";
import { requireAuth, requireRole } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { NextRequest } from "next/server";

const productSchema = {
  title: { type: "string", required: true },
  price: { type: "number", required: true },
  description: { type: "string", required: false },
  category: { type: "string", required: true },
};

export const POST = withApiMiddleware(
  async (req: NextRequest) => {
    try {
      // 1. Authenticate user
      const session = await requireAuth(req);

      // 2. Check role
      await requireRole(req, ["seller", "admin"]);

      // 3. Validate request
      const validation = await validateRequest(req, productSchema);
      if (!validation.valid) {
        return createErrorResponse(validation.errors.join(", "), 400);
      }

      // 4. Create product
      const productData = {
        ...validation.data,
        userId: session.userId,
        createdAt: new Date(),
        status: "pending",
      };

      const docRef = await db.collection("products").add(productData);

      // 5. Return success
      return createSuccessResponse(
        { id: docRef.id, ...productData },
        "Product created successfully",
      );
    } catch (error) {
      console.error("Product creation error:", error);
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to create product",
        500,
      );
    }
  },
  {
    requireAuth: true,
    rateLimit: { max: 10, windowMs: 60000 }, // 10 products per minute
  },
);
```

## Complete Example: Frontend Component

```typescript
// src/components/ProductList.tsx
"use client";

import { useState, useEffect } from "react";
import { logger, loggedApiCall, ActionLogger } from "@/lib/client-logger";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

const actionLogger = new ActionLogger();

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.info("ProductList mounted", {}, "ProductList");
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);

      // API call with automatic logging
      const response = await loggedApiCall("/api/products", {
        method: "GET",
      });

      const data = await response.json();
      setProducts(data.products);

      logger.info(
        "Products loaded",
        { count: data.products.length },
        "ProductList",
      );
    } catch (error) {
      logger.error("Failed to load products", error, "ProductList");
      throw error; // Will be caught by ErrorBoundary
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    actionLogger.trackClick("product-item", { productId });
    // Navigate to product
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => handleProductClick(product.id)}
          className="cursor-pointer"
        >
          <h3>{product.title}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
}

// Export with error boundary
export default function ProductListWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <ProductList />
    </ErrorBoundary>
  );
}
```

---

## Best Practices

### API Routes

1. **Always use withApiMiddleware** for consistent logging and error handling
2. **Use createSuccessResponse/createErrorResponse** for standardized responses
3. **Validate input** with validateRequest before processing
4. **Add rate limiting** for public endpoints
5. **Monitor performance** with PerformanceMonitor for slow endpoints

### Frontend

1. **Wrap risky components** with ErrorBoundary
2. **Log important actions** (page views, API calls, user interactions)
3. **Use loggedApiCall** wrapper for all API calls
4. **Track performance** for slow operations
5. **Download logs** during development for debugging

### Error Handling

1. **Provide helpful error messages** to users
2. **Log detailed errors** for developers
3. **Show stack traces** only in development
4. **Give recovery options** (try again, go home)
5. **Track error patterns** for improvements

---

## Environment Variables

Add to `.env.local`:

```env
# Logging
NODE_ENV=development # Shows debug logs and stack traces
NEXT_PUBLIC_LOG_LEVEL=debug # Client log level: debug, info, warn, error

# Rate Limiting
RATE_LIMIT_MAX=100 # Max requests per window
RATE_LIMIT_WINDOW_MS=60000 # Window in milliseconds
```

---

## Monitoring in Production

### Server Logs

Check `logs/` directory for server-side logs:

- `logs/error-YYYY-MM-DD.log` - Error logs with stack traces

### Client Logs

In production, errors are saved to localStorage:

- Open browser DevTools → Application → Local Storage
- Look for `client-error-logs` key

### Performance Metrics

```typescript
import { PerformanceMonitor } from "@/lib/api-middleware";

const monitor = PerformanceMonitor.getInstance();
const allMetrics = monitor.getAllMetrics();

// Send to analytics service
console.table(allMetrics);
```

---

## Troubleshooting

### Middleware not logging?

Check `NODE_ENV`:

```typescript
console.log(process.env.NODE_ENV); // Should be 'development'
```

### Error boundary not catching errors?

Error boundaries only catch:

- Rendering errors
- Lifecycle method errors
- Constructor errors

They don't catch:

- Event handlers (use try/catch)
- Async code (use useErrorHandler)
- Server-side errors

### Rate limiting too aggressive?

Adjust limits in middleware:

```typescript
export const POST = withApiMiddleware(handler, {
  rateLimit: { max: 1000, windowMs: 60000 }, // 1000 req/min
});
```

---

## Next Steps

1. **Integrate middleware** in all API routes
2. **Add error boundaries** to critical components
3. **Set up monitoring** dashboard for metrics
4. **Configure alerts** for error patterns
5. **Test error pages** in different scenarios
