# Error Handling & Logging Guide

## Overview

This application has a comprehensive, centralized error handling and logging system for both frontend and backend. All errors are automatically logged to files, and the UI provides friendly error pages for users.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Error Handling System                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐         ┌─────────────────────┐   │
│  │   CLIENT SIDE       │         │   SERVER SIDE       │   │
│  ├─────────────────────┤         ├─────────────────────┤   │
│  │ • Logger class      │         │ • serverLogger      │   │
│  │ • error.tsx         │         │ • error-handler.ts  │   │
│  │ • global-error.tsx  │◄───────►│ • API routes        │   │
│  │ • ErrorBoundary     │         │ • /api/logs/write   │   │
│  │ • error-logger.ts   │         │ • server-error-     │   │
│  │                     │         │   logger.ts         │   │
│  └─────────────────────┘         └─────────────────────┘   │
│             │                              │                │
│             └──────────────┬───────────────┘                │
│                            │                                │
│                            ▼                                │
│                   ┌─────────────────┐                       │
│                   │  Log Files      │                       │
│                   │  (./logs/)      │                       │
│                   │                 │                       │
│                   │ • error-*.log   │                       │
│                   │ • warn-*.log    │                       │
│                   │ • info-*.log    │                       │
│                   └─────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Client-Side Error Handling

#### Error Pages

##### `error.tsx` (Route-level errors)

- Catches runtime errors in specific routes
- Displays user-friendly error message
- Provides retry and home navigation options
- Automatically logs errors to file

##### `global-error.tsx` (Critical errors)

- Catches errors in root layout
- Last line of defense for critical errors
- Self-contained HTML (no layout dependencies)
- Logs critical errors with full context

#### ErrorBoundary Component

Located at: `src/components/ErrorBoundary.tsx`

Wrap components to catch React errors:

```tsx
import { ErrorBoundary } from "@/components";

<ErrorBoundary
  fallback={<CustomErrorUI />} // Optional custom UI
  onError={(error, info) => {
    // Optional error callback
    // Custom error handling
  }}
>
  <YourComponent />
</ErrorBoundary>;
```

#### Client Logger

Located at: `src/classes/Logger.ts`

Singleton logger for browser:

```tsx
import { logger } from "@/classes";

// Logs are automatically written to files via /api/logs/write
logger.error("Something failed", { additionalData });
logger.warn("Warning message", data);
logger.info("Info message", data);
logger.debug("Debug message", data);
```

Features:

- In-memory log storage
- Console output (development)
- Automatic file writing via API (errors only)
- localStorage persistence (optional)
- Log level filtering

### 2. Server-Side Error Handling

#### API Error Handler

Located at: `src/lib/errors/error-handler.ts`

Use in all API routes:

```typescript
import { handleApiError } from "@/lib/errors/error-handler";

export async function POST(request: NextRequest) {
  try {
    // Your code
  } catch (error) {
    return handleApiError(error); // Automatic logging + formatted response
  }
}
```

Features:

- Automatic error type detection
- Consistent JSON response format
- Automatic file logging for 500+ errors
- Stack trace capture
- Error code mapping

#### Server Logger

Located at: `src/lib/server-logger.ts`

Direct file logging in Node.js:

```typescript
import { serverLogger } from "@/lib/server-logger";

serverLogger.error("Database query failed", { query, error });
serverLogger.warn("Slow query detected", { duration });
serverLogger.info("User action", { userId, action });
```

Features:

- Direct file writes (no API call needed)
- Automatic log rotation (10MB per file)
- Log file cleanup (keeps last 10 files)
- Date-based file organization
- Level-specific files (error-YYYY-MM-DD.log)

### 3. Centralized Logging Helpers

#### Client-Side Helpers

Located at: `src/helpers/logging/error-logger.ts`

Import from `@/helpers`:

```typescript
import {
  logClientError,
  logApiError,
  logAuthError,
  logValidationError,
  logUploadError,
  initializeClientLogger,
} from "@/helpers";

// Initialize in root layout (sets up global handlers)
initializeClientLogger();

// Categorized error logging
logAuthError("login", error, { userId });
logApiError("/api/users", response, { userId });
logUploadError("profile.jpg", error, { size: 1024 });
logValidationError("SignupForm", validationErrors);
```

**Available Functions:**

- `logClientError(message, error, context)` - General errors
- `logClientWarning(message, context)` - Warnings
- `logClientInfo(message, context)` - Info logs
- `logClientDebug(message, context)` - Debug logs
- `logApiError(endpoint, response, context)` - API call failures
- `logValidationError(formName, errors, context)` - Form validation
- `logNavigationError(route, error, context)` - Routing errors
- `logAuthError(operation, error, context)` - Auth failures
- `logUploadError(fileName, error, context)` - File uploads
- `logPaymentError(transactionId, error, context)` - Payments
- `initializeClientLogger()` - Set up global error handlers

#### Server-Side Helpers

Located at: `src/helpers/logging/server-error-logger.ts`

Import directly (NOT from `@/helpers`):

