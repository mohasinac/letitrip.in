import { NextRequest, NextResponse } from "next/server";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop, UserRole } from "@/app/api/lib/firebase/queries";
import { withCache } from "@/app/api/middleware/cache";
import { ValidationError } from "@/lib/api-errors";
import { updateCategoryProductCounts } from "@/lib/category-hierarchy";
import {
  parseSieveQuery,
  productsSieveConfig,
  createPaginationMeta,
} from "@/app/api/lib/sieve";

// Extended Sieve config with field mappings for products
const productsConfig = {
  ...productsSieveConfig,
  fieldMappings: {
    categoryId: "category_id",
    shopId: "shop_id",
    createdAt: "created_at",
    updatedAt: "updated_at",
    stockCount: "stock_count",
    featured: "is_featured",
  } as Record<string, string>,
};

/**
 * Transform product document to API response format
 */
function transformProduct(id: string, data: any) {
  return {
    id,
    ...data,
    // Add camelCase aliases for snake_case fields
    shopId: data.shop_id,
    categoryId: data.category_id,
    stockCount: data.stock_count,
    featured: data.is_featured,
    isDeleted: data.is_deleted,
    originalPrice: data.original_price,
    reviewCount: data.review_count,
  };
}

/**
 * GET /api/products
 * List products with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-createdAt&filters=status==published,price>100
 *
 * Role-based filtering:
 * - Public: Published products only
 * - Seller: Own products (all statuses)
 * - Admin: All products
 */
export async function GET(request: NextRequest) {
  return withCache(
    request,
    async (req: NextRequest) => {
      try {
        const user = await getUserFromRequest(req);
        const { searchParams } = new URL(req.url);

        // Parse Sieve query
        const {
          query: sieveQuery,
          errors,
          warnings,
        } = parseSieveQuery(searchParams, productsConfig);

        if (errors.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid query parameters",
              details: errors,
            },
            { status: 400 },
          );
        }

        // Build base Firestore query
        const productsRef = Collections.products();
        let query: FirebaseFirestore.Query = productsRef;

        // Role-based filtering
        const role = user?.role ? (user.role as UserRole) : UserRole.USER;

        // For non-authenticated users, force published status
        if (!user) {
          query = query.where("status", "==", "published");
        }

        // Legacy query params support (for backward compatibility)
        const shopId =
          searchParams.get("shopId") || searchParams.get("shop_id");
        const categoryId =
          searchParams.get("categoryId") || searchParams.get("category_id");
        const status = searchParams.get("status");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const featured = searchParams.get("featured");
        const slug = searchParams.get("slug");
        const search = searchParams.get("search");
        const inStock = searchParams.get("inStock");

        // Apply direct query params (backward compatibility)
        if (shopId) {
          query = query.where("shop_id", "==", shopId);
        }
        if (categoryId) {
          query = query.where("category_id", "==", categoryId);
        }
        if (status && user) {
          query = query.where("status", "==", status);
        }
        if (featured === "true") {
          query = query.where("is_featured", "==", true);
        }
        if (slug) {
          query = query.where("slug", "==", slug);
        }
        if (inStock === "true") {
          query = query.where("stock_count", ">", 0);
        }

        // Apply Sieve filters
        for (const filter of sieveQuery.filters) {
          const dbField =
            productsConfig.fieldMappings[filter.field] || filter.field;
          if (
            filter.operator === "==" ||
            filter.operator === "!=" ||
            filter.operator === ">" ||
            filter.operator === ">=" ||
            filter.operator === "<" ||
            filter.operator === "<="
          ) {
            query = query.where(dbField, filter.operator, filter.value);
          }
        }

        // Price range (legacy support)
        if (minPrice) {
          const min = parseFloat(minPrice);
          if (!isNaN(min)) {
            query = query.where("price", ">=", min);
          }
        }
        if (maxPrice) {
          const max = parseFloat(maxPrice);
          if (!isNaN(max)) {
            query = query.where("price", "<=", max);
          }
        }

        // Apply sorting
        if (sieveQuery.sorts.length > 0) {
          for (const sort of sieveQuery.sorts) {
            const dbField =
              productsConfig.fieldMappings[sort.field] || sort.field;
            query = query.orderBy(dbField, sort.direction);
          }
        } else {
          // Default sort
          query = query.orderBy("created_at", "desc");
        }

        // Get total count (for pagination meta)
        const countSnapshot = await query.count().get();
        const totalCount = countSnapshot.data().count;

        // Apply pagination
        const offset = (sieveQuery.page - 1) * sieveQuery.pageSize;
        if (offset > 0) {
          // Skip to the correct page
          const skipSnapshot = await query.limit(offset).get();
          const lastDoc = skipSnapshot.docs.at(-1);
          if (lastDoc) {
            query = query.startAfter(lastDoc);
          }
        }
        query = query.limit(sieveQuery.pageSize);

        // Execute query
        const snapshot = await query.get();
        let data = snapshot.docs.map((doc) =>
          transformProduct(doc.id, doc.data()),
        );

        // Apply text search filter (client-side)
        if (search) {
          const searchLower = search.toLowerCase();
          data = data.filter(
            (p: any) =>
              p.name?.toLowerCase().includes(searchLower) ||
              p.description?.toLowerCase().includes(searchLower) ||
              p.slug?.toLowerCase().includes(searchLower) ||
              p.tags?.some((tag: string) =>
                tag.toLowerCase().includes(searchLower),
              ),
          );
        }

        // Build response with Sieve pagination meta
        const pagination = createPaginationMeta(
          search ? data.length : totalCount,
          sieveQuery,
        );

        return NextResponse.json({
          success: true,
          data,
          pagination,
          meta: {
            appliedFilters: sieveQuery.filters,
            appliedSorts: sieveQuery.sorts,
            warnings: warnings.length > 0 ? warnings : undefined,
          },
        });
      } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
          { success: false, error: "Failed to fetch products" },
          { status: 500 },
        );
      }
    },
    { ttl: 120 },
  );
}

