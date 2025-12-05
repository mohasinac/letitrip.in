/**
 * @fileoverview TypeScript Module
 * @module src/app/api/blog/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { blogSieveConfig } from "@/app/api/lib/sieve/config";
import { createPaginationMeta } from "@/app/api/lib/sieve/firestore";
import { parseSieveQuery } from "@/app/api/lib/sieve/parser";
import { NextRequest, NextResponse } from "next/server";

/**
 * COLLECTION constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for collection
 */
const COLLECTION = "blog_posts";

// Extended Sieve config with field mappings for blog posts
const blogConfig = {
  ...blogSieveConfig,
  /** Field Mappings */
  fieldMappings: {
    /** Created At */
    createdAt: "created_at",
    /** Published At */
    publishedAt: "publishedAt",
    /** View Count */
    viewCount: "view_count",
    /** Featured */
    featured: "is_featured",
  } as Record<string, string>,
};

/**
 * Transform blog post document to API response format
 */
/**
 * Transforms blog post
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformblogpost result
 */

/**
 * Transforms blog post
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformblogpost result
 */

function transformBlogPost(id: string, data: any) {
  return {
    id,
    ...data,
    /** Featured */
    featured: data.is_featured,
    /** View Count */
    viewCount: data.view_count,
  };
}

/**
 * GET /api/blog
 * List blog posts with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-publishedAt&filters=status==published
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const { searchParams } = new URL(req.url);

    // Parse Sieve query
    const {
      /** Query */
      query: sieveQuery,
      errors,
      warnings,
    } = parseSieveQuery(searchParams, blogConfig);

    if (errors.length > 0) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Invalid query parameters",
          /** Details */
          details: errors,
        },
        { status: 400 }
      );
    }

    // Legacy query params support (for backward compatibility)
    const status = searchParams.get("status") || "published";
    const category = searchParams.get("category");
    const featured =
      searchParams.get("featured") || searchParams.get("showOnHomepage");

    let query: FirebaseFirestore.Query = db
      .collection(COLLECTION)
      .where("status", "==", status);

    // Apply legacy filters
    if (featured === "true") {
      query = query.where("is_featured", "==", true);
    }
    if (category) {
      query = query.where("category", "==", category);
    }

    // Apply Sieve filters
    for (const filter of sieveQuery.filters) {
      const dbField = blogConfig.fieldMappings[filter.field] || filter.field;
      if (["==", "!=", ">", ">=", "<", "<="].includes(filter.operator)) {
        query = query.where(
          dbField,
          filter.operator as FirebaseFirestore.WhereFilterOp,
          filter.value
        );
      }
    }

    // Apply sorting
    if (sieveQuery.sorts.length > 0) {
      for (const sort of sieveQuery.sorts) {
        const dbField = blogConfig.fieldMappings[sort.field] || sort.field;
        query = query.orderBy(dbField, sort.direction);
      }
    } else {
      query = query.orderBy("publishedAt", "desc");
    }

    // Get total count
    const countSnapshot = await query.count().get();
    const totalCount = countSnapshot.data().count;

    // Apply pagination
    /**
     * Performs offset operation
     *
     * @param {any} sieveQuery.page - 1) * sieveQuery.pageSize;
    if (offset > 0 - The sieve query.page - 1) * sieve query.page size;
    if (offset > 0
     *
     * @returns {any} The offset result
     */

    /**
     * Performs offset operation
     *
     * @param {any} sieveQuery.page - 1) * sieveQuery.pageSize;
    if (offset > 0 - The sieve query.page - 1) * sieve query.page size;
    if (offset > 0
     *
     * @returns {any} The offset result
     */

    const offset = (sieveQuery.page - 1) * sieveQuery.pageSize;
    if (offset > 0) {
      const skipSnapshot = await query.limit(offset).get();
      if (skipSnapshot.docs.length > 0) {
        const lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }
    query = query.limit(sieveQuery.pageSize);

    // Execute query
    const snapshot = await query.get();
    /**
 * Performs data operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The data result
 *
 */
const data = snapshot.docs.map((doc) =>
      transformBlogPost(doc.id, doc.data())
    );

    // Build response with Sieve pagination meta
    const pagination = createPaginationMeta(totalCount, sieveQuery);

    return NextResponse.json({
      /** Success */
      success: true,
      data,
      pagination,
      /** Meta */
      meta: {
        /** Applied Filters */
        appliedFilters: sieveQuery.filters,
        /** Applied Sorts */
        appliedSorts: sieveQuery.sorts,
        /** Warnings */
        warnings: warnings.length > 0 ? warnings : undefined,
      },
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

// POST /api/blog - Create new blog post (admin only)
/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

export async function POST(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const body = await req.json();

    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      author,
      category,
      tags,
      status,
      featured,
    } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, content" },
        { status: 400 }
      );
    }

    // Check if slug/ID already exists (slug is used as document ID)
    const existingDoc = await db.collection(COLLECTION).doc(slug).get();

    if (existingDoc.exists) {
      return NextResponse.json(
        { error: "A blog post with this slug already exists" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const post = {
      title,
      slug,
      /** Excerpt */
      excerpt: excerpt || "",
      content,
      /** Featured Image */
      featuredImage: featuredImage || null,
      /** Author */
      author: author || { name: "Admin", id: "admin" },
      /** Category */
      category: category || "Uncategorized",
      /** Tags */
      tags: tags || [],
      /** Status */
      status: status || "draft",
      is_featured: featured || false,
      /** Views */
      views: 0,
      /** Likes */
      likes: 0,
      /** Published At */
      publishedAt: status === "published" ? now : null,
      /** Created At */
      createdAt: now,
      /** Updated At */
      updatedAt: now,
    };

    // Use slug as document ID for SEO-friendly URLs
    await db.collection(COLLECTION).doc(slug).set(post);

    return NextResponse.json({
      /** Id */
      id: slug,
      ...post,
    });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
