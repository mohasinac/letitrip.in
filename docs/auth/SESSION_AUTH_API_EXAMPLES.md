# 🔐 Session Auth API Examples

## Basic Protected Route

```typescript
// src/app/(backend)/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withSessionAuth } from "@/lib/auth/session-middleware";
import { getAdminDb } from "@/lib/database/admin";

export async function GET(request: NextRequest) {
  // Validate session
  const result = await withSessionAuth(request);

  if (result.error) {
    return result.error;
  }

  const { session } = result;

  // Fetch user data
  const db = getAdminDb();
  const userDoc = await db.collection("users").doc(session.userId).get();

  return NextResponse.json({
    success: true,
    data: userDoc.data(),
  });
}

export async function PATCH(request: NextRequest) {
  const result = await withSessionAuth(request);

  if (result.error) {
    return result.error;
  }

  const { session } = result;
  const updates = await request.json();

  // Update user profile
  const db = getAdminDb();
  await db.collection("users").doc(session.userId).update(updates);

  return NextResponse.json({
    success: true,
    message: "Profile updated",
  });
}
```

---

## Admin-Only Route

```typescript
// src/app/(backend)/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withSessionAuth } from "@/lib/auth/session-middleware";
import { getAdminDb } from "@/lib/database/admin";

export async function GET(request: NextRequest) {
  // Require admin role
  const result = await withSessionAuth(request, { requireAdmin: true });

  if (result.error) {
    return result.error; // 401 or 403
  }

  const db = getAdminDb();
  const usersSnapshot = await db.collection("users").limit(100).get();

  const users = usersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json({
    success: true,
    data: users,
  });
}

export async function POST(request: NextRequest) {
  const result = await withSessionAuth(request, { requireAdmin: true });

  if (result.error) {
    return result.error;
  }

  const userData = await request.json();

  // Create new user (admin only)
  const db = getAdminDb();
  const userRef = await db.collection("users").add(userData);

  return NextResponse.json(
    {
      success: true,
      data: { id: userRef.id, ...userData },
    },
    { status: 201 }
  );
}
```

---

## Seller Route (Seller or Admin)

```typescript
// src/app/(backend)/api/seller/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withSessionAuth } from "@/lib/auth/session-middleware";
import { getAdminDb } from "@/lib/database/admin";

export async function GET(request: NextRequest) {
  // Require seller or admin role
  const result = await withSessionAuth(request, { requireSeller: true });

  if (result.error) {
    return result.error;
  }

  const { session } = result;

  // Get products for this seller (admins see all)
  const db = getAdminDb();
  let query = db.collection("products");

  if (session.role === "seller") {
    query = query.where("sellerId", "==", session.userId);
  }

  const snapshot = await query.get();
  const products = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json({
    success: true,
    data: products,
  });
}

export async function POST(request: NextRequest) {
  const result = await withSessionAuth(request, { requireSeller: true });

  if (result.error) {
    return result.error;
  }

  const { session } = result;
  const productData = await request.json();

  // Create product for this seller
  const db = getAdminDb();
  const productRef = await db.collection("products").add({
    ...productData,
    sellerId: session.userId,
    createdAt: new Date(),
  });

  return NextResponse.json(
    {
      success: true,
      data: { id: productRef.id },
    },
    { status: 201 }
  );
}
```

---

## Public + Authenticated Route

```typescript
// src/app/(backend)/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withSessionAuth } from "@/lib/auth/session-middleware";
import { getAdminDb } from "@/lib/database/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getAdminDb();
  const productDoc = await db.collection("products").doc(params.id).get();

  if (!productDoc.exists) {
    return NextResponse.json(
      { success: false, error: "Product not found" },
      { status: 404 }
    );
  }

  const productData = productDoc.data();

  // Check if user is authenticated (optional)
  const result = await withSessionAuth(request, { requireAuth: false });

  // Add user-specific data if authenticated
  if (!result.error && result.session) {
    // Add to recently viewed, check if in wishlist, etc.
    const userId = result.session.userId;

    const wishlistDoc = await db.collection("wishlists").doc(userId).get();

    const isInWishlist =
      wishlistDoc.exists && wishlistDoc.data()?.productIds?.includes(params.id);

    return NextResponse.json({
      success: true,
      data: {
        ...productData,
        isInWishlist,
      },
    });
  }

  // Return public data
  return NextResponse.json({
    success: true,
    data: productData,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Only owner or admin can update
  const result = await withSessionAuth(request);

  if (result.error) {
    return result.error;
  }

  const { session } = result;
  const updates = await request.json();

  const db = getAdminDb();
  const productDoc = await db.collection("products").doc(params.id).get();

  if (!productDoc.exists) {
    return NextResponse.json(
      { success: false, error: "Product not found" },
      { status: 404 }
    );
  }

  const product = productDoc.data();

  // Check ownership
  if (session.role !== "admin" && product?.sellerId !== session.userId) {
    return NextResponse.json(
      { success: false, error: "You do not own this product" },
      { status: 403 }
    );
  }

  await productDoc.ref.update(updates);

  return NextResponse.json({
    success: true,
    message: "Product updated",
  });
}
```

---

## File Upload with Authentication

