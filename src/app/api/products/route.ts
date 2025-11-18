import { NextRequest, NextResponse } from "next/server";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getProductsQuery,
  userOwnsShop,
  UserRole,
} from "@/app/api/lib/firebase/queries";
import { withCache } from "@/app/api/middleware/cache";
import { ValidationError } from "@/lib/api-errors";
import { updateCategoryProductCounts } from "@/lib/category-hierarchy";
import { executeCursorPaginatedQuery } from "@/app/api/lib/utils/pagination";

/**
 * GET /api/products
 * List products with role-based filtering
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
        const sortBy = searchParams.get("sortBy") || "created_at";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        // For public requests, show only published products
        const role = user?.role ? (user.role as UserRole) : UserRole.USER;
        const userId = user?.uid;

        // Build base query based on role
        let query = getProductsQuery(
          role,
          role === "seller" ? shopId || userId : undefined
        );

        // For non-authenticated users, force published status
        if (!user) {
          query = query.where("status", "==", "published");
        }

        // Apply equality filters (these can be combined)
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

        // Price range filters (Firebase supports these with proper indexes)
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

        // Add sorting (required for pagination)
        // If we have price filters, we must order by price
        // Otherwise order by the requested field
        if (minPrice || maxPrice) {
          query = query.orderBy("price", sortOrder as any);
          // Add secondary sort by created_at for consistent ordering
          if (sortBy !== "price") {
            query = query.orderBy("created_at", "desc");
          }
        } else {
          // Order by requested field
          const validSortFields = ["created_at", "updated_at", "price", "name"];
          const sortField = validSortFields.includes(sortBy)
            ? sortBy
            : "created_at";
          query = query.orderBy(sortField, sortOrder as any);
        }

        // Execute paginated query
        const response = await executeCursorPaginatedQuery(
          query,
          searchParams,
          (id) => Collections.products().doc(id).get(),
          (doc) => {
            const data: any = doc.data();
            return {
              id: doc.id,
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
          },
          50, // defaultLimit
          200 // maxLimit
        );

        // Apply text search filter (if no other solution available)
        // TODO: Replace with Algolia/Typesense for better performance
        if (search) {
          const searchLower = search.toLowerCase();
          response.data = response.data.filter(
            (p: any) =>
              p.name?.toLowerCase().includes(searchLower) ||
              p.description?.toLowerCase().includes(searchLower) ||
              p.slug?.toLowerCase().includes(searchLower) ||
              p.tags?.some((tag: string) =>
                tag.toLowerCase().includes(searchLower)
              )
          );
          response.count = response.data.length;
        }

        return NextResponse.json(response);
      } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
          { success: false, error: "Failed to fetch products" },
          { status: 500 }
        );
      }
    },
    { ttl: 120 }
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
        { status: 403 }
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
        { status: 403 }
      );
    }

    // Check if slug is unique (global for now)
    const existingSlug = await Collections.products()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (!existingSlug.empty) {
      return NextResponse.json(
        { success: false, error: "Product slug already exists" },
        { status: 400 }
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

    const docRef = await Collections.products().add(productData);

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
      { success: true, data: { id: docRef.id, ...productData } },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}
