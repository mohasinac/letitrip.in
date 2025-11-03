# Next Actions - Product MVC Integration

## ✅ Completed

- Product Model (516 lines) - Transaction safety, optimistic locking, batch operations
- Product Controller (429 lines) - RBAC, business validations, audit logging
- Documentation (PRODUCT_MVC_COMPLETE.md)

---

## 🎯 Next: Refactor Product Routes

### Files to Update:

#### 1. `src/app/api/products/route.ts`

**Current:** Direct Firestore access  
**Target:** Use `productController`

**Methods to refactor:**

- `GET` → `productController.listProducts(filters, pagination, user)`
- `POST` → `productController.createProduct(data, user)`

**Pattern:**

```typescript
import { productController } from "../../_lib/controllers/product.controller";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 1. Parse query params
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      category: searchParams.get("category"),
      status: searchParams.get("status"),
      // ... etc
    };

    // 2. Get user context (from session/cookie - implement later)
    const user = await getUserFromRequest(request); // TODO

    // 3. Call controller
    const products = await productController.listProducts(filters, {}, user);

    // 4. Return response
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Parse body
    const body = await request.json();

    // 2. Validate with Zod
    const validated = createProductSchema.parse(body);

    // 3. Get user context
    const user = await getUserFromRequest(request); // Must be authenticated

    // 4. Call controller
    const product = await productController.createProduct(validated, user);

    // 5. Return response
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
```

---

#### 2. `src/app/api/products/[slug]/route.ts`

**Current:** Direct Firestore access  
**Target:** Use `productController`

**Methods to refactor:**

- `GET` → `productController.getProductBySlug(slug, user)`
- `PUT` → `productController.updateProduct(id, data, user, version)`
- `DELETE` → `productController.archiveProduct(id, user)`

---

## 🔐 Implement Authentication Helper

**Create:** `src/app/api/_lib/helpers/auth.ts`

```typescript
import { NextRequest } from "next/server";
import { UserContext } from "../controllers/product.controller";
import { getAdminAuth } from "../database/admin";
import { AuthenticationError } from "../middleware/error-handler";

/**
 * Extract user from HTTP-only cookie
 * This implements the user's requirement: "do not send the token to ui"
 */
export async function getUserFromRequest(
  request: NextRequest,
  required: boolean = false
): Promise<UserContext | undefined> {
  try {
    // 1. Get session cookie (HTTP-only)
    const sessionCookie = request.cookies.get("session")?.value;

    if (!sessionCookie) {
      if (required) {
        throw new AuthenticationError("Authentication required");
      }
      return undefined;
    }

    // 2. Verify session with Firebase Admin
    const auth = getAdminAuth();
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);

    // 3. Get user custom claims (role, sellerId)
    const userRecord = await auth.getUser(decodedToken.uid);
    const customClaims = userRecord.customClaims || {};

    // 4. Return user context
    return {
      uid: decodedToken.uid,
      role: customClaims.role || "user",
      sellerId: customClaims.sellerId,
      email: decodedToken.email,
    };
  } catch (error) {
    console.error("[Auth] Error verifying session:", error);
    if (required) {
      throw new AuthenticationError("Invalid or expired session");
    }
    return undefined;
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<UserContext> {
  const user = await getUserFromRequest(request, true);
  if (!user) {
    throw new AuthenticationError("Authentication required");
  }
  return user;
}

/**
 * Require specific role
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: ("admin" | "seller" | "user")[]
): Promise<UserContext> {
  const user = await requireAuth(request);

  if (!allowedRoles.includes(user.role)) {
    throw new AuthenticationError(
      `Insufficient permissions. Required: ${allowedRoles.join(" or ")}`
    );
  }

  return user;
}
```

---

## 🍪 HTTP-Only Cookie Authentication Flow

### Login Flow:

```typescript
// POST /api/auth/login
export async function POST(request: NextRequest) {
  const { idToken } = await request.json();

  // Create session cookie (5 days)
  const auth = getAdminAuth();
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: 5 * 24 * 60 * 60 * 1000, // 5 days
  });

  // Set HTTP-only cookie
  const response = NextResponse.json({ success: true });
  response.cookies.set("session", sessionCookie, {
    httpOnly: true, // ✅ Not accessible from JavaScript
    secure: true, // ✅ HTTPS only
    sameSite: "lax", // ✅ CSRF protection
    maxAge: 5 * 24 * 60 * 60, // 5 days
    path: "/",
  });

  return response;
}
```

### Why HTTP-Only Cookies?

- ✅ **XSS Protection**: JavaScript cannot access the cookie
- ✅ **No Token in UI**: Token never sent to client-side code
- ✅ **CSRF Protection**: SameSite attribute prevents cross-site requests
- ✅ **Automatic**: Browser sends cookie with every request
- ✅ **Secure**: HTTPS-only transmission

---

## 📋 Step-by-Step Refactoring

### Step 1: Create Auth Helper

```bash
# Create the file
New-Item -Path "src/app/api/_lib/helpers/auth.ts" -ItemType File
```

### Step 2: Refactor Products Route

1. Read current `src/app/api/products/route.ts`
2. Replace Firestore logic with controller calls
3. Add authentication
4. Test with REST client

### Step 3: Refactor Product by Slug Route

1. Read current `src/app/api/products/[slug]/route.ts`
2. Replace Firestore logic with controller calls
3. Add authentication
4. Test with REST client

### Step 4: Implement Login/Logout

1. Create `src/app/api/auth/login/route.ts`
2. Create `src/app/api/auth/logout/route.ts`
3. Set HTTP-only cookies

### Step 5: Test End-to-End

1. Login → Get session cookie
2. Create product → Use cookie for auth
3. Update product → Verify RBAC
4. Logout → Clear cookie

---

## 🧪 Testing Checklist

### Product Endpoints:

- [ ] `GET /api/products` - List products (public)
- [ ] `GET /api/products?status=draft` - List drafts (seller only)
- [ ] `POST /api/products` - Create product (seller/admin)
- [ ] `GET /api/products/[slug]` - Get product (public for active)
- [ ] `PUT /api/products/[slug]` - Update product (owner/admin)
- [ ] `DELETE /api/products/[slug]` - Archive product (owner/admin)

### RBAC Tests:

- [ ] Public user can view active products
- [ ] Public user cannot view drafts
- [ ] Seller can create products
- [ ] Seller can only edit their own products
- [ ] Seller cannot edit other seller's products
- [ ] Admin can edit any product
- [ ] User role cannot create products

### Concurrency Tests:

- [ ] Two users update same product → Second gets ConflictError
- [ ] Two users decrease inventory → Both succeed, final count correct
- [ ] Create product with duplicate slug → ConflictError

---

## 📝 Commands to Run

```powershell
# 1. Check current products route
code src/app/api/products/route.ts

# 2. Check current product by slug route
code src/app/api/products/[slug]/route.ts

# 3. Create auth helper directory
New-Item -Path "src/app/api/_lib/helpers" -ItemType Directory -Force

# 4. Create auth helper file
New-Item -Path "src/app/api/_lib/helpers/auth.ts" -ItemType File
```

---

## 💡 Tips

1. **Start Simple**: Refactor GET endpoints first (read-only, easier)
2. **Test Incrementally**: Test each endpoint after refactoring
3. **Use REST Client**: VS Code extension for testing
4. **Check Logs**: Console logs in controller show what's happening
5. **Version Control**: Commit after each successful refactor

---

**Let me know when you're ready to start refactoring the routes!** 🚀
