/**
 * Search Suggestions API
 * 
 * Provides live autocomplete suggestions for search queries.
 * Returns top 10 matches across products, shops, and categories.
 * 
 * @route GET /api/search/suggestions - Get live search suggestions
 * 
 * @example
 * ```tsx
 * // Get suggestions
 * const response = await fetch('/api/search/suggestions?q=lap');
 * // Returns: ['laptop', 'laptop bag', 'apple laptop', ...]
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";

interface Suggestion {
  text: string;
  type: "product" | "shop" | "category";
  slug: string;
  image?: string;
}

/**
 * GET /api/search/suggestions
 * 
 * Get autocomplete suggestions for search query.
 * Returns top 10 matches with quick links.
 * 
 * Query Parameters:
 * - q: Search query (required, min 2 characters)
 * - types: Filter by types (products,shops,categories)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("q");
    const typesParam = searchParams.get("types") || "products,shops,categories";

    if (!searchQuery || searchQuery.trim().length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const lowerQuery = searchQuery.toLowerCase();
    const types = typesParam.split(",").map((t) => t.trim());

    // Search across specified collections
    const suggestions: Suggestion[] = [];

    // Products
    if (types.includes("products")) {
      const productsQuery = query(
        collection(db, "products"),
        where("nameLower", ">=", lowerQuery),
        where("nameLower", "<=", lowerQuery + "\uf8ff"),
        where("status", "==", "active"),
        limit(5)
      );

      const productsSnapshot = await getDocs(productsQuery);
      productsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        suggestions.push({
          text: data.name,
          type: "product",
          slug: data.slug,
          image: data.images?.[0],
        });
      });
    }

    // Shops
    if (types.includes("shops")) {
      const shopsQuery = query(
        collection(db, "shops"),
        where("nameLower", ">=", lowerQuery),
        where("nameLower", "<=", lowerQuery + "\uf8ff"),
        where("status", "==", "active"),
        limit(3)
      );

      const shopsSnapshot = await getDocs(shopsQuery);
      shopsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        suggestions.push({
          text: data.name,
          type: "shop",
          slug: data.slug,
          image: data.logo,
        });
      });
    }

    // Categories
    if (types.includes("categories")) {
      const categoriesQuery = query(
        collection(db, "categories"),
        where("name", ">=", searchQuery),
        where("name", "<=", searchQuery + "\uf8ff"),
        where("status", "==", "active"),
        limit(2)
      );

      const categoriesSnapshot = await getDocs(categoriesQuery);
      categoriesSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        suggestions.push({
          text: data.name,
          type: "category",
          slug: data.slug,
          image: data.image,
        });
      });
    }

    // Limit to top 10 suggestions
    const topSuggestions = suggestions.slice(0, 10);

    return NextResponse.json(
      {
        success: true,
        data: {
          query: searchQuery,
          suggestions: topSuggestions,
          count: topSuggestions.length,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions", details: error.message },
      { status: 500 }
    );
  }
}