/**
 * POST /api/products
 * Create new product (seller/admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    const user = authResult.user!;

    // Only sellers and admins can create products
    if (user.role !== "seller" && user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Only sellers and admins can create products",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    // Accept both camelCase and snake_case from client
    const shop_id = body.shop_id || body.shopId;
    const name = body.name;
    const slug = body.slug;
    const description = body.description || "";
    const price = Number(body.price);
    const category_id = body.category_id || body.categoryId;
    const images = body.images || [];
    const status = body.status || "draft";
    const stock_quantity = body.stock_quantity ?? body.stockCount ?? null;
    const is_featured = body.is_featured ?? body.featured ?? false;

    // Validation
    const errors: Record<string, string> = {};
    if (!shop_id) errors.shop_id = "Shop ID is required";
    if (!name || name.trim().length < 3)
      errors.name = "Name must be at least 3 characters";
    if (!slug || slug.trim().length < 3)
      errors.slug = "Slug must be at least 3 characters";
    if (!price || price <= 0) errors.price = "Price must be greater than 0";
    if (!category_id) errors.category_id = "Category is required";

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Validation failed", errors);
    }

    // Validate user owns the shop
    const ownsShop = await userOwnsShop(shop_id, user.uid);
    if (!ownsShop && user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to add products to this shop",
        },
        { status: 403 },
      );
    }

    // Check if slug/ID already exists (slug is used as document ID)
    const existingDoc = await Collections.products().doc(slug).get();
    if (existingDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Product slug already exists" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const productData = {
      shop_id,
      name,
      slug,
      description,
      price: Number(price),
      category_id,
      images,
      status,
      stock_quantity: stock_quantity !== null ? Number(stock_quantity) : null,
      is_featured,
      created_at: now,
      updated_at: now,
    };

    // Use slug as document ID for SEO-friendly URLs
    await Collections.products().doc(slug).set(productData);

    // Update category product counts (including ancestors)
    if (category_id && status === "published") {
      try {
        await updateCategoryProductCounts(category_id);
      } catch (error) {
        console.error("Failed to update category counts:", error);
        // Don't fail the request if count update fails
      }
    }

    return NextResponse.json(
      { success: true, data: { id: slug, ...productData } },
      { status: 201 },
    );
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, errors: error.errors },
        { status: 400 },
      );
    }
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 },
    );
  }
}
