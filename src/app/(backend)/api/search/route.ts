/**
 * API Route: Universal Search
 * GET /api/search - Search across products, categories, and stores (public access)
 * 
 * Query Parameters:
 * - q: Search query (min 2 characters)
 * 
 * Returns:
 * - products: Up to 5 matching products
 * - categories: Up to 3 matching categories
 * - stores: Up to 3 matching seller stores
 * 
 * Optimized with caching (2 minutes TTL) and rate limiting
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "../_lib/database/admin";
import { ValidationError } from "../_lib/middleware/error-handler";
import { withCache } from '../_lib/middleware/cache';
import { withRateLimit } from '../_lib/middleware/rate-limit';
import { CacheKeys, CacheTTL } from '../_lib/utils/cache';
import { rateLimitConfigs } from '../_lib/utils/rate-limiter';

const db = getAdminDb();

/**
 * Helper to get product price (handles both nested and flattened structures)
 */
const getProductPrice = (product: any): number => {
  return product.pricing?.price ?? product.price ?? 0;
};

/**
 * GET /api/search
 * Universal search endpoint (public access, no authentication required)
 * Optimized with short TTL cache (2 minutes) and rate limiting
 */
const searchHandler = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    // Validate query parameter
    if (!query) {
      throw new ValidationError("Search query is required");
    }

    if (query.trim().length < 2) {
      throw new ValidationError("Search query must be at least 2 characters");
    }

    const searchTerm = query.toLowerCase().trim();

    // Search products (limit to 5 results)
    const productsSnapshot = await db
      .collection("products")
      .where("status", "==", "active")
      .orderBy("name")
      .limit(50)
      .get();

    const products = productsSnapshot.docs
      .filter((doc) => {
        const data = doc.data();
        const name = (data.name || "").toLowerCase();
        const description = (data.description || "").toLowerCase();
        const sku = (data.sku || "").toLowerCase();
        return (
          name.includes(searchTerm) ||
          description.includes(searchTerm) ||
          sku.includes(searchTerm)
        );
      })
      .slice(0, 5)
      .map((doc) => {
        const data = doc.data();
        return {
          type: "product",
          id: doc.id,
          name: data.name,
          slug: data.slug,
          image: data.images?.[0]?.url || data.media?.images?.[0]?.url,
          price: getProductPrice(data),
          category: data.category,
        };
      });

    // Search categories (limit to 3 results)
    const categoriesSnapshot = await db
      .collection("categories")
      .where("isActive", "==", true)
      .orderBy("name")
      .limit(30)
      .get();

    const categories = categoriesSnapshot.docs
      .filter((doc) => {
        const data = doc.data();
        const name = (data.name || "").toLowerCase();
        const description = (data.description || "").toLowerCase();
        return name.includes(searchTerm) || description.includes(searchTerm);
      })
      .slice(0, 3)
      .map((doc) => {
        const data = doc.data();
        return {
          type: "category",
          id: doc.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          image: data.image,
          productCount: data.productCount || 0,
        };
      });

    // Search stores (limit to 3 results)
    const storesSnapshot = await db
      .collection("users")
      .where("role", "==", "seller")
      .where("isApproved", "==", true)
      .orderBy("storeName")
      .limit(30)
      .get();

    const stores = storesSnapshot.docs
      .filter((doc) => {
        const data = doc.data();
        const storeName = (data.storeName || "").toLowerCase();
        const storeDescription = (data.storeDescription || "").toLowerCase();
        return (
          storeName.includes(searchTerm) || storeDescription.includes(searchTerm)
        );
      })
      .slice(0, 3)
      .map((doc) => {
        const data = doc.data();
        return {
          type: "store",
          id: doc.id,
          name: data.storeName,
          slug: data.storeSlug || doc.id,
          description: data.storeDescription,
          rating: data.rating || 0,
          productCount: data.productCount || 0,
        };
      });

    return NextResponse.json({
      success: true,
      data: {
        query: searchTerm,
        results: {
          products,
          categories,
          stores,
        },
        counts: {
          products: products.length,
          categories: categories.length,
          stores: stores.length,
          total: products.length + categories.length + stores.length,
        },
      },
    });
  } catch (error) {
    console.error("Search error:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
      },
      { status: 500 }
    );
  }
};

export const GET = withRateLimit(
  withCache(searchHandler, {
    keyGenerator: (req) => {
      const query = req.nextUrl.searchParams.get('q') || '';
      return CacheKeys.SEARCH_RESULTS(query.toLowerCase().trim());
    },
    ttl: 120, // 2 minutes for search results
    skip: (req) => {
      // Skip cache for very short queries or empty queries
      const query = req.nextUrl.searchParams.get('q') || '';
      return query.trim().length < 2;
    },
  }),
  {
    config: (req) => {
      const authHeader = req.headers.get('authorization');
      return authHeader ? rateLimitConfigs.authenticated : rateLimitConfigs.public;
    }
  }
);
