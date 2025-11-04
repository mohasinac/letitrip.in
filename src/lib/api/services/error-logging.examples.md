# Error Logging Service Usage Examples

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Error Boundary Integration](#error-boundary-integration)
3. [Network Error Logging](#network-error-logging)
4. [Performance Monitoring](#performance-monitoring)
5. [User Action Errors](#user-action-errors)
6. [Global Error Setup](#global-error-setup)

---

## Basic Usage

### Simple Error Logging

```typescript
import { errorLoggingService } from "@/lib/api/services/error-logging.service";

try {
  // Your code that might throw
  riskyOperation();
} catch (error) {
  // Log the error
  await errorLoggingService.logError(error as Error, {
    additionalContext: {
      operation: "riskyOperation",
      userId: currentUser?.id,
    },
    severity: "medium",
  });
}
```

### With Custom Source

```typescript
await errorLoggingService.logError(error as Error, {
  source: "CheckoutPage",
  severity: "high",
  additionalContext: {
    cartTotal: cart.total,
    itemCount: cart.items.length,
  },
});
```

---

## Error Boundary Integration

### In ErrorBoundary Component

```typescript
import { errorLoggingService } from "@/lib/api/services/error-logging.service";

class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log component errors
    errorLoggingService.logComponentError(error, errorInfo, {
      boundaryName: "MainAppBoundary",
      route: window.location.pathname,
    });
  }
}
```

### Custom Error Boundary with Additional Context

```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  errorLoggingService.logComponentError(error, errorInfo, {
    boundaryName: this.constructor.name,
    userId: this.props.userId,
    userRole: this.props.userRole,
    currentPage: this.props.currentPage,
  }).catch(console.error);
}
```

---

## Network Error Logging

### API Call Error Logging

```typescript
import { errorLoggingService } from "@/lib/api/services/error-logging.service";

async function fetchUserData(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    // Log network errors
    await errorLoggingService.logNetworkError(
      `/api/users/${userId}`,
      error as Error,
      response?.status,
      { userId }
    );
    throw error;
  }
}
```

### With Axios

```typescript
import axios from "axios";
import { errorLoggingService } from "@/lib/api/services/error-logging.service";

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      await errorLoggingService.logNetworkError(
        error.config?.url || "unknown",
        error,
        error.response?.status,
        {
          method: error.config?.method,
          data: error.response?.data,
        }
      );
    }
    return Promise.reject(error);
  }
);
```

---

## Performance Monitoring

### Measure and Log Slow Operations

```typescript
import { withPerformanceLogging } from "@/lib/api/services/error-logging.service";

// Automatically logs if operation takes > 1000ms
async function loadProducts() {
  return await withPerformanceLogging(
    "loadProducts",
    async () => {
      const products = await fetchProducts();
      return processProducts(products);
    },
    1000 // threshold in ms
  );
}
```

### Manual Performance Logging

```typescript
import { errorLoggingService } from "@/lib/api/services/error-logging.service";

const startTime = performance.now();

// Your operation
await heavyComputation();

const duration = performance.now() - startTime;

// Log if it's slow (threshold: 500ms)
await errorLoggingService.logPerformanceIssue(
  "heavyComputation",
  duration,
  500
);
```

### Component Render Time Monitoring

```typescript
function MyComponent() {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const renderTime = performance.now() - startTime;
      if (renderTime > 100) {
        errorLoggingService.logPerformanceIssue(
          "MyComponent-render",
          renderTime,
          100
        );
      }
    };
  }, []);

  return <div>...</div>;
}
```

---

## User Action Errors

### Form Submission Errors

```typescript
import { errorLoggingService } from "@/lib/api/services/error-logging.service";

async function handleSubmit(formData: FormData) {
  try {
    await submitForm(formData);
  } catch (error) {
    // Log user action errors
    await errorLoggingService.logUserActionError(
      "form-submission",
      error as Error,
      {
        formType: "contact",
        fieldCount: Object.keys(formData).length,
        timestamp: new Date().toISOString(),
      }
    );

    // Show user-friendly error
    toast.error("Failed to submit form. Please try again.");
  }
}
```

### Payment Processing Errors

```typescript
async function processPayment(paymentData: PaymentData) {
  try {
    return await paymentApi.process(paymentData);
  } catch (error) {
    await errorLoggingService.logUserActionError(
      "payment-processing",
      error as Error,
      {
        amount: paymentData.amount,
        method: paymentData.method,
        orderId: paymentData.orderId,
        // Don't log sensitive data like card numbers!
      }
    );
    throw error;
  }
}
```

### File Upload Errors

```typescript
async function uploadFile(file: File) {
  try {
    return await uploadApi.upload(file);
  } catch (error) {
    await errorLoggingService.logUserActionError(
      "file-upload",
      error as Error,
      {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      }
    );
    throw error;
  }
}
```

---

## Global Error Setup

### Initialize in Root Layout

```typescript
// app/layout.tsx or _app.tsx
"use client";

import { setupGlobalErrorHandlers } from "@/lib/api/services/error-logging.service";
import { useEffect } from "react";

export default function RootLayout({ children }) {
  useEffect(() => {
    // Setup global error handlers once
    setupGlobalErrorHandlers();
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### In Next.js App Router

```typescript
// app/providers.tsx
"use client";

import { setupGlobalErrorHandlers } from "@/lib/api/services/error-logging.service";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);

  return <>{children}</>;
}
```

### Wrap Functions with Error Logging

```typescript
import { withErrorLogging } from "@/lib/api/services/error-logging.service";

// Wrap any function to automatically log errors
const safeApiCall = withErrorLogging(async (userId: string) => {
  return await fetchUserData(userId);
}, "fetchUserData");

// Use it
try {
  const user = await safeApiCall("123");
} catch (error) {
  // Error is already logged
  console.error("Failed to fetch user");
}
```

---

## Advanced Usage

### Batch Error Logging (Offline Support)

```typescript
import { errorLoggingService } from "@/lib/api/services/error-logging.service";

const errors = [
  { error: new Error("Error 1"), options: { severity: "low" } },
  { error: new Error("Error 2"), options: { severity: "medium" } },
  { error: new Error("Error 3"), options: { severity: "high" } },
];

// Log all errors at once
await errorLoggingService.batchLogErrors(errors);
```

### Custom Error Classes

```typescript
class PaymentError extends Error {
  constructor(message: string, public orderId: string, public amount: number) {
    super(message);
    this.name = "PaymentError";
  }
}

try {
  throw new PaymentError("Payment failed", "ORD-123", 99.99);
} catch (error) {
  if (error instanceof PaymentError) {
    await errorLoggingService.logError(error, {
      additionalContext: {
        orderId: error.orderId,
        amount: error.amount,
      },
      severity: "critical",
      source: "PaymentProcessor",
    });
  }
}
```

---

## Best Practices

1. **Always provide context**: Include relevant information like user ID, page, action
2. **Set appropriate severity**: Use 'low', 'medium', 'high', 'critical' appropriately
3. **Don't log sensitive data**: Never log passwords, credit cards, tokens, etc.
4. **Use structured logging**: Provide consistent context across your application
5. **Handle logging failures gracefully**: Don't let error logging break your app
6. **Monitor performance**: Use performance logging for slow operations
7. **Set up global handlers**: Initialize error handlers in your root component

## Integration with Monitoring Services

To integrate with external services like Sentry, add this to the service:

```typescript
// In error-logging.service.ts
private async sendToSentry(logEntry: ErrorLogEntry): Promise<void> {
  if (typeof window !== "undefined" && window.Sentry) {
    window.Sentry.captureException(logEntry.error, {
      extra: logEntry.additionalContext,
      tags: {
        severity: logEntry.additionalContext?.severity,
        source: logEntry.additionalContext?.source,
      },
    });
  }
}
```
