# 🚀 API Client - Complete Implementation Guide

**Next Steps to Complete the Architecture**  
**Est. Time:** 2-3 days of focused work  
**Date:** November 3, 2025

---

## ✅ What's Already Done

1. **Foundation Layer** ✅

   - Response types
   - Endpoint constants
   - Query builders

2. **Validation Layer** ✅

   - Product validator

3. **Frontend Services** ✅

   - Products service
   - Orders service
   - Users service
   - Reviews service
   - Service index

4. **Custom Hooks** ✅
   - useProducts
   - useOrders
   - useReviews

---

## 📋 Remaining Work

### Day 1-2: Backend Layer

#### Step 1: Create Remaining Validators

Create these files with Zod schemas:

1. **`src/lib/backend/validators/order.validator.ts`**

```typescript
import { z } from "zod";

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  shippingAddressId: z.string(),
  billingAddressId: z.string(),
  paymentMethod: z.enum(["razorpay", "cod"]),
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  notes: z.string().optional(),
});

export const orderFiltersSchema = z.object({
  status: z
    .enum([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ])
    .optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});
```

2. **`src/lib/backend/validators/user.validator.ts`**
3. **`src/lib/backend/validators/review.validator.ts`**

#### Step 2: Create Models (Database Layer)

Create these files:

1. **`src/lib/backend/models/products.model.ts`**

```typescript
import { getAdminDb } from "@/lib/database/admin";
import type { Product } from "@/types";

export class ProductsModel {
  private db = getAdminDb();
  private collection = "products";

  async findAll(filters: any): Promise<Product[]> {
    let query = this.db
      .collection(this.collection)
      .where("status", "==", "active");

    if (filters.category) {
      query = query.where("categoryId", "==", filters.category);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const snapshot = await this.db
      .collection(this.collection)
      .where("slug", "==", slug)
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Product;
  }

  async findById(id: string): Promise<Product | null> {
    const doc = await this.db.collection(this.collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Product;
  }

  async create(data: Partial<Product>): Promise<Product> {
    const docRef = await this.db.collection(this.collection).add({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Product;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    await this.db
      .collection(this.collection)
      .doc(id)
      .update({
        ...data,
        updatedAt: new Date().toISOString(),
      });

    const doc = await this.db.collection(this.collection).doc(id).get();
    return { id: doc.id, ...doc.data() } as Product;
  }

  async delete(id: string): Promise<void> {
    await this.db.collection(this.collection).doc(id).delete();
  }

  async getStats(): Promise<any> {
    const snapshot = await this.db.collection(this.collection).get();
    const products = snapshot.docs.map((doc) => doc.data());

    return {
      total: products.length,
      active: products.filter((p) => p.status === "active").length,
      draft: products.filter((p) => p.status === "draft").length,
      archived: products.filter((p) => p.status === "archived").length,
      outOfStock: products.filter((p) => (p.quantity || 0) === 0).length,
      lowStock: products.filter(
        (p) =>
          (p.quantity || 0) > 0 &&
          (p.quantity || 0) < (p.lowStockThreshold || 10)
      ).length,
      inStock: products.filter(
        (p) => (p.quantity || 0) >= (p.lowStockThreshold || 10)
      ).length,
      totalValue: products.reduce(
        (sum, p) => sum + (p.price || 0) * (p.quantity || 0),
        0
      ),
    };
  }
}
```

2. **`src/lib/backend/models/orders.model.ts`**
3. **`src/lib/backend/models/users.model.ts`**
4. **`src/lib/backend/models/reviews.model.ts`**

#### Step 3: Create Controllers (Business Logic)

Create these files:

1. **`src/lib/backend/controllers/products.controller.ts`**

