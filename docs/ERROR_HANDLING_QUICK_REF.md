# Error Handling & Logging - Quick Reference

## 🚀 Quick Start

### 1. Initialization (Already Done)

The error logging system is automatically initialized in the root layout via `MonitoringProvider`.

### 2. Using Error Logging

#### Client-Side (React Components)

```typescript
import {
  logClientError,
  logApiError,
  logAuthError,
  logValidationError,
} from "@/helpers";

// Simple error logging
try {
  await someFunction();
} catch (error) {
  logClientError("Operation failed", error, {
    component: "MyComponent",
    userId: user.id,
  });
}

// API error logging
const response = await fetch("/api/data");
if (!response.ok) {
  await logApiError("/api/data", response, {
    component: "DataFetcher",
  });
}

// Auth error logging
try {
  await login(credentials);
} catch (error) {
  logAuthError("login", error, { email: credentials.email });
}

// Form validation error logging
if (Object.keys(errors).length > 0) {
  logValidationError("SignupForm", errors, {
    attemptedEmail: values.email,
  });
}
```

#### Server-Side (API Routes)

```typescript
// Import directly (not from @/helpers)
import {
  logApiRouteError,
  logDatabaseError,
  logServerAuthError,
} from "@/helpers/logging/server-error-logger";
import { handleApiError } from "@/lib/errors/error-handler";

export async function POST(request: NextRequest) {
  try {
    // Your code
    const user = await userRepository.create(data);
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    // Option 1: Use handleApiError (automatic logging + response)
    return handleApiError(error);

    // Option 2: Custom logging then handle
    logApiRouteError("/api/users", error, request);
    return handleApiError(error);
  }
}

// Database operation logging
try {
  await db.collection("users").doc(id).delete();
} catch (error) {
  logDatabaseError("delete", "users", error, { userId: id });
  throw error;
}
```

## 📋 Available Functions

### Client-Side (`@/helpers`)

| Function             | Use Case            | Example                                |
| -------------------- | ------------------- | -------------------------------------- |
| `logClientError`     | General errors      | Component crashes, data fetch failures |
| `logClientWarning`   | Non-critical issues | Slow operations, deprecated features   |
| `logClientInfo`      | Informational       | User actions, state changes            |
| `logApiError`        | API call failures   | Failed fetch requests                  |
| `logAuthError`       | Authentication      | Login/logout failures                  |
| `logValidationError` | Form validation     | Invalid input                          |
| `logUploadError`     | File uploads        | Upload failures                        |
| `logPaymentError`    | Payment issues      | Transaction failures                   |
| `logNavigationError` | Routing errors      | Navigation failures                    |

### Server-Side (`@/helpers/logging/server-error-logger`)

| Function                | Use Case              | Example                      |
| ----------------------- | --------------------- | ---------------------------- |
| `logServerError`        | General server errors | Unexpected exceptions        |
| `logApiRouteError`      | API route errors      | Request handling failures    |
| `logDatabaseError`      | Database operations   | Query failures               |
| `logServerAuthError`    | Auth operations       | Token validation             |
| `logAuthorizationError` | Permission denied     | Unauthorized access attempts |
| `logEmailError`         | Email sending         | Send failures                |
| `logStorageError`       | File storage          | Upload/delete failures       |
| `logExternalApiError`   | 3rd party APIs        | External service failures    |
| `logSlowOperation`      | Performance issues    | Slow queries/operations      |
| `logSecurityEvent`      | Security events       | Suspicious activity          |

## 🎯 Common Patterns

### Pattern 1: Fetch with Error Logging

```typescript
import { logApiError } from "@/helpers";

async function fetchData() {
  try {
    const response = await fetch("/api/data");

    if (!response.ok) {
      await logApiError("/api/data", response, {
        component: "DataFetcher",
        expectedStatus: 200,
      });
      throw new Error("Failed to fetch");
    }

    return await response.json();
  } catch (error) {
    logClientError("Data fetch failed", error, {
      component: "DataFetcher",
    });
    throw error;
  }
}
```