```typescript
import {
  logServerError,
  logApiRouteError,
  logDatabaseError,
  logServerAuthError,
  logAuthorizationError,
  logEmailError,
  logStorageError,
  extractRequestMetadata,
} from "@/helpers/logging/server-error-logger";

// In API routes
logApiRouteError("/api/users", error, request);

// Database operations
logDatabaseError("create", "users", error, { userId });

// Auth failures
logServerAuthError("token-validation", error, { token: "xxx" });

// Authorization
logAuthorizationError(userId, "admin-panel", "access");

// Email
logEmailError("user@example.com", error, { templateId });

// Storage
logStorageError("upload", "/path/to/file.jpg", error);
```

**Available Functions:**

- `logServerError(message, error, context)` - General server errors
- `logServerWarning(message, context)` - Warnings
- `logServerInfo(message, context)` - Info logs
- `logApiRouteError(endpoint, error, request, context)` - API route errors
- `logDatabaseError(operation, collection, error, context)` - DB errors
- `logServerAuthError(operation, error, context)` - Auth errors
- `logAuthorizationError(userId, resource, action, context)` - Permissions
- `logEmailError(recipient, error, context)` - Email failures
- `logStorageError(operation, filePath, error, context)` - Storage errors
- `logExternalApiError(service, endpoint, error, context)` - 3rd party APIs
- `logSlowOperation(operation, duration, threshold, context)` - Performance
- `logSecurityEvent(event, severity, context)` - Security events
- `extractRequestMetadata(request)` - Extract request info

### 4. Error Classes

Located at: `src/lib/errors/`

```typescript
import {
  AppError, // Base error class
  ApiError, // API-specific errors
  ValidationError, // Input validation
  AuthenticationError, // Auth failures
  AuthorizationError, // Permission denied
  NotFoundError, // Resource not found
  DatabaseError, // DB operations
  ERROR_CODES, // Standard error codes
  ERROR_MESSAGES, // Error messages
} from "@/lib/errors";

// Throw typed errors
throw new NotFoundError("User not found");
throw new ValidationError("Invalid email format", "INVALID_EMAIL");
throw new AuthenticationError("Token expired");

// Use in API routes (automatically logged via handleApiError)
```

## Usage Examples

### Example 1: React Component Error

```tsx
"use client";

import { useState } from "react";
import { logClientError } from "@/helpers";
import { Button } from "@/components";

export default function MyComponent() {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/data");

      if (!response.ok) {
        // Log API error
        await logApiError("/api/data", response, {
          component: "MyComponent",
          action: "fetchData",
        });
        throw new Error("Failed to fetch");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      // Log general error
      logClientError("Data fetch failed", error, {
        component: "MyComponent",
      });

      // Show user-friendly message
      alert("Failed to load data");
    }
  };

  return <Button onClick={fetchData}>Load Data</Button>;
}
```

### Example 2: API Route Error Handling

```typescript
// src/app/api/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/error-handler";
import { ValidationError, NotFoundError } from "@/lib/errors";
import {
  logApiRouteError,
  logDatabaseError,
} from "@/helpers/logging/server-error-logger";
import { userRepository } from "@/repositories";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      throw new ValidationError("User ID is required", "MISSING_USER_ID");
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    // Automatically logs and returns formatted error
    return handleApiError(error);
  }
}

// More complex example with custom logging
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Custom validation logging
    if (!body.email) {
      logApiRouteError("/api/users", new Error("Missing email"), request, {
        severity: "validation",
      });
      throw new ValidationError("Email is required", "MISSING_EMAIL");
    }

    const user = await userRepository.create(body);
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    // Log with database context
    if (error instanceof Error && error.message.includes("duplicate")) {
      logDatabaseError("create", "users", error, {
        email: body.email,
        reason: "duplicate-entry",
      });
    }

    return handleApiError(error);
  }
}
```

### Example 3: Form Validation Logging

```tsx
"use client";

import { useState } from "react";
import { useForm } from "@/hooks";
import { logValidationError } from "@/helpers";
import { FormField, Button } from "@/components";

export default function SignupForm() {
  const { values, errors, handleChange, handleSubmit } = useForm({
    initialValues: { email: "", password: "" },
    validate: (values) => {
      const errors: Record<string, string> = {};

      if (!values.email) {
        errors.email = "Email is required";
      }

      if (values.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      }

      // Log validation errors
      if (Object.keys(errors).length > 0) {
        logValidationError("SignupForm", errors, {
          attemptedEmail: values.email,
        });
      }

      return errors;
    },
    onSubmit: async (values) => {
      // Submit logic
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        name="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
      />
      <FormField
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
      />
      <Button type="submit">Sign Up</Button>
    </form>
  );
}
```

### Example 4: Global Error Initialization