```typescript
import { ProductsModel } from "../models/products.model";
import {
  productFiltersSchema,
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator";
import type { Product } from "@/types";

export class ProductsController {
  private model = new ProductsModel();

  async list(params: unknown) {
    // Validate
    const filters = productFiltersSchema.parse(params);

    // Get data
    let products = await this.model.findAll(filters);

    // Apply in-memory filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.minPrice) {
      products = products.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice) {
      products = products.filter((p) => p.price <= filters.maxPrice!);
    }

    // Sort
    if (filters.sort) {
      switch (filters.sort) {
        case "price-asc":
          products.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          products.sort((a, b) => b.price - a.price);
          break;
        case "newest":
          products.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
      }
    }

    // Paginate
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      items: products.slice(start, end),
      total: products.length,
      page,
      limit,
      totalPages: Math.ceil(products.length / limit),
      hasMore: end < products.length,
    };
  }

  async getBySlug(slug: string) {
    const product = await this.model.findBySlug(slug);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  async create(data: unknown, userId: string) {
    const validated = createProductSchema.parse(data);

    // Check duplicate slug
    const existing = await this.model.findBySlug(validated.slug);
    if (existing) {
      throw new Error("Product with this slug already exists");
    }

    return await this.model.create({
      ...validated,
      sellerId: userId,
      status: "draft",
    });
  }

  async update(id: string, data: unknown, userId: string, userRole: string) {
    const validated = updateProductSchema.parse(data);

    const product = await this.model.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check ownership
    if (userRole !== "admin" && product.sellerId !== userId) {
      throw new Error("Unauthorized");
    }

    return await this.model.update(id, validated);
  }

  async delete(id: string, userId: string, userRole: string) {
    const product = await this.model.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    if (userRole !== "admin" && product.sellerId !== userId) {
      throw new Error("Unauthorized");
    }

    await this.model.delete(id);
  }

  async getStats() {
    return await this.model.getStats();
  }
}
```

2. **`src/lib/backend/controllers/orders.controller.ts`**
3. **`src/lib/backend/controllers/users.controller.ts`**
4. **`src/lib/backend/controllers/reviews.controller.ts`**

---

### Day 2-3: Refactor API Routes

Update existing API routes to use controllers:

#### Example: `src/app/api/products/route.ts`

**Before:**

```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const db = getAdminDb();

    // ... lots of code ...

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

**After:**

```typescript
import { NextRequest } from "next/server";
import { ProductsController } from "@/lib/backend/controllers/products.controller";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/api/responses";

const controller = new ProductsController();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const params = {
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      sort: searchParams.get("sort") || undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
    };

    const result = await controller.list(params);

    return Response.json(createSuccessResponse(result), { status: 200 });
  } catch (error: any) {
    console.error("GET /api/products error:", error);

    // Validation errors
    if (error.name === "ZodError") {
      return Response.json(
        createErrorResponse("Validation failed", error.flatten().fieldErrors),
        { status: 400 }
      );
    }

    // Other errors
    return Response.json(
      createErrorResponse(error.message || "Failed to fetch products"),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdmin(request);
    if (!user) {
      return Response.json(createErrorResponse("Unauthorized"), {
        status: 401,
      });
    }

    const body = await request.json();
    const product = await controller.create(body, user.uid);

    return Response.json(createSuccessResponse(product, "Product created"), {
      status: 201,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return Response.json(
        createErrorResponse("Validation failed", error.flatten().fieldErrors),
        { status: 400 }
      );
    }

    return Response.json(
      createErrorResponse(error.message || "Failed to create product"),
      { status: 500 }
    );
  }
}
```

#### Refactor these routes:

1. `src/app/api/products/route.ts` ✅
2. `src/app/api/products/[slug]/route.ts` ✅
3. `src/app/api/admin/products/route.ts` ✅
4. `src/app/api/admin/products/stats/route.ts` ✅
5. `src/app/api/orders/route.ts`
6. `src/app/api/orders/[id]/route.ts`
7. `src/app/api/orders/create/route.ts`
8. `src/app/api/admin/orders/route.ts`
9. `src/app/api/admin/orders/stats/route.ts`
10. `src/app/api/user/profile/route.ts`
11. `src/app/api/reviews/route.ts`
12. `src/app/api/admin/reviews/route.ts`

---

### Day 3-4: Migrate UI Components

#### Step 1: Find All fetch() Calls

Run this command:

```powershell
# Find fetch calls
grep -r "fetch\('/api" src/app src/components --include="*.tsx" --include="*.ts" > fetch-calls.txt

# Find Firestore imports
grep -r "getFirestore\|getAdminDb" src/app src/components --include="*.tsx" --include="*.ts" > firestore-calls.txt
```

#### Step 2: Migrate Components One by One

**Example Migration:**

**Before:** `src/app/products/page.tsx`

```tsx
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data.products);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**After:**

