/**
 * @fileoverview TypeScript Module
 * @module src/app/api/categories/[slug]/similar/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

/**
 * GET /api/categories/[slug]/similar
 * Fetch similar categories (siblings or related)
 */
/**
 * Performs g e t operation
 *
 * @param {Request} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request, {});
 */

/**
 * Performs g e t operation
 *
 * @param {Request} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(/** Request */
  request, {});
 */

/**
 * Retrieves 
 *
 * @param {Request} request - The request
 * @param {{ params: Promise<{ slug: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The get result
 *
 * @example
 * GET(request, {});
 */
export async function GET(
  /** Request */
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // First, get the category by slug
    const categoriesSnapshot = await Collections.categories()
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (categoriesSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    const categoryDoc = categoriesSnapshot.docs[0];
    const category: any = { id: categoryDoc.id, ...categoryDoc.data() };

    // Get sibling categories (same parent)
    let similarQuery = Collections.categories().where(
      "isActive",
      "==",
      true,
    ) as any;

    if (category.parentId) {
      similarQuery = similarQuery.where("parentId", "==", category.parentId);
    } else {
      // If it's a root category, get other root categories
      similarQuery = similarQuery.where("parentId", "==", null);
    }

    similarQuery = similarQuery.orderBy("sortOrder", "asc").limit(limit + 1);

    const similarSnapshot = await similarQuery.get();

    // Filter out the current category
    /**
 * Performs similar operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The similar result
 *
 */
const similar = similarSnapshot.docs
      .map((doc: any) => ({ id: doc.id, ...doc.data() }))
      .filter((cat: any) => cat.id !== category.id)
      .slice(0, limit);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: similar,
    });
  } catch (error: any) {
    console.error("Similar categories error:", error);
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to fetch similar categories",
      },
      { status: 500 },
    );
  }
}
