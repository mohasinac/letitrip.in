/**
 * @fileoverview TypeScript Module
 * @module src/app/api/hero-slides/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { heroSlidesSieveConfig } from "@/app/api/lib/sieve/config";
import { createPaginationMeta } from "@/app/api/lib/sieve/firestore";
import { parseSieveQuery } from "@/app/api/lib/sieve/parser";
import {
  getUserFromRequest,
  requireRole,
} from "@/app/api/middleware/rbac-auth";
import { COLLECTIONS } from "@/constants/database";
import { ApiError, ValidationError, errorToJson } from "@/lib/api-errors";
import { NextRequest, NextResponse } from "next/server";

// Extended Sieve config with field mappings for hero slides
const slidesConfig = {
  ...heroSlidesSieveConfig,
  /** Field Mappings */
  fieldMappings: {
    /** Order */
    order: "position",
    /** Created At */
    createdAt: "created_at",
    /** Updated At */
    updatedAt: "updated_at",
    /** Is Active */
    isActive: "is_active",
  } as Record<string, string>,
};

/**
 * Transform slide document to API response format
 */
/**
 * Transforms slide for admin
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformslideforadmin result
 */

/**
 * Transforms slide for admin
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformslideforadmin result
 */

function transformSlideForAdmin(id: string, data: any) {
  return {
    id,
    /** Title */
    title: data.title,
    /** Subtitle */
    subtitle: data.subtitle || "",
    /** Description */
    description: data.description || "",
    image_url: data.image_url,
    link_url: data.link_url || "",
    cta_text: data.cta_text || "Shop Now",
    /** Position */
    position: data.position,
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Function: Transform Slide For Public
 */
/**
 * Transforms slide for public
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformslideforpublic result
 */

/**
 * Transforms slide for public
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformslideforpublic result
 */

function transformSlideForPublic(id: string, data: any) {
  return {
    id,
    /** Image */
    image: data.image_url,
    /** Title */
    title: data.title,
    /** Subtitle */
    subtitle: data.subtitle || "",
    /** Description */
    description: data.description || "",
    /** Cta Text */
    ctaText: data.cta_text || "Shop Now",
    /** Cta Link */
    ctaLink: data.link_url || "/",
    /** Order */
    order: data.position,
    /** Enabled */
    enabled: data.is_active,
  };
}

/**
 * GET /api/hero-slides
 * List hero slides with Sieve pagination
 * Public: Returns only active slides
 * Admin: Returns all slides
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
    const user = await getUserFromRequest(req);
    const isAdmin = user?.role === "admin";
    const { searchParams } = new URL(req.url);

    // Parse Sieve query
    const {
      /** Query */
      query: sieveQuery,
      errors,
      warnings,
    } = parseSieveQuery(searchParams, slidesConfig);

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

    let query: FirebaseFirestore.Query = db.collection(COLLECTIONS.HERO_SLIDES);

    // Filter by active status for non-admin users
    if (!isAdmin) {
      query = query.where("is_active", "==", true);
    }

    // Apply Sieve filters
    for (const filter of sieveQuery.filters) {
      const dbField = slidesConfig.fieldMappings[filter.field] || filter.field;
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
        const dbField = slidesConfig.fieldMappings[sort.field] || sort.field;
        query = query.orderBy(dbField, sort.direction);
      }
    } else {
      query = query.orderBy("position", "asc");
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
      const lastDoc = skipSnapshot.docs.at(-1);
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
    }
    query = query.limit(sieveQuery.pageSize);

    // Execute query
    const snapshot = await query.get();
    const slides = snapshot.docs.map((doc) =>
      isAdmin
        ? transformSlideForAdmin(doc.id, doc.data())
        : transformSlideForPublic(doc.id, doc.data())
    );

    // Build response with Sieve pagination meta
    const pagination = createPaginationMeta(totalCount, sieveQuery);

    return NextResponse.json({
      /** Success */
      success: true,
      slides,
      /** Data */
      data: slides,
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
    console.error("Error fetching hero slides:", error);
    if (error instanceof ApiError) {
      return NextResponse.json(errorToJson(error), {
        /** Status */
        status: error.statusCode,
      });
    }
    // Return empty array for public to prevent breaking frontend
    return NextResponse.json({ slides: [], data: [], success: false });
  }
}

/**
 * POST /api/hero-slides
 * Admin only: Create new hero slide
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
    // Require admin role
    const roleResult = await requireRole(req, ["admin"]);
    if (roleResult.error) {
      return roleResult.error;
    }

    const db = getFirestoreAdmin();
    const body = await req.json();

    // Validate required fields
    if (!body.title || !body.image_url) {
      const errors: Record<string, string> = {};
      if (!body.title) errors.title = "Title is required";
      if (!body.image_url) errors.image_url = "Image is required";
      throw new ValidationError("Title and image are required", errors);
    }

    // Get max position
    const maxSnapshot = await db
      .collection(COLLECTIONS.HERO_SLIDES)
      .orderBy("position", "desc")
      .limit(1)
      .get();

    const maxPosition = maxSnapshot.empty
      ? 0
      : maxSnapshot.docs[0].data().position;

    // Create slide data
    const slideData = {
      /** Title */
      title: body.title,
      /** Subtitle */
      subtitle: body.subtitle || "",
      /** Description */
      description: body.description || "",
      image_url: body.image_url,
      link_url: body.link_url || "",
      cta_text: body.cta_text || "Shop Now",
      /** Position */
      position: body.position ?? maxPosition + 1,
      is_active: body.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTIONS.HERO_SLIDES).add(slideData);

    return NextResponse.json(
      {
        /** Slide */
        slide: {
          /** Id */
          id: docRef.id,
          ...slideData,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating hero slide:", error);
    if (error instanceof ApiError) {
      return NextResponse.json(errorToJson(error), {
        /** Status */
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      { error: "Failed to create hero slide" },
      { status: 500 }
    );
  }
}