```tsx
import { useProducts } from "@/hooks/useProducts";

export default function ProductsPage() {
  const { products, loading, error } = useProducts();

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

#### Priority Migration Order:

1. Public product pages (high traffic)
2. Order pages (critical functionality)
3. User profile pages
4. Admin pages
5. Other pages

---

### Day 4-5: Testing

#### Unit Tests

Create test files:

1. **`src/lib/backend/validators/__tests__/product.validator.test.ts`**

```typescript
import { validateProduct, validateProductFilters } from "../product.validator";

describe("Product Validator", () => {
  it("should validate correct product data", () => {
    const data = {
      name: "Test Product",
      slug: "test-product",
      description: "Test description that is long enough",
      price: 100,
      sku: "TEST-001",
      quantity: 10,
      weight: 1,
      images: [{ url: "https://example.com/image.jpg", alt: "Test", order: 0 }],
      category: "cat-123",
      sellerId: "seller-123",
    };

    const result = validateProduct(data);
    expect(result).toMatchObject(data);
  });

  it("should reject invalid price", () => {
    const data = { /* ... */ price: -10 };
    expect(() => validateProduct(data)).toThrow();
  });
});
```

2. **Controller tests**
3. **Model tests**
4. **Service tests**

#### Integration Tests

Test API routes:

```typescript
// __tests__/api/products.test.ts
import { GET, POST } from "@/app/api/products/route";

describe("GET /api/products", () => {
  it("should return paginated products", async () => {
    const request = new Request(
      "http://localhost/api/products?page=1&limit=20"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty("items");
  });
});
```

#### Manual Testing Checklist

Test these flows:

- [ ] Browse products
- [ ] View product details
- [ ] Add to cart
- [ ] Create order
- [ ] View orders
- [ ] Update profile
- [ ] Add/edit/delete address
- [ ] Write review
- [ ] Admin: Manage products
- [ ] Admin: Manage orders
- [ ] Admin: Manage reviews
- [ ] Seller: Add product
- [ ] Seller: View orders

---

## 🎯 Final Checklist

### Backend

- [ ] All validators created
- [ ] All models created
- [ ] All controllers created
- [ ] API routes refactored
- [ ] Error handling consistent
- [ ] Validation errors properly formatted

### Frontend

- [ ] All fetch() calls replaced
- [ ] All Firestore calls removed from UI
- [ ] Components using hooks
- [ ] Error handling updated
- [ ] Loading states implemented

### Testing

- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Manual testing complete
- [ ] No regressions found
- [ ] Performance verified

### Documentation

- [ ] API docs updated
- [ ] Component migration notes
- [ ] Known issues documented
- [ ] Team trained

---

## 🚨 Common Pitfalls to Avoid

1. **Don't skip validation**

   - Always validate input in controllers
   - Use Zod schemas

2. **Don't ignore errors**

   - Always handle errors properly
   - Return meaningful error messages

3. **Don't forget authentication**

   - Verify user in protected routes
   - Check permissions

4. **Don't break existing functionality**

   - Test before and after migration
   - Use feature flags if needed

5. **Don't ignore TypeScript errors**
   - Fix type errors
   - Don't use `any` unnecessarily

---

## 📞 Getting Help

If you get stuck:

1. Check the examples in this guide
2. Review `docs/API_CLIENT_IMPLEMENTATION_SUMMARY.md`
3. Look at existing implementations
4. Ask specific questions with code examples

---

**Ready to Start?** Begin with **Day 1-2: Backend Layer**

Good luck! 🚀