```tsx
// src/app/layout.tsx

"use client";

import { useEffect } from "react";
import { initializeClientLogger } from "@/helpers";

export default function RootLayout({ children }) {
  useEffect(() => {
    // Initialize global error handlers
    initializeClientLogger();
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

## Log Files

### Location

All logs are written to: `./logs/` directory at project root

### File Format

- **Naming**: `{level}-{date}.log` (e.g., `error-2026-02-08.log`)
- **Rotation**: Automatically rotates when file exceeds 10MB
- **Retention**: Keeps last 10 log files per level
- **Format**:
  ```
  [ERROR] 2026-02-08T10:30:45.123Z - Error message
    Data: {
      "context": "additional info",
      "stack": "error stack trace"
    }
  ```

### Log Levels & Files

- `error-*.log` - Errors only (automatically written from client & server)
- `warn-*.log` - Warnings (server-side)
- `info-*.log` - Info messages (server-side)
- `debug-*.log` - Debug messages (disabled in production)

## Best Practices

### ✅ DO

1. **Use typed error classes**

   ```typescript
   throw new NotFoundError("User not found");
   ```

2. **Always provide context**

   ```typescript
   logClientError("Failed to load", error, {
     userId,
     component: "UserProfile",
     action: "loadData",
   });
   ```

3. **Use handleApiError in API routes**

   ```typescript
   catch (error) {
     return handleApiError(error);
   }
   ```

4. **Use categorized logging functions**

   ```typescript
   logAuthError("login", error, context); // Not logClientError
   ```

5. **Initialize client logger in root layout**

   ```typescript
   useEffect(() => {
     initializeClientLogger();
   }, []);
   ```

6. **Wrap risky components in ErrorBoundary**
   ```tsx
   <ErrorBoundary>
     <ComplexComponent />
   </ErrorBoundary>
   ```

### ❌ DON'T

1. **Don't use console.error directly**

   ```typescript
   console.error("Error"); // ❌ Won't be logged to files
   logger.error("Error"); // ✅ Will be logged
   ```

2. **Don't throw raw errors**

   ```typescript
   throw new Error("Not found"); // ❌
   throw new NotFoundError("User not found"); // ✅
   ```

3. **Don't import server logger in client code**

   ```typescript
   // ❌ In React component:
   import { serverLogger } from "@/lib/server-logger";

   // ✅ Use client logger:
   import { logger } from "@/classes";
   ```

4. **Don't import server helpers from @/helpers**

   ```typescript
   // ❌ In API route:
   import { logServerError } from "@/helpers";

   // ✅ Import directly:
   import { logServerError } from "@/helpers/logging/server-error-logger";
   ```

5. **Don't log sensitive data**

   ```typescript
   // ❌
   logClientError("Login failed", error, {
     password: user.password, // Never log passwords
   });

   // ✅
   logAuthError("login", error, {
     email: user.email, // OK to log non-sensitive data
   });
   ```

## Testing Error Handling

### Manual Testing

1. **Test error pages**: Navigate to `/non-existent-route`
2. **Test ErrorBoundary**: Throw error in component
3. **Test API errors**: Call API with invalid data
4. **Check log files**: Verify `./logs/error-*.log` files

### Automated Testing

```typescript
// Component test
import { render } from '@testing-library/react';
import { ErrorBoundary } from '@/components';

test('catches errors', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  const { getByText } = render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(getByText(/something went wrong/i)).toBeInTheDocument();
});
```

## Monitoring & Debugging

### View Logs

```bash
# View latest errors
tail -f logs/error-$(date +%Y-%m-%d).log

# View all errors from today
cat logs/error-$(date +%Y-%m-%d).log

# Search for specific error
grep "authentication" logs/error-*.log
```

### Log Analysis

```bash
# Count errors by type
grep -o '\[ERROR\]' logs/error-*.log | wc -l

# Find slow operations
grep "Slow Operation" logs/warn-*.log

# List all security events
grep "Security Event" logs/*.log
```

## Integration with External Services

To integrate with external error tracking services (Sentry, DataDog, etc.):

```typescript
// src/lib/error-tracking.ts

import * as Sentry from "@sentry/nextjs";

export const initializeErrorTracking = () => {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // Additional config
  });
};

// Then in error-logger.ts:
import * as Sentry from "@sentry/nextjs";

export const logClientError = (message, error, context) => {
  // Existing logging
  logger.error(message, { error, ...context });

  // Also send to Sentry
  Sentry.captureException(error, {
    tags: { context: message },
    extra: context,
  });
};
```

## Troubleshooting

### Logs not being written

1. Check `./logs/` directory exists and is writable
2. Verify `enableFileLogging: true` in Logger config
3. Check API route `/api/logs/write` is accessible
4. Review console for API call errors

### Error pages not showing

1. Verify `error.tsx` and `global-error.tsx` exist
2. Check error is being thrown in correct scope
3. Ensure errors are not being caught silently

### Missing error context

1. Always pass context object to logging functions
2. Include user ID when available
3. Add component/action identifiers
4. Capture request metadata in API routes

## Summary

This centralized error handling system provides:

- ✅ **Consistent error logging** across client and server
- ✅ **User-friendly error pages** with automatic logging
- ✅ **File-based error persistence** with rotation
- ✅ **Typed error classes** for better error handling
- ✅ **Categorized logging helpers** for different scenarios
- ✅ **Automatic context capture** (user agent, URL, etc.)
- ✅ **Production-ready** with proper code splitting

All errors are automatically logged to files in `./logs/` for debugging and monitoring.
