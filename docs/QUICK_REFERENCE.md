# Quick Reference - Constants & Schema Usage

## Import Patterns

### Constants

```typescript
// All constants (preferred)
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  TOKEN_CONFIG,
  PASSWORD_CONFIG,
  API_ENDPOINTS,
} from "@/constants";

// Specific constant files
import { ERROR_MESSAGES } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { TOKEN_CONFIG } from "@/constants/config";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
```

### API Client

```typescript
// API client
import { apiClient, API_ENDPOINTS, ApiClientError } from "@/lib/api-client";

// React hooks for API calls
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
```

### Database Schema

```typescript
// All schema exports
import {
  USER_COLLECTION,
  UserDocument,
  EMAIL_VERIFICATION_COLLECTION,
  PASSWORD_RESET_COLLECTION,
} from "@/db/schema";

// Specific schema
import { USER_COLLECTION, UserDocument } from "@/db/schema/users";
```

### Components

```typescript
// Form components
import {
  FormField,
  PasswordStrengthIndicator,
  ErrorBoundary,
} from "@/components";
```

## Common Patterns

### API Route Pattern

```typescript
import { NextRequest } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { validateRequest, yourSchema } from "@/lib/validation";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { YOUR_COLLECTION } from "@/db/schema";
import { adminDb } from "@/lib/firebase/admin";

export const POST = withAuth(async (request: NextRequest, session) => {
  // 1. Validate
  const validation = await validateRequest(request, yourSchema);
  if (!validation.success) {
    return ApiErrors.validationError(validation.details);
  }

  // 2. Business logic
  const data = await adminDb
    .collection(YOUR_COLLECTION)
    .doc(session.user.id)
    .get();

  if (!data.exists) {
    return ApiErrors.notFound("Resource");
  }

  // 3. Return
  return successResponse(result, SUCCESS_MESSAGES.YOUR_MODULE.SUCCESS);
});
```

### Form Component Pattern

```tsx
"use client";

import { useState } from "react";
import { FormField, Button } from "@/components";
import { useApiRequest } from "@/hooks/useApiRequest";
import { ERROR_MESSAGES, ROUTES } from "@/constants";

export function YourForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { loading, execute } = useApiRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await execute({
      url: ROUTES.API.YOUR_ENDPOINT,
      method: "POST",
      body: { email },
      onSuccess: () => {
        // Handle success
      },
      onError: (error) => {
        setErrors({ email: error });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label="Email"
        name="email"
        type="email"
        value={email}
        onChange={setEmail}
        error={errors.email}
        required
      />
      <Button type="submit" loading={loading}>
        Submit
      </Button>
    </form>
  );
}
```

## Available Constants

### Error Messages

- `ERROR_MESSAGES.AUTH.*` - Authentication errors
- `ERROR_MESSAGES.VALIDATION.*` - Validation errors
- `ERROR_MESSAGES.USER.*` - User/profile errors
- `ERROR_MESSAGES.PASSWORD.*` - Password errors
- `ERROR_MESSAGES.EMAIL.*` - Email verification errors
- `ERROR_MESSAGES.GENERIC.*` - Generic errors

### Success Messages

- `SUCCESS_MESSAGES.AUTH.*` - Auth success
- `SUCCESS_MESSAGES.USER.*` - User success
- `SUCCESS_MESSAGES.EMAIL.*` - Email success
- `SUCCESS_MESSAGES.PASSWORD.*` - Password success

### Routes

- `ROUTES.HOME` - Home page
- `ROUTES.AUTH.*` - Auth pages (LOGIN, REGISTER, etc.)
- `ROUTES.USER.*` - User pages (PROFILE, SETTINGS)
- `ROUTES.API.*` - API endpoints

### Configuration

- `TOKEN_CONFIG.EMAIL_VERIFICATION.*` - Email token config
- `TOKEN_CONFIG.PASSWORD_RESET.*` - Password reset config
- `PASSWORD_CONFIG.*` - Password requirements
- `VALIDATION_CONFIG.*` - Validation rules

### Collections

- `USER_COLLECTION` - 'users'
- `PRODUCT_COLLECTION` - 'products'
- `ORDER_COLLECTION` - 'orders'
- `REVIEW_COLLECTION` - 'reviews'
- `BID_COLLECTION` - 'bids'
- `SESSION_COLLECTION` - 'sessions'
- `CATEGORIES_COLLECTION` - 'categories'
- `COUPONS_COLLECTION` - 'coupons'
- `CAROUSEL_SLIDES_COLLECTION` - 'carouselSlides'
- `HOMEPAGE_SECTIONS_COLLECTION` - 'homepageSections'
- `SITE_SETTINGS_COLLECTION` - 'siteSettings'
- `FAQS_COLLECTION` - 'faqs'
- `EMAIL_VERIFICATION_COLLECTION` - 'emailVerificationTokens'
- `PASSWORD_RESET_COLLECTION` - 'passwordResetTokens'

## CLI Commands

```bash
# Build project
npm run build

# Merge database indices (add to package.json first)
npm run merge-indices

# Type check schemas
npm run validate-schema

# Check for hardcoded strings
npm run check-constants
```

## File Locations Quick Reference

```
Constants:           src/constants/
Database Schema:     src/db/schema/
Database Indices:    src/db/indices/
Error Boundary:      src/components/ErrorBoundary.tsx
Form Components:     src/components/FormField.tsx
                     src/components/PasswordStrengthIndicator.tsx
Auth Provider:       src/providers/AuthProvider.tsx
API Middleware:      src/lib/api-middleware.ts
API Response:        src/lib/api-response.ts
Validation:          src/lib/validation.ts
Tokens:              src/lib/tokens.ts
```

## Remember

✅ **DO:**

- Import from barrel files (`@/constants`, `@/db/schema`)
- Use constants for all strings and numbers
- Use `withAuth()` for authenticated routes
- Use `FormField` for form inputs
- Use `ErrorBoundary` at app boundaries

❌ **DON'T:**

- Hardcode error messages
- Use magic numbers
- Repeat validation logic
- Hardcode collection names
- Skip error handling
