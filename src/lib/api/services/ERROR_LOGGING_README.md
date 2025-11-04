# Error Logging Service

A comprehensive error logging service for frontend applications that integrates with your backend API to track, monitor, and analyze errors in production.

## Features

- ✅ **Error Boundary Integration**: Seamlessly log React component errors
- ✅ **Network Error Tracking**: Monitor API failures and network issues
- ✅ **Performance Monitoring**: Track slow operations and performance bottlenecks
- ✅ **User Action Logging**: Log errors during user interactions
- ✅ **Global Error Handlers**: Catch unhandled errors and promise rejections
- ✅ **Batch Logging**: Support for offline error queuing
- ✅ **Severity Levels**: Categorize errors by importance
- ✅ **Development/Production Modes**: Different behavior for dev vs prod

## Quick Start

### 1. Initialize in Root Layout

Add the error logging provider to your root layout:

```typescript
// app/layout.tsx
import { ErrorLoggingProvider } from "@/lib/api/services/error-logging.provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorLoggingProvider>{children}</ErrorLoggingProvider>
      </body>
    </html>
  );
}
```

### 2. Use in Error Boundaries

```typescript
// components/ErrorBoundary.tsx
import { errorLoggingService } from "@/lib/api/services/error-logging.service";

class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorLoggingService.logComponentError(error, errorInfo, {
      boundaryName: "MainApp",
    });
  }
}
```

### 3. Log Errors in Try-Catch

```typescript
import { errorLoggingService } from "@/lib/api/services/error-logging.service";

try {
  await riskyOperation();
} catch (error) {
  await errorLoggingService.logError(error as Error, {
    source: "MyComponent",
    severity: "high",
    additionalContext: { userId: user.id },
  });
}
```

## API Reference

### `errorLoggingService.logError(error, options?)`

Log any error with optional context.

**Parameters:**

- `error` (Error): The error object to log
- `options` (LogErrorOptions): Optional configuration
  - `errorInfo`: React error info (for component errors)
  - `additionalContext`: Custom context data
  - `source`: Where the error originated
  - `severity`: 'low' | 'medium' | 'high' | 'critical'

**Example:**

```typescript
await errorLoggingService.logError(error, {
  source: "CheckoutPage",
  severity: "critical",
  additionalContext: { orderId: "123" },
});
```

### `errorLoggingService.logComponentError(error, errorInfo, context?)`

Specialized method for React component errors.

**Parameters:**

- `error` (Error): The error object
- `errorInfo` (React.ErrorInfo): React error info with component stack
- `context` (object): Additional context

**Example:**

```typescript
await errorLoggingService.logComponentError(error, errorInfo, {
  boundaryName: "ProductCard",
  productId: product.id,
});
```

### `errorLoggingService.logNetworkError(url, error, statusCode?, responseData?)`

Log network/API errors.

**Parameters:**

- `url` (string): The URL that failed
- `error` (Error): The error object
- `statusCode` (number): HTTP status code
- `responseData` (any): Response data if available

**Example:**

```typescript
await errorLoggingService.logNetworkError("/api/products", error, 500, {
  message: "Server error",
});
```

### `errorLoggingService.logPerformanceIssue(operation, duration, threshold?)`

Log slow operations.

**Parameters:**

- `operation` (string): Name of the operation
- `duration` (number): Time taken in milliseconds
- `threshold` (number): Threshold in ms (default: 1000)

**Example:**

```typescript
await errorLoggingService.logPerformanceIssue("dataFetch", 2500, 1000);
```

### `errorLoggingService.logUserActionError(action, error, context?)`

Log errors during user actions.

**Parameters:**

- `action` (string): The user action that failed
- `error` (Error): The error object
- `context` (object): Additional context

**Example:**

```typescript
await errorLoggingService.logUserActionError("form-submission", error, {
  formType: "contact",
});
```

### `errorLoggingService.batchLogErrors(errors)`

Log multiple errors at once.

**Parameters:**

- `errors` (Array): Array of error objects with options

