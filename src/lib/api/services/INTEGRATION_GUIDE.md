# Error Logging Service Integration Guide

## Quick Setup (3 Steps)

### Step 1: Add Provider to Root Layout

Add the `ErrorLoggingProvider` to your root layout to initialize global error handlers:

```typescript
// src/app/layout.tsx

import { ErrorLoggingProvider } from "@/lib/api/services/error-logging.provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ErrorLoggingProvider>
          <SessionAuthProvider>
            <ModernThemeProvider>
              {/* ...other providers */}
              {children}
            </ModernThemeProvider>
          </SessionAuthProvider>
        </ErrorLoggingProvider>
      </body>
    </html>
  );
}
```

✅ **Already Done!** The ErrorBoundary component already uses the error logging service.

### Step 2: Verify API Endpoint

The service sends logs to `/api/errors`. This endpoint already exists at:

- `src/app/(backend)/api/errors/route.ts`

✅ **Already Done!** The API endpoint is configured and ready.

### Step 3: Use in Your Code

Import and use the service anywhere in your application:

```typescript
import { errorLoggingService } from "@/lib/api/services/error-logging.service";

// In try-catch blocks
try {
  await riskyOperation();
} catch (error) {
  await errorLoggingService.logError(error as Error, {
    source: "MyComponent",
    severity: "high",
  });
}
```

## Common Use Cases

### 1. API Error Handling

```typescript
// In your API client or service
import { errorLoggingService } from "@/lib/api/services/error-logging.service";

async function fetchProducts() {
  try {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    await errorLoggingService.logNetworkError(
      "/api/products",
      error as Error,
      response?.status
    );
    throw error;
  }
}
```

### 2. Form Submission

```typescript
import { errorLoggingService } from "@/lib/api/services/error-logging.service";

async function handleSubmit(data: FormData) {
  try {
    await submitForm(data);
    toast.success("Form submitted!");
  } catch (error) {
    await errorLoggingService.logUserActionError(
      "form-submission",
      error as Error,
      { formType: "contact" }
    );
    toast.error("Submission failed");
  }
}
```

### 3. Payment Processing

```typescript
import { errorLoggingService } from "@/lib/api/services/error-logging.service";

async function processPayment(paymentData: PaymentData) {
  try {
    const result = await paymentAPI.process(paymentData);
    return result;
  } catch (error) {
    await errorLoggingService.logUserActionError(
      "payment-processing",
      error as Error,
      {
        amount: paymentData.amount,
        orderId: paymentData.orderId,
        // Don't log sensitive data!
      }
    );
    throw error;
  }
}
```

### 4. Performance Monitoring

```typescript
import { withPerformanceLogging } from "@/lib/api/services/error-logging.service";

// Automatically logs if operation takes > 1000ms
async function loadDashboard() {
  return await withPerformanceLogging("dashboard-load", async () => {
    const data = await fetchDashboardData();
    return processData(data);
  });
}
```

## Integration with Existing Code

### Add to API Client Interceptor

```typescript
// src/lib/api/client.ts
import { errorLoggingService } from "./services/error-logging.service";

// Add error interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log API errors
    await errorLoggingService.logNetworkError(
      error.config?.url || "unknown",
      error,
      error.response?.status,
      error.response?.data
    );
    return Promise.reject(error);
  }
);
```

### Add to Context Providers

```typescript
// In your auth context or other contexts
import { errorLoggingService } from "@/lib/api/services/error-logging.service";

const login = async (email: string, password: string) => {
  try {
    const user = await authService.login(email, password);
    setUser(user);
  } catch (error) {
    await errorLoggingService.logUserActionError(
      "login",
      error as Error,
      { email } // Don't log password!
    );
    throw error;
  }
};
```

## Available Imports

```typescript
// Main service
import { errorLoggingService } from "@/lib/api/services/error-logging.service";

// Utility functions
import {
  setupGlobalErrorHandlers,
  withPerformanceLogging,
  withErrorLogging,
} from "@/lib/api/services/error-logging.service";

// Provider component
import { ErrorLoggingProvider } from "@/lib/api/services/error-logging.provider";

// Types
import type {
  ErrorLogEntry,
  LogErrorOptions,
} from "@/lib/api/services/error-logging.service";

// Or from the main API index
import { errorLoggingService } from "@/lib/api";
```

