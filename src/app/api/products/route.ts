/**
 * List Products API Route
 *
 * Fetches products with cursor-based pagination and filtering.
 * Supports filtering by category, shop, price range, and search query.
 *
 * @route GET /api/products
 *
 * @queryparam cursor - Pagination cursor (product slug)
 * @queryparam limit - Number of items per page (default: 20, max: 100)
 * @queryparam category - Filter by category slug
 * @queryparam shop - Filter by shop slug
 * @queryparam minPrice - Minimum price filter
 * @queryparam maxPrice - Maximum price filter
 * @queryparam search - Search query for product name/description
 * @queryparam sort - Sort order (newest, price-asc, price-desc, popular)
 * @queryparam status - Filter by status (active, inactive, outOfStock)
 *
 * @example
 * ```tsx
 * // Get first page
 * const response = await fetch('/api/products?limit=20&sort=newest');
 *
 * // Get next page
 * const response = await fetch('/api/products?cursor=product-slug&limit=20');
 *
 * // Filter by category
 * const response = await fetch('/api/products?category=electronics&limit=20');
 * ```
 */

import { FALLBACK_PRODUCTS } from "@/lib/fallback-data";
import { db } from "@/lib/firebase";
import { logger } from "@/lib/logger";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  serverTimestamp,
  setDoc,
  startAfter,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const cursor = searchParams.get("cursor");
    const limitParam = parseInt(searchParams.get("limit") || "20");
    const categorySlug = searchParams.get("category");
    const shopSlug = searchParams.get("shop");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const searchQuery = searchParams.get("search");
    const sortBy = searchParams.get("sort") || "newest";
    const status = searchParams.get("status") || "active";

    // Validate and cap limit
    const pageLimit = Math.min(Math.max(limitParam, 1), 100);

    // Build query constraints
    const constraints: QueryConstraint[] = [];

    // Filter by status
    constraints.push(where("status", "==", status));

    // Filter by category
    if (categorySlug) {
      constraints.push(where("categorySlug", "==", categorySlug));
    }

    // Filter by shop
    if (shopSlug) {
      constraints.push(where("shopSlug", "==", shopSlug));
    }

    // Filter by price range
    if (minPrice) {
      constraints.push(where("price", ">=", parseFloat(minPrice)));
    }
    if (maxPrice) {
      constraints.push(where("price", "<=", parseFloat(maxPrice)));
    }

    // Apply sorting
    switch (sortBy) {
      case "price-asc":
        constraints.push(orderBy("price", "asc"));
        break;
      case "price-desc":
        constraints.push(orderBy("price", "desc"));
        break;
      case "popular":
        constraints.push(orderBy("viewCount", "desc"));
        break;
      case "newest":
      default:
        constraints.push(orderBy("createdAt", "desc"));
        break;
    }

    // Handle cursor pagination
    if (cursor) {
      const cursorDoc = await getDoc(doc(db, "products", cursor));
      if (cursorDoc.exists()) {
        constraints.push(startAfter(cursorDoc));
      }
    }

    // Add limit
    constraints.push(limit(pageLimit + 1)); // Fetch one extra to check if there's a next page

    // Execute query
    const productsQuery = query(collection(db, "products"), ...constraints);
    const querySnapshot = await getDocs(productsQuery);

    // Process results
    const products = querySnapshot.docs.slice(0, pageLimit).map((doc) => ({
      slug: doc.id,
      ...doc.data(),
    }));

    // Check if there's a next page
    const hasMore = querySnapshot.docs.length > pageLimit;
    const nextCursor = hasMore ? querySnapshot.docs[pageLimit - 1].id : null;

    // Filter by search query (client-side filtering for now)
    let filteredProducts = products;
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filteredProducts = products.filter(
        (product: any) =>
          product.name?.toLowerCase().includes(lowerQuery) ||
          product.description?.toLowerCase().includes(lowerQuery) ||
          product.seoTitle?.toLowerCase().includes(lowerQuery),
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          products: filteredProducts,
          pagination: {
            limit: pageLimit,
            hasMore,
            nextCursor,
          },
          filters: {
            category: categorySlug,
            shop: shopSlug,
            minPrice,
            maxPrice,
            search: searchQuery,
            sort: sortBy,
            status,
          },
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    logger.apiError(error, {
      method: "GET",
      url: "/api/products",
      statusCode: 500,
      ip: request.ip,
      userAgent: request.headers.get("user-agent") || undefined,
    });
    console.error("Error fetching products:", error);

    // Return fallback data only in development
    if (process.env.NODE_ENV !== "production") {
      console.warn("Returning fallback data (development only)");
      return NextResponse.json(
        {
          success: true,
          fallback: true,
          data: {
            products: FALLBACK_PRODUCTS.slice(0, pageLimit || 20),
            pagination: {
              limit: pageLimit || 20,
              hasMore: false,
              nextCursor: null,
            },
            filters: {
              category: categorySlug,
              shop: shopSlug,
              minPrice,
              maxPrice,
              search: searchQuery,
              sort: sortBy,
              status,
            },
          },
        },
        { status: 200 },
      );
    }

    // In production, return error
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * Create Product API Route
 *
 * Creates a new product (Seller/Admin only).
 * Generates slug from product name and ensures uniqueness.
 *
 * @route POST /api/products
 *
 * @example
 * ```tsx
 * const response = await fetch('/api/products', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     name: 'Product Name',
 *     description: 'Product description',
 *     price: 99.99,
 *     categorySlug: 'electronics',
 *     shopSlug: 'my-shop',
 *     images: ['url1', 'url2'],
 *     stock: 100
 *   })
 * });
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      categorySlug,
      shopSlug,
      images,
      stock,
      specifications,
      seoTitle,
      seoDescription,
      seoKeywords,
    } = body;

    // Validate required fields
    if (!name || !price || !categorySlug || !shopSlug) {
      return NextResponse.json(
        { error: "Name, price, category, and shop are required" },
        { status: 400 },
      );
    }

    // Generate slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 100);

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existingDoc = await getDoc(doc(db, "products", slug));
      if (!existingDoc.exists()) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create product document
    const productData = {
      name,
      slug,
      description: description || "",
      price: parseFloat(price),
      categorySlug,
      shopSlug,
      images: images || [],
      stock: stock || 0,
      specifications: specifications || {},
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || description || "",
      seoKeywords: seoKeywords || [],
      status: stock > 0 ? "active" : "outOfStock",
      featured: false,
      popular: false,
      viewCount: 0,
      salesCount: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "products", slug), productData);

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: {
          slug,
          ...productData,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating product:", error);

    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
