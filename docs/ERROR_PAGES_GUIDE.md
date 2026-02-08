# Error Pages & Error Handling Guide

Complete guide to error handling and error pages in the LetItRip application.

## 📑 Table of Contents

- [Error Pages](#error-pages)
- [Client-Side Error Handling](#client-side-error-handling)
- [API Error Responses](#api-error-responses)
- [Best Practices](#best-practices)
- [Testing Error Pages](#testing-error-pages)

---

## Error Pages

### Available Error Pages

| Page                 | Route               | Status Codes | Use Case                                 |
| -------------------- | ------------------- | ------------ | ---------------------------------------- |
| **Generic Error**    | `/error.tsx`        | Any          | Runtime errors, caught by error boundary |
| **Global Error**     | `/global-error.tsx` | Any          | Root-level critical failures             |
| **404 Not Found**    | `/not-found.tsx`    | 404          | Non-existent routes                      |
| **401 Unauthorized** | `/unauthorized`     | 401, 403     | Auth/permission failures                 |

### Error Page Features

All error pages include:

- ✅ **Theme Support** - Automatically adapts to light/dark mode
- ✅ **User-Friendly Messages** - Clear, non-technical explanations
- ✅ **Navigation Options** - Easy return to home or retry
- ✅ **Development Info** - Detailed error messages in dev mode only
- ✅ **Responsive Design** - Works on all screen sizes

### Error Page Structure

```tsx
// Standard error page layout
<div className="min-h-screen flex items-center justify-center">
  <div className="max-w-2xl w-full text-center">
    {/* Error Icon */}
    {/* Large Error Code (404, 401, etc.) */}
    {/* Error Title */}
    {/* Error Description */}
    {/* Action Buttons (Home, Retry, Login) */}
  </div>
</div>
```

---

## Client-Side Error Handling

### Method 1: useErrorRedirect Hook (Recommended)

```tsx
"use client";

import { useErrorRedirect } from "@/lib/errors";

export function MyComponent() {
  const { redirectOnError } = useErrorRedirect();

  const handleAction = async () => {
    try {
      const response = await fetch("/api/protected");

      if (!response.ok) {
        // Auto-redirects to appropriate error page
        redirectOnError(response.status);
        return;
      }

      // Process successful response
      const data = await response.json();
    } catch (error) {
      console.error(error);
      redirectOnError(500);
    }
  };

  return <button onClick={handleAction}>Fetch Data</button>;
}
```

### Method 2: checkResponseOrRedirect Helper

```tsx
"use client";

import { checkResponseOrRedirect } from "@/lib/errors";
import { useRouter } from "next/navigation";

export function MyComponent() {
  const router = useRouter();

  const handleAction = async () => {
    try {
      const response = await fetch("/api/data");

      // Validates response and redirects if error
      const isOk = await checkResponseOrRedirect(response, router);
      if (!isOk) return;

      const data = await response.json();
      // Process data...
    } catch (error) {
      console.error(error);
    }
  };

  return <button onClick={handleAction}>Fetch Data</button>;
}
```

### Method 3: Manual Redirect

```tsx
"use client";

import { redirectOnError } from "@/lib/errors";

const response = await fetch("/api/endpoint");
if (!response.ok) {
  redirectOnError(response.status); // No router needed
}
```

### Redirect Behavior by Status Code

| Status Code | Redirect Destination   | Additional Actions            |
| ----------- | ---------------------- | ----------------------------- |
| **401**     | `/unauthorized`        | Shows login button            |
| **403**     | `/unauthorized`        | Shows "no permission" message |
| **404**     | `/not-found`           | Shows home button             |
| **500+**    | Error boundary catches | Shows retry button            |

---

## API Error Responses

### Standard API Error Format

All API routes return errors in this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE_CONSTANT",
  "data": {
    /* optional additional context */
  }
}
```

### Common API Error Status Codes

| Status  | Meaning               | Example                               |
| ------- | --------------------- | ------------------------------------- |
| **400** | Bad Request           | Validation error, missing parameters  |
| **401** | Unauthorized          | Not authenticated, invalid token      |
| **403** | Forbidden             | Insufficient permissions for resource |
| **404** | Not Found             | Resource doesn't exist                |
| **500** | Internal Server Error | Database error, unexpected exception  |

### API Error Handling Example

```tsx
const response = await fetch("/api/users");

if (response.status === 401) {
  // User not logged in - redirect to login
  window.location.href = "/auth/login";
  return;
}

if (response.status === 403) {
  // User lacks permission - show error page
  redirectOnError(403);
  return;
}

if (!response.ok) {
  const error = await response.json();
  console.error("API Error:", error);
  showToast(error.error); // Show user-friendly message
  return;
}

const data = await response.json();
```

---

## Best Practices

### ✅ Do This

1. **Use Error Boundaries**

   ```tsx
   // Pages automatically use error.tsx boundary
   // No manual ErrorBoundary needed
   ```

2. **Handle API Errors Gracefully**

   ```tsx
   try {
     const response = await fetch("/api/data");
     if (!response.ok) {
       redirectOnError(response.status);
       return;
     }
   } catch (error) {
     console.error("Network error:", error);
     redirectOnError(500);
   }
   ```

3. **Show User-Friendly Messages**

   ```tsx
   // Use constants from UI_LABELS
   import { UI_LABELS } from "@/constants";

   <p>{UI_LABELS.ERROR_PAGES.UNAUTHORIZED.DESCRIPTION}</p>;
   ```

4. **Provide Navigation Options**
   ```tsx
   <Link href={ROUTES.HOME}>
     <Button>Back to Home</Button>
   </Link>
   ```

### ❌ Avoid This

1. **Don't Expose Technical Details in Production**

   ```tsx
   // ❌ BAD
   <p>Error: {error.stack}</p>;

   // ✅ GOOD
   {
     process.env.NODE_ENV === "development" && <p>{error.stack}</p>;
   }
   ```

2. **Don't Leave Users Stuck**

   ```tsx
   // ❌ BAD - No way to navigate
   <div>Error occurred</div>

   // ✅ GOOD - Provide navigation
   <div>
     <p>Error occurred</p>
     <Button onClick={() => router.push('/')}>Go Home</Button>
   </div>
   ```

3. **Don't Ignore Error Status Codes**

   ```tsx
   // ❌ BAD
   const response = await fetch("/api/data");
   const data = await response.json(); // Might fail!

   // ✅ GOOD
   const response = await fetch("/api/data");
   if (!response.ok) {
     redirectOnError(response.status);
     return;
   }
   const data = await response.json();
   ```

---

## Testing Error Pages

### Test in Development

1. **Test 404 Page**

   ```
   Navigate to: http://localhost:3000/non-existent-page
   Expected: 404 page with "Back to Home" button
   ```

2. **Test Unauthorized Page**

   ```
   Navigate to: http://localhost:3000/unauthorized
   Expected: 401 page with "Login" and "Back to Home" buttons
   ```

3. **Test Runtime Error**

   ```tsx
   // Create a component that throws error
   export function TestError() {
     throw new Error('Test error');
   }

   Expected: error.tsx boundary catches it
   ```

4. **Test API Error Redirect**
   ```tsx
   // Call protected API without auth
   const response = await fetch("/api/admin/users");
   redirectOnError(response.status); // Should redirect to /unauthorized
   ```

### Manual Testing Checklist

- [ ] 404 page displays on invalid routes
- [ ] Unauthorized page shows login button
- [ ] Error page shows retry button
- [ ] All error pages have "Back to Home"
- [ ] Theme switching works on error pages
- [ ] Error details only show in development
- [ ] Navigation buttons work correctly
- [ ] Mobile layout looks good

### Network Error Testing

```tsx
// Simulate network error
try {
  await fetch("/api/offline-endpoint");
} catch (error) {
  redirectOnError(500); // Should show error page
}
```

---

## Error Constants Reference

### Error Page Labels (UI_LABELS.ERROR_PAGES)

```tsx
import { UI_LABELS } from "@/constants";

// 404 Not Found
UI_LABELS.ERROR_PAGES.NOT_FOUND.TITLE;
UI_LABELS.ERROR_PAGES.NOT_FOUND.DESCRIPTION;

// 401 Unauthorized
UI_LABELS.ERROR_PAGES.UNAUTHORIZED.TITLE;
UI_LABELS.ERROR_PAGES.UNAUTHORIZED.DESCRIPTION;

// Generic Error
UI_LABELS.ERROR_PAGES.GENERIC_ERROR.TITLE;
UI_LABELS.ERROR_PAGES.GENERIC_ERROR.DESCRIPTION;
```

### Error Routes (ROUTES.ERRORS)

```tsx
import { ROUTES } from "@/constants";

ROUTES.ERRORS.UNAUTHORIZED; // "/unauthorized"
ROUTES.ERRORS.NOT_FOUND; // "/404"
```

---

## Summary

- ✅ **4 error pages** covering all common scenarios
- ✅ **3 redirect utilities** for easy error handling
- ✅ **Theme-aware** styling with light/dark mode
- ✅ **User-friendly** messages and navigation
- ✅ **Production-ready** with development-only details
- ✅ **Standards compliant** with coding standards #6

For more examples, see: `src/examples/error-redirect-examples.tsx`