### Pattern 2: API Route with Logging

```typescript
import { handleApiError } from "@/lib/errors/error-handler";
import { NotFoundError, ValidationError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      throw new ValidationError("ID is required", "MISSING_ID");
    }

    const item = await repository.findById(id);

    if (!item) {
      throw new NotFoundError("Item not found");
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    // Automatically logs and returns formatted response
    return handleApiError(error);
  }
}
```

### Pattern 3: Form with Validation Logging

```typescript
import { useForm } from "@/hooks";
import { logValidationError } from "@/helpers";

const { values, errors, handleSubmit } = useForm({
  initialValues: { email: "", password: "" },
  validate: (values) => {
    const errors: Record<string, string> = {};

    if (!values.email) errors.email = "Required";
    if (!values.password) errors.password = "Required";

    if (Object.keys(errors).length > 0) {
      logValidationError("LoginForm", errors, {
        attemptedEmail: values.email,
      });
    }

    return errors;
  },
  onSubmit: async (values) => {
    // Submit logic
  },
});
```

### Pattern 4: Component with ErrorBoundary

```tsx
import { ErrorBoundary } from "@/components";

export default function MyPage() {
  return (
    <ErrorBoundary
      fallback={
        <div>
          <h1>Something went wrong</h1>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      }
    >
      <ComplexComponent />
    </ErrorBoundary>
  );
}
```

## 📁 Log Files

### Location

`./logs/` directory at project root

### Files

- `error-YYYY-MM-DD.log` - All errors
- `warn-YYYY-MM-DD.log` - Warnings (server-side)
- `info-YYYY-MM-DD.log` - Info logs (server-side)

### Viewing Logs

```bash
# View today's errors
cat logs/error-$(date +%Y-%m-%d).log

# Follow error log in real-time
tail -f logs/error-$(date +%Y-%m-%d).log

# Search for specific errors
grep "authentication" logs/error-*.log

# Count errors
grep -c "\[ERROR\]" logs/error-*.log
```

## ✅ Best Practices

1. **Always provide context**

   ```typescript
   // ✅ Good
   logClientError("Failed", error, {
     userId: user.id,
     component: "UserProfile",
     action: "updateProfile",
   });

   // ❌ Bad
   logClientError("Failed", error);
   ```

2. **Use categorized functions**

   ```typescript
   // ✅ Good
   logAuthError("login", error, context);

   // ❌ Bad
   logClientError("login error", error, context);
   ```

3. **Use handleApiError in API routes**

   ```typescript
   // ✅ Good
   catch (error) {
     return handleApiError(error);
   }

   // ❌ Bad
   catch (error) {
     console.error(error);
     return NextResponse.json({ error: 'Failed' });
   }
   ```

4. **Use typed error classes**

   ```typescript
   // ✅ Good
   throw new NotFoundError("User not found");

   // ❌ Bad
   throw new Error("User not found");
   ```

5. **Never log sensitive data**

   ```typescript
   // ❌ Never do this
   logClientError("Login failed", error, {
     password: user.password,
     token: authToken,
   });

   // ✅ Do this
   logAuthError("login", error, {
     email: user.email,
   });
   ```

## 🔍 Troubleshooting

### Logs not being written

1. Check `./logs/` directory exists and is writable
2. Verify `/api/logs/write` endpoint is accessible
3. Check console for API call errors

### Error pages not showing

1. Verify `error.tsx` and `global-error.tsx` exist
2. Ensure errors are not caught silently upstream
3. Check ErrorBoundary placement

### Missing context in logs

1. Always pass context object to logging functions
2. Include user ID when available
3. Add component/action identifiers

## 📚 Full Documentation

See [docs/ERROR_HANDLING.md](../docs/ERROR_HANDLING.md) for complete documentation.