**Example:**

```typescript
await errorLoggingService.batchLogErrors([
  { error: error1, options: { severity: "low" } },
  { error: error2, options: { severity: "high" } },
]);
```

## Utility Functions

### `setupGlobalErrorHandlers()`

Initialize global error handlers for unhandled errors and promise rejections.

**Example:**

```typescript
import { setupGlobalErrorHandlers } from "@/lib/api/services/error-logging.service";

// Call once in your app initialization
setupGlobalErrorHandlers();
```

### `withPerformanceLogging(operation, fn, threshold?)`

Wrap async operations to automatically log performance issues.

**Example:**

```typescript
import { withPerformanceLogging } from "@/lib/api/services/error-logging.service";

const result = await withPerformanceLogging(
  "fetchProducts",
  async () => await fetch("/api/products"),
  1000
);
```

### `withErrorLogging(fn, context?)`

Wrap functions to automatically log errors.

**Example:**

```typescript
import { withErrorLogging } from "@/lib/api/services/error-logging.service";

const safeFunction = withErrorLogging(
  async (id: string) => await fetchData(id),
  "DataFetcher"
);
```

## Backend Integration

The service sends error logs to `/api/errors` endpoint. Make sure your backend handles this route.

The error log structure:

```typescript
{
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string;
  componentStack?: string;
  additionalContext?: Record<string, any>;
}
```

## Environment-Specific Behavior

### Development Mode

- Logs to console with detailed formatting
- Sends errors to API for testing
- Shows full error details

### Production Mode

- Silent console logging (errors still sent to API)
- Graceful failure (won't break app if logging fails)
- Error details hidden from users

## Best Practices

1. **Provide Context**: Always include relevant context (user ID, page, action)
2. **Set Severity**: Use appropriate severity levels
3. **Security**: Never log sensitive data (passwords, tokens, credit cards)
4. **Performance**: Use performance logging for operations > 1s
5. **Consistency**: Use the same source naming convention across your app
6. **Error Boundaries**: Wrap major sections with error boundaries
7. **Global Handlers**: Initialize global handlers in root component

## Integration Examples

### With API Client

```typescript
// lib/api/client.ts
import { errorLoggingService } from "./services/error-logging.service";

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    await errorLoggingService.logNetworkError(
      error.config?.url,
      error,
      error.response?.status
    );
    return Promise.reject(error);
  }
);
```

### With React Query

```typescript
import { QueryClient } from "@tanstack/react-query";
import { errorLoggingService } from "@/lib/api/services/error-logging.service";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        errorLoggingService.logError(error as Error, {
          source: "ReactQuery",
          severity: "medium",
        });
      },
    },
  },
});
```

### With Form Handling

```typescript
const onSubmit = async (data: FormData) => {
  try {
    await submitForm(data);
  } catch (error) {
    await errorLoggingService.logUserActionError(
      "form-submit",
      error as Error,
      { formId: "contact-form" }
    );
    toast.error("Submission failed");
  }
};
```

## Monitoring Dashboard

To view logged errors, you'll need to:

1. **Store errors in database** (modify `/api/errors/route.ts`)
2. **Create admin dashboard** to view errors
3. **Set up alerts** for critical errors
4. **Integrate with services** like Sentry, LogRocket, or Datadog

## Troubleshooting

### Errors not being logged

1. Check console for logging errors
2. Verify `/api/errors` endpoint is working
3. Check network tab for failed requests
4. Ensure error logging service is initialized

### Too many logs

1. Adjust severity thresholds
2. Filter out non-critical errors
3. Implement rate limiting
4. Use sampling for high-volume errors

### Performance impact

1. Use async logging (already implemented)
2. Batch logs for offline scenarios
3. Implement sampling in production
4. Consider using a queue system

## Contributing

To extend the error logging service:

1. Add new methods in `error-logging.service.ts`
2. Update types in the service file
3. Add examples in `error-logging.examples.md`
4. Update this README

## License

Part of the JustForView.in project.
