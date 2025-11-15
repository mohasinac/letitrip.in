import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../lib/session";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getProductsQuery,
  userOwnsShop,
  UserRole,
} from "@/app/api/lib/firebase/queries";
import { withCache } from "@/app/api/middleware/cache";

// GET /api/products - List all products (role-based)
export async function GET(request: NextRequest) {
  return withCache(
    request,
    async (req: NextRequest) => {
      try {
        const user = await getCurrentUser(req);

        const { searchParams } = new URL(req.url);
        const shopId =
          searchParams.get("shopId") || searchParams.get("shop_id");
        const categoryId =
          searchParams.get("categoryId") || searchParams.get("category_id");
        const status = searchParams.get("status");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const isFeatured = searchParams.get("isFeatured");
        const slug = searchParams.get("slug");
        const limit = parseInt(searchParams.get("limit") || "50");

        // For public requests, show only published products
        const role = user?.role ? (user.role as UserRole) : UserRole.USER;
        const userId = user?.id;

        // Build query based on role
        let query = getProductsQuery(
          role,
          role === "seller" ? shopId || userId : undefined
        );

        // For non-authenticated users, force published status
        if (!user) {
          query = query.where("status", "==", "published");
        }

        // Apply filters one at a time to avoid composite index requirements
        if (shopId) {
          query = query.where("shop_id", "==", shopId);
        }
        if (categoryId) {
          query = query.where("category_id", "==", categoryId);
        }
        if (status && user) {
          query = query.where("status", "==", status);
        }
        if (isFeatured === "true") {
          query = query.where("is_featured", "==", true);
        }
        if (slug) {
          query = query.where("slug", "==", slug);
        }

        const snapshot = await query.limit(limit).get();
        let products = snapshot.docs.map((doc) => {
          const data: any = doc.data();
          return {
            id: doc.id,
            ...data,
            // Add camelCase aliases for snake_case fields
            shopId: data.shop_id,
            categoryId: data.category_id,
            stockCount: data.stock_count,
            isFeatured: data.is_featured,
            isDeleted: data.is_deleted,
            originalPrice: data.original_price,
            reviewCount: data.review_count,
          };
        });

        if (minPrice) {
          const min = parseFloat(minPrice);
          products = products.filter((p: any) => (p.price ?? 0) >= min);
        }
        if (maxPrice) {
          const max = parseFloat(maxPrice);
          products = products.filter((p: any) => (p.price ?? 0) <= max);
        }

        return NextResponse.json({
          success: true,
          data: products,
          count: products.length,
        });
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

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
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
    const is_featured = body.is_featured ?? body.isFeatured ?? false;

    if (!shop_id || !name || !slug || !price || !category_id) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate user owns the shop
    const ownsShop = await userOwnsShop(shop_id, user.id);
    if (!ownsShop) {
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

    return NextResponse.json(
      { success: true, data: { id: docRef.id, ...productData } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}
