# `@lir/next` Package

**Package:** `packages/next/`  
**Alias:** `@lir/next`  
**Purpose:** Next.js-specific server-side utilities — auth verification interface and standardized API error handling factory.

---

## `IAuthVerifier`

**File:** `packages/next/src/IAuthVerifier.ts`

Interface that decouples API routes from the concrete Firebase Admin auth implementation. Enables testing API handlers without depending on Firebase.

### Types

```ts
interface AuthVerifiedUser {
  uid: string;
  email: string | null;
  role: "guest" | "user" | "seller" | "moderator" | "admin";
  emailVerified: boolean;
}

interface IAuthVerifier {
  /**
   * Verifies the HTTP-only __session cookie or Bearer token from the request.
   * Throws if the token is missing or invalid.
   */
  verifyRequest(req: NextRequest): Promise<AuthVerifiedUser>;

  /**
   * Returns the verified user or null without throwing.
   */
  tryVerifyRequest(req: NextRequest): Promise<AuthVerifiedUser | null>;
}
```

### Concrete Implementation

The production implementation lives in `src/lib/authVerifier.ts` and uses `firebase-admin/auth` to verify the `__session` cookie. It is injected into API handlers via `createApiHandler`.

```ts
// src/lib/authVerifier.ts
import { IAuthVerifier } from "@lir/next";

export const authVerifier: IAuthVerifier = {
  async verifyRequest(req) {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) throw new Error("UNAUTHORIZED");
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return mapDecodedTokenToUser(decoded);
  },
  async tryVerifyRequest(req) {
    try {
      return await this.verifyRequest(req);
    } catch {
      return null;
    }
  },
};
```

---

## `createApiErrorHandler`

**File:** `packages/next/src/api/errorHandler.ts`

Factory function that returns a standardized error handler for Next.js API route handlers. Normalizes thrown errors into consistent JSON error responses with correct HTTP status codes.

### Types

```ts
interface IApiErrorLogger {
  error(message: string, data?: Record<string, unknown>): void;
}

interface ApiErrorHandlerOptions {
  logger?: IApiErrorLogger; // defaults to console.error in production
  exposeStack?: boolean; // include stack trace in response (default: false)
}

type ApiErrorHandler = (error: unknown, req: NextRequest) => NextResponse;
```

### Usage

```ts
// src/app/api/products/route.ts
import { createApiErrorHandler } from "@lir/next";
import { serverLogger } from "@/lib/serverLogger";

const handleError = createApiErrorHandler({ logger: serverLogger });

export async function GET(req: NextRequest) {
  try {
    const products = await productRepository.list();
    return NextResponse.json({ products });
  } catch (err) {
    return handleError(err, req);
  }
}
```

### Error Mapping

`createApiErrorHandler` maps well-known error types to HTTP status codes:

| Error / Code        | Status | Body                                      |
| ------------------- | ------ | ----------------------------------------- |
| `UNAUTHORIZED`      | 401    | `{ error: "Unauthorized" }`               |
| `FORBIDDEN`         | 403    | `{ error: "Forbidden" }`                  |
| `NOT_FOUND`         | 404    | `{ error: "Not found" }`                  |
| `VALIDATION_ERROR`  | 422    | `{ error: "Validation failed", details }` |
| `CONFLICT`          | 409    | `{ error: "Conflict" }`                   |
| `TOO_MANY_REQUESTS` | 429    | `{ error: "Rate limit exceeded" }`        |
| `ZodError`          | 422    | `{ error: "Validation failed", fields }`  |
| Unknown             | 500    | `{ error: "Internal server error" }`      |

---

## `createApiHandler`

Thin wrapper combining auth verification + error handling into a single handler factory. Used in all authenticated API routes.

```ts
import { createApiHandler } from "@/lib/createApiHandler";

export const GET = createApiHandler(
  { auth: "user" }, // minimum required role
  async (req, { user }) => {
    const orders = await orderRepository.listByUser(user.uid);
    return NextResponse.json({ orders });
  },
);
```

Parameters:

- `auth`: `"public" | "user" | "seller" | "moderator" | "admin"` — minimum role requirement
- `handler`: async function receiving `(req, context)` where `context.user` is `AuthVerifiedUser | null`

The factory automatically:

1. Calls `authVerifier.verifyRequest()` if `auth !== "public"`
2. Returns 401/403 for auth failures
3. Wraps the handler in `handleError` for caught exceptions