## Severity Levels

Use appropriate severity levels for different types of errors:

- **`low`**: Minor errors, recoverable issues, expected errors

  - Form validation failures
  - User input errors
  - Non-critical UI errors

- **`medium`**: Standard errors, unexpected but not critical

  - Network timeouts
  - API errors (non-critical endpoints)
  - Component rendering issues

- **`high`**: Serious errors affecting functionality

  - Payment processing failures
  - Authentication errors
  - Data corruption issues
  - Critical API failures

- **`critical`**: System-breaking errors, data loss, security issues
  - Database errors
  - Security breaches
  - Complete feature failures
  - Data integrity violations

## Example: Complete Component Integration

```typescript
"use client";

import { useState } from "react";
import { errorLoggingService } from "@/lib/api/services/error-logging.service";
import { toast } from "react-hot-toast";

export default function ProductPage({ productId }: { productId: string }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadProduct = async () => {
    setLoading(true);
    try {
      // Your API call
      const data = await fetch(`/api/products/${productId}`);
      if (!data.ok) throw new Error("Failed to load product");

      const product = await data.json();
      setProduct(product);
    } catch (error) {
      // Log the error
      await errorLoggingService.logNetworkError(
        `/api/products/${productId}`,
        error as Error,
        undefined,
        { productId, action: "load" }
      );

      // Show user-friendly message
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    try {
      await cartService.add(productId);
      toast.success("Added to cart!");
    } catch (error) {
      // Log user action error
      await errorLoggingService.logUserActionError(
        "add-to-cart",
        error as Error,
        { productId }
      );

      toast.error("Failed to add to cart");
    }
  };

  return <div>{/* Your component JSX */}</div>;
}
```

## Testing the Service

### Development Mode

- Open browser console
- Trigger an error (e.g., submit a form with invalid data)
- Check console for error logs (formatted with 🚨 icon)
- Check Network tab for POST request to `/api/errors`

### Production Mode

- Errors are logged silently (no console output)
- Check backend logs or database for error entries
- Monitor `/api/errors` endpoint for incoming logs

## Monitoring Setup

To set up a monitoring dashboard:

1. **Modify `/api/errors/route.ts`** to save errors to database
2. **Create admin dashboard** to view errors
3. **Set up email alerts** for critical errors
4. **Integrate with monitoring service** (Sentry, LogRocket, etc.)

Example database storage:

```typescript
// In /api/errors/route.ts
import { db } from "@/lib/db";

export const POST = createApiHandler(async (request) => {
  const errorEntry = await request.json();

  // Save to database
  await db.errorLogs.create({
    data: {
      message: errorEntry.error.message,
      stack: errorEntry.error.stack,
      url: errorEntry.url,
      timestamp: new Date(errorEntry.timestamp),
      severity: errorEntry.additionalContext?.severity,
      source: errorEntry.additionalContext?.source,
      userId: errorEntry.userId,
    },
  });

  return successResponse({ logged: true });
});
```

## Next Steps

1. ✅ Error logging service created
2. ✅ API endpoint configured
3. ✅ ErrorBoundary integrated
4. ⬜ Add to root layout (optional - for global handlers)
5. ⬜ Add to API client interceptor (recommended)
6. ⬜ Set up database storage (for production)
7. ⬜ Create monitoring dashboard (for production)
8. ⬜ Configure alerts (for critical errors)

## Need Help?

- 📖 See `ERROR_LOGGING_README.md` for full documentation
- 📝 See `error-logging.examples.md` for more examples
- 🔧 Check `error-logging.service.ts` for implementation details

## Summary

You now have a complete error logging service that:

- ✅ Logs component errors (ErrorBoundary)
- ✅ Logs network errors
- ✅ Logs user action errors
- ✅ Monitors performance
- ✅ Handles global errors
- ✅ Works in both dev and production
- ✅ Sends logs to your backend API

Just import and use `errorLoggingService` wherever you need error logging!
