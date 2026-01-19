/**
 * Search API Routes
 * 
 * Handles global search across multiple content types (products, shops, categories, auctions).
 * Supports type-specific queries and relevance ranking.
 * 
 * @route GET /api/search - Global search with multi-type results
 * 
 * @example
 * ```tsx
 * // Search across all types
 * const response = await fetch('/api/search?q=laptop&types=products,shops');
 * 
 * // Search with pagination
 * const response = await fetch('/api/search?q=laptop&limit=20&cursor=doc-id');
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  doc,
  getDoc,
} from "firebase/firestore";

interface SearchResult {
  id: string;
  type: "product" | "shop" | "category" | "auction";
  name: string;
  slug: string;
  description?: string;
  image?: string;
  relevance: number;
  [key: string]: any;
}

/**
 * Calculate basic relevance score based on search query match
 */
function calculateRelevance(item: any, searchQuery: string): number {
  const query = searchQuery.toLowerCase();
  const name = (item.name || "").toLowerCase();
  const description = (item.description || "").toLowerCase();

  let score = 0;

  // Exact name match
  if (name === query) score += 100;
  // Name starts with query
  else if (name.startsWith(query)) score += 50;
  // Name contains query
  else if (name.includes(query)) score += 25;
  // Description contains query
  if (description.includes(query)) score += 10;

  // Boost for featured items
  if (item.featured) score += 20;
  // Boost for active/verified status
  if (item.status === "active" || item.verified) score += 10;

  return score;
}

/**
 * Search in a specific collection
 */
async function searchCollection(
  collectionName: string,
  searchQuery: string,
  pageLimit: number
): Promise<SearchResult[]> {
  const lowerQuery = searchQuery.toLowerCase();

  // Basic text search using nameLower field
  // For production, use Algolia or Elasticsearch
  const searchConstraints = [
    where("nameLower", ">=", lowerQuery),
    where("nameLower", "<=", lowerQuery + "\uf8ff"),
    limit(pageLimit),
  ];

  const searchQueryRef = query(
    collection(db, collectionName),
    ...searchConstraints
  );

  const querySnapshot = await getDocs(searchQueryRef);

  return querySnapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: collectionName.slice(0, -1) as "product" | "shop" | "category" | "auction", // Remove 's' from collection name
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image || data.images?.[0] || data.logo,
        relevance: calculateRelevance(data, searchQuery),
        ...data,
      };
    })
    .sort((a, b) => b.relevance - a.relevance);
}

/**
 * GET /api/search
 * 
 * Global search across multiple content types.
 * 
 * Query Parameters:
 * - q: Search query (required)
 * - types: Comma-separated list of types to search (products,shops,categories,auctions)
 * - limit: Results per type (default 10, max 50)
 * - sortBy: Sort order (relevance, newest, popular)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("q");
    const typesParam = searchParams.get("types") || "products,shops,categories,auctions";
    const pageLimit = Math.min(
      parseInt(searchParams.get("limit") || "10"),
      50
    );
    const sortBy = searchParams.get("sortBy") || "relevance";

    if (!searchQuery || searchQuery.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    if (searchQuery.trim().length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Parse types to search
    const types = typesParam.split(",").map((t) => t.trim());
    const validTypes = ["products", "shops", "categories", "auctions"];
    const searchTypes = types.filter((t) => validTypes.includes(t));

    if (searchTypes.length === 0) {
      return NextResponse.json(
        { error: "At least one valid type must be specified" },
        { status: 400 }
      );
    }

    // Search in parallel across all specified collections
    const searchPromises = searchTypes.map((type) =>
      searchCollection(type, searchQuery, pageLimit)
    );

    const results = await Promise.all(searchPromises);

    // Combine and organize results by type
    const organizedResults: Record<string, SearchResult[]> = {};
    searchTypes.forEach((type, index) => {
      organizedResults[type] = results[index];
    });

    // Get all results flattened and sorted
    const allResults = results
      .flat()
      .sort((a, b) => {
        if (sortBy === "relevance") {
          return b.relevance - a.relevance;
        } else if (sortBy === "newest") {
          return (
            (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
          );
        }
        return 0;
      });

    // Count totals
    const totals = searchTypes.reduce(
      (acc, type, index) => {
        acc[type] = results[index].length;
        acc.all += results[index].length;
        return acc;
      },
      { all: 0 } as Record<string, number>
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          query: searchQuery,
          results: organizedResults,
          all: allResults,
          totals,
          searchTypes,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error performing search:", error);
    return NextResponse.json(
      { error: "Search failed", details: error.message },
      { status: 500 }
    );
  }
}