```typescript
// src/app/(backend)/api/upload/avatar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withSessionAuth } from "@/lib/auth/session-middleware";
import { getAdminDb, getAdminStorage } from "@/lib/database/admin";

export async function POST(request: NextRequest) {
  const result = await withSessionAuth(request);

  if (result.error) {
    return result.error;
  }

  const { session } = result;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Upload to Firebase Storage
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    const fileName = `avatars/${session.userId}/${Date.now()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    const fileRef = bucket.file(fileName);
    await fileRef.save(Buffer.from(fileBuffer), {
      metadata: {
        contentType: file.type,
      },
    });

    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    // Update user profile
    const db = getAdminDb();
    await db.collection("users").doc(session.userId).update({
      avatar: publicUrl,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: { url: publicUrl },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

## Pagination with Authentication

```typescript
// src/app/(backend)/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withSessionAuth } from "@/lib/auth/session-middleware";
import { getAdminDb } from "@/lib/database/admin";

export async function GET(request: NextRequest) {
  const result = await withSessionAuth(request);

  if (result.error) {
    return result.error;
  }

  const { session } = result;
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");

  const db = getAdminDb();
  let query = db.collection("orders");

  // Filter by user (non-admins only see their orders)
  if (session.role !== "admin") {
    query = query.where("userId", "==", session.userId);
  }

  // Filter by status
  if (status) {
    query = query.where("status", "==", status);
  }

  // Pagination
  const offset = (page - 1) * limit;
  query = query.orderBy("createdAt", "desc").limit(limit).offset(offset);

  const snapshot = await query.get();
  const orders = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Get total count
  const countQuery = db.collection("orders");
  if (session.role !== "admin") {
    countQuery.where("userId", "==", session.userId);
  }
  const countSnapshot = await countQuery.count().get();
  const total = countSnapshot.data().count;

  return NextResponse.json({
    success: true,
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}
```

---

## Batch Operations

```typescript
// src/app/(backend)/api/admin/users/bulk-delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withSessionAuth } from "@/lib/auth/session-middleware";
import { getAdminDb } from "@/lib/database/admin";

export async function POST(request: NextRequest) {
  // Only admins can bulk delete
  const result = await withSessionAuth(request, { requireAdmin: true });

  if (result.error) {
    return result.error;
  }

  const { userIds } = await request.json();

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json(
      { success: false, error: "Invalid user IDs" },
      { status: 400 }
    );
  }

  const db = getAdminDb();
  const batch = db.batch();

  // Add all deletes to batch
  userIds.forEach((userId) => {
    const userRef = db.collection("users").doc(userId);
    batch.delete(userRef);
  });

  // Commit batch
  await batch.commit();

  return NextResponse.json({
    success: true,
    message: `Deleted ${userIds.length} users`,
  });
}
```

---

## Real-time Updates (WebSocket)

```typescript
// src/app/(backend)/api/notifications/stream/route.ts
import { NextRequest } from "next/server";
import { withSessionAuth } from "@/lib/auth/session-middleware";

export async function GET(request: NextRequest) {
  const result = await withSessionAuth(request);

  if (result.error) {
    return result.error;
  }

  const { session } = result;

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const message = `data: ${JSON.stringify({
        type: "connected",
        userId: session.userId,
      })}\n\n`;
      controller.enqueue(encoder.encode(message));

      // Set up notification listener
      const interval = setInterval(() => {
        // Send keep-alive or notifications
        const ping = `data: ${JSON.stringify({ type: "ping" })}\n\n`;
        controller.enqueue(encoder.encode(ping));
      }, 30000);

      // Cleanup
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

---

## Error Handling Helper

```typescript
// src/lib/api/error-handler.ts
import { NextResponse } from "next/server";

export function handleApiError(error: any, context: string = "") {
  console.error(`API Error ${context}:`, error);

  if (error.code === "permission-denied") {
    return NextResponse.json(
      { success: false, error: "Permission denied" },
      { status: 403 }
    );
  }

  if (error.code === "not-found") {
    return NextResponse.json(
      { success: false, error: "Resource not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { success: false, error: error.message || "Internal server error" },
    { status: 500 }
  );
}

// Usage in routes
export async function GET(request: NextRequest) {
  try {
    const result = await withSessionAuth(request);

    if (result.error) {
      return result.error;
    }

    // Your logic here
  } catch (error) {
    return handleApiError(error, "GET /api/example");
  }
}
```

---

## Rate Limiting with Session

```typescript
// src/lib/auth/rate-limit.ts
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  userId: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = requestCounts.get(userId);

  if (record) {
    if (now > record.resetAt) {
      requestCounts.set(userId, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  requestCounts.set(userId, { count: 1, resetAt: now + windowMs });
  return true;
}

// Usage
export async function POST(request: NextRequest) {
  const result = await withSessionAuth(request);

  if (result.error) {
    return result.error;
  }

  const { session } = result;

  if (!checkRateLimit(session.userId, 10, 60000)) {
    return NextResponse.json(
      { success: false, error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  // Process request
}
```

---

These examples show the most common patterns you'll need. The key points:

1. ✅ Always use `withSessionAuth()` for protected routes
2. ✅ Check role requirements with `requireAdmin` or `requireSeller` options
3. ✅ Access user info from `session.userId`, `session.email`, `session.role`
4. ✅ No need to manually handle tokens or headers
5. ✅ Session cookie is automatically validated on each request
