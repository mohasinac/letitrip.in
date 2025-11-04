# Error Logging Service - Quick Reference

## 🚀 Import

```typescript
import { errorLoggingService } from "@/lib/api/services/error-logging.service";
// or
import { errorLoggingService } from "@/lib/api";
```

## 📋 Methods

### `logError(error, options?)`

General purpose error logging.

```typescript
await errorLoggingService.logError(error, {
  source: "ComponentName",
  severity: "high", // low | medium | high | critical
  additionalContext: { userId: "123" },
});
```

### `logComponentError(error, errorInfo, context?)`

For React Error Boundaries.

```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  errorLoggingService.logComponentError(error, errorInfo, {
    boundaryName: 'MainApp'
  });
}
```

### `logNetworkError(url, error, statusCode?, responseData?)`

For API/network errors.

```typescript
await errorLoggingService.logNetworkError("/api/products", error, 500, {
  message: "Server error",
});
```

### `logUserActionError(action, error, context?)`

For user interaction errors.

```typescript
await errorLoggingService.logUserActionError("checkout", error, {
  orderId: "123",
  amount: 99.99,
});
```

### `logPerformanceIssue(operation, duration, threshold?)`

For slow operations.

```typescript
await errorLoggingService.logPerformanceIssue(
  "fetchProducts",
  2500, // ms
  1000 // threshold
);
```

### `batchLogErrors(errors)`

Log multiple errors at once.

```typescript
await errorLoggingService.batchLogErrors([
  { error: error1, options: { severity: "low" } },
  { error: error2, options: { severity: "high" } },
]);
```

## 🛠️ Utility Functions

### `withPerformanceLogging(operation, fn, threshold?)`

Wrap async functions with performance tracking.

```typescript
import { withPerformanceLogging } from "@/lib/api/services/error-logging.service";

const data = await withPerformanceLogging(
  "loadDashboard",
  async () => await fetchData(),
  1000
);
```

### `withErrorLogging(fn, context?)`

Wrap functions with error tracking.

```typescript
import { withErrorLogging } from "@/lib/api/services/error-logging.service";

const safeFunction = withErrorLogging(
  async (id) => await fetchData(id),
  "DataFetcher"
);
```

### `setupGlobalErrorHandlers()`

Initialize global error handlers (call once).

```typescript
import { setupGlobalErrorHandlers } from "@/lib/api/services/error-logging.service";

useEffect(() => {
  setupGlobalErrorHandlers();
}, []);
```

## 🎯 Common Patterns

### Try-Catch Pattern

```typescript
try {
  await riskyOperation();
} catch (error) {
  await errorLoggingService.logError(error as Error, {
    source: "MyComponent",
    severity: "medium",
  });
  // Handle error (show toast, etc.)
}
```

### API Call Pattern

```typescript
try {
  const response = await fetch("/api/data");
  if (!response.ok) throw new Error("Failed");
  return await response.json();
} catch (error) {
  await errorLoggingService.logNetworkError(
    "/api/data",
    error as Error,
    response?.status
  );
  throw error;
}
```

### Form Submit Pattern

```typescript
const onSubmit = async (data: FormData) => {
  try {
    await submitForm(data);
    toast.success("Success!");
  } catch (error) {
    await errorLoggingService.logUserActionError(
      "form-submit",
      error as Error,
      { formType: "contact" }
    );
    toast.error("Failed!");
  }
};
```

### Performance Pattern

```typescript
const startTime = performance.now();
await heavyOperation();
const duration = performance.now() - startTime;

await errorLoggingService.logPerformanceIssue(
  "heavyOperation",
  duration,
  500 // threshold
);
```

## ⚡ Quick Tips

✅ **Always provide context** - Include user ID, page, action  
✅ **Set appropriate severity** - Use low/medium/high/critical  
✅ **Handle async** - Use `await` or `.catch()`  
✅ **Don't log sensitive data** - No passwords, tokens, credit cards  
✅ **Use descriptive sources** - 'CheckoutPage', 'PaymentForm', etc.  
✅ **Log before throwing** - Log, then throw/show error to user

## 🎨 Severity Guide

| Severity   | When to Use                                      |
| ---------- | ------------------------------------------------ |
| `low`      | Form validation, user input errors               |
| `medium`   | Network timeouts, non-critical API errors        |
| `high`     | Payment failures, auth errors, critical features |
| `critical` | Database errors, security issues, data loss      |

## 📱 React Integration

### In Components

```typescript
function MyComponent() {
  const handleClick = async () => {
    try {
      await doSomething();
    } catch (error) {
      await errorLoggingService.logUserActionError(
        "button-click",
        error as Error
      );
    }
  };

  return <button onClick={handleClick}>Click</button>;
}
```

### In Hooks

```typescript
function useData() {
  const fetchData = async () => {
    try {
      return await api.getData();
    } catch (error) {
      await errorLoggingService.logNetworkError("/api/data", error as Error);
      throw error;
    }
  };

  return { fetchData };
}
```

### In Context

```typescript
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const login = async (email, password) => {
    try {
      await authService.login(email, password);
    } catch (error) {
      await errorLoggingService.logUserActionError("login", error as Error, {
        email,
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ login }}>{children}</AuthContext.Provider>
  );
}
```

## 🔍 Debugging

### Check Console (Development)

Look for logs with 🚨 icon:

```
🚨 Error Logging Service
Error: ...
Error Info: ...
Additional Context: ...
Full Log Entry: ...
```

### Check Network Tab

Look for POST requests to `/api/errors`

### Check Backend Logs

Error logs are sent to `/api/errors` endpoint

## 📦 Type Definitions

```typescript
interface LogErrorOptions {
  errorInfo?: any;
  additionalContext?: Record<string, any>;
  source?: string;
  severity?: "low" | "medium" | "high" | "critical";
}

interface ErrorLogEntry {
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  errorInfo?: any;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  componentStack?: string;
  additionalContext?: Record<string, any>;
}
```

## 🔗 Links

- 📖 Full Documentation: `ERROR_LOGGING_README.md`
- 📝 Examples: `error-logging.examples.md`
- 🚀 Integration Guide: `INTEGRATION_GUIDE.md`
- 📊 Summary: `ERROR_LOGGING_SUMMARY.md`

## 🆘 Need Help?

1. Check the full documentation files
2. Review the examples file
3. Look at the service implementation
4. Test in development mode first

---

**Service Location:** `src/lib/api/services/error-logging.service.ts`  
**Status:** ✅ Ready to Use
