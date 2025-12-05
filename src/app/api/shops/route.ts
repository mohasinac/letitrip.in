/**
 * @fileoverview TypeScript Module
 * @module src/app/api/shops/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { UserRole } from "@/app/api/lib/firebase/queries";
import { shopsSieveConfig } from "@/app/api/lib/sieve/config";
import { createPaginationMeta } from "@/app/api/lib/sieve/firestore";
import { parseSieveQuery } from "@/app/api/lib/sieve/parser";
import { withCache } from "@/app/api/middleware/cache";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import {
  VALIDATION_MESSAGES,
  VALIDATION_RULES,
} from "@/constants/validation-messages";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// Extended Sieve config with field mappings for shops
const shopsConfig = {
  ...shopsSieveConfig,
  /** Field Mappings */
  fieldMappings: {
    /** Owner Id */
    ownerId: "owner_id",
    /** Created At */
    createdAt: "created_at",
    /** Updated At */
    updatedAt: "updated_at",
    /** Product Count */
    productCount: "product_count",
    /** Review Count */
    reviewCount: "review_count",
    /** Is Verified */
    isVerified: "is_verified",
    /** Is Banned */
    isBanned: "is_banned",
    /** Featured */
    featured: "is_featured",
    /** Show On Homepage */
    showOnHomepage: "show_on_homepage",
  } as Record<string, string>,
};

/**
 * Transform shop document to API response format
 */
/**
 * Transforms shop
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformshop result
 */

/**
 * Transforms shop
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformshop result
 */

function transformShop(id: string, data: any) {
  return {
    id,
    ...data,
    // Add camelCase aliases
    /** Owner Id */
    ownerId: data.owner_id,
    /** Is Verified */
    isVerified: data.is_verified,
    /** Featured */
    featured: data.is_featured,
    /** Is Banned */
    isBanned: data.is_banned,
    /** Show On Homepage */
    showOnHomepage: data.show_on_homepage,
    /** Total Products */
    totalProducts: data.total_products || data.product_count || 0,
    /** Review Count */
    reviewCount: data.review_count || 0,
    /** Created At */
    createdAt: data.created_at,
    /** Updated At */
    updatedAt: data.updated_at,
  };
}

/**
 * GET /api/shops
 * List shops with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-createdAt&filters=verified==true
 *
 * Role-based filtering:
 * - Public: Verified, non-banned shops only
 * - Seller: Own shops
 * - Admin: All shops
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
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
          /** Query */
          query: sieveQuery,
          errors,
          warnings,
        } = parseSieveQuery(searchParams, shopsConfig);

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

        const role = user?.role ? (user.role as UserRole) : UserRole.USER;
        const userId = user?.uid;

        // Legacy params for backward compatibility
        const featured = searchParams.get("featured");
        const showOnHomepage = searchParams.get("showOnHomepage");

        // Build role-based query
        let query: FirebaseFirestore.Query;

        if (!user || role === UserRole.USER) {
          // Public users see only verified, non-banned shops
          if (featured === "true" || showOnHomepage === "true") {
            query = Collections.shops()
              .where("is_featured", "==", true)
              .where("is_verified", "==", true);
          } else {
            query = Collections.shops()
              .where("is_banned", "==", false)
              .where("is_verified", "==", true);
          }
        } else if (role === UserRole.SELLER) {
          // Sellers see own shops
          if (userId) {
            query = Collections.shops().where("owner_id", "==", userId);
          } else {
            query = Collections.shops()
              .where("is_banned", "==", false)
              .where("is_verified", "==", true);
          }
        } else {
          // Admin sees all shops
          query = Collections.shops();
          if (featured === "true") {
            query = query.where("is_featured", "==", true);
          }
        }

        // Apply Sieve filters
        for (const filter of sieveQuery.filters) {
          const dbField =
            shopsConfig.fieldMappings[filter.field] || filter.field;
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
            const dbField = shopsConfig.fieldMappings[sort.field] || sort.field;
            query = query.orderBy(dbField, sort.direction);
          }
        } else {
          // Default sort
          query = query.orderBy("created_at", "desc");
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
        /**
 * Performs shops operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The shops result
 *
 */
const shops = snapshot.docs.map((doc) =>
          transformShop(doc.id, doc.data())
        );

        // Check if user can create more shops
        let canCreateMore = false;
        if (role === UserRole.ADMIN) {
          canCreateMore = true;
        } else if (role === UserRole.SELLER && userId) {
          const userShopsQuery = Collections.shops().where(
            "owner_id",
            "==",
            userId
          );
          const userShopsSnapshot = await userShopsQuery.get();
          canCreateMore = userShopsSnapshot.size === 0;
        }

        // Build Sieve pagination meta
        const pagination = createPaginationMeta(totalCount, sieveQuery);

        return NextResponse.json({
          /** Success */
          success: true,
          /** Data */
          data: shops,
          shops, // Backward compatibility
          /** Count */
          count: shops.length,
          canCreateMore,
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
      } catch (error: any) {
        logError(error as Error, { component: "API.shops.GET" });

        const errorMessage = error?.message || "Failed to fetch shops";
        return NextResponse.json(
          {
            /** Success */
            success: false,
            /** Error */
            error: errorMessage,
            /** Details */
            details:
              process.env.NODE_ENV === "development" ? error?.stack : undefined,
          },
          { status: 500 }
        );
      }
    },
    { ttl: 180 }
  );
}

// POST /api/shops - Create shop
/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) return authResult.error;

    const { user } = authResult;

    // Check role (seller or admin)
    if (user.role !== "seller" && user.role !== "admin") {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Only sellers and admins can create shops",
        },
        { status: 403 }
      );
    }

    const userId = user.uid;
    const userRole = user.role;

    // Check shop creation limit (1 for sellers, unlimited for admins)
    if (userRole === "seller") {
      const userShopsQuery = Collections.shops().where(
        "owner_id",
        "==",
        userId
      );
      const userShopsSnapshot = await userShopsQuery.get();

      if (userShopsSnapshot.size >= 1) {
        return NextResponse.json(
          {
            /** Success */
            success: false,
            /** Error */
            error: "You can only create 1 shop. Please contact admin for more.",
          },
          { status: 403 }
        );
      }
    }

    const data = await request.json();

    // Validate required fields
    const errors: Record<string, string> = {};

    if (!data.name) {
      errors.name = VALIDATION_MESSAGES.REQUIRED.FIELD("Shop name");
    } else if (
      data.name.length < VALIDATION_RULES.SHOP.NAME.MIN_LENGTH ||
      data.name.length > VALIDATION_RULES.SHOP.NAME.MAX_LENGTH
    ) {
      errors.name = `Shop name must be between ${VALIDATION_RULES.SHOP.NAME.MIN_LENGTH} and ${VALIDATION_RULES.SHOP.NAME.MAX_LENGTH} characters`;
    }

    if (!data.slug) {
      errors.slug = VALIDATION_MESSAGES.REQUIRED.FIELD("Slug");
    } else if (
      data.slug.length < VALIDATION_RULES.SLUG.MIN_LENGTH ||
      data.slug.length > VALIDATION_RULES.SLUG.MAX_LENGTH
    ) {
      errors.slug = `Slug must be between ${VALIDATION_RULES.SLUG.MIN_LENGTH} and ${VALIDATION_RULES.SLUG.MAX_LENGTH} characters`;
    }

    if (!data.description) {
      errors.description = VALIDATION_MESSAGES.REQUIRED.FIELD("Description");
    } else if (
      data.description.length < VALIDATION_RULES.SHOP.DESCRIPTION.MIN_LENGTH
    ) {
      errors.description = `Description must be at least ${VALIDATION_RULES.SHOP.DESCRIPTION.MIN_LENGTH} characters`;
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Validation failed",
          errors,
        },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingShopQuery = Collections.shops().where(
      "slug",
      "==",
      data.slug
    );
    const existingShopSnapshot = await existingShopQuery.get();

    if (!existingShopSnapshot.empty) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Shop slug already exists. Please choose a different slug.",
        },
        { status: 400 }
      );
    }

    // Create shop object
    const shopData = {
      owner_id: userId,
      /** Name */
      name: data.name,
      /** Slug */
      slug: data.slug,
      /** Description */
      description: data.description,
      /** Location */
      location: data.location || null,
      /** Phone */
      phone: data.phone || null,
      /** Email */
      email: data.email || null,
      /** Website */
      website: data.website || null,
      logo: null, // Will be uploaded in edit page
      banner: null, // Will be uploaded in edit page
      /** Rating */
      rating: 0,
      review_count: 0,
      product_count: 0,
      is_verified: false,
      is_featured: false,
      show_on_homepage: false,
      is_banned: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Save to Firestore - Use slug as document ID for SEO
    const shopsRef = Collections.shops();
    await shopsRef.doc(data.slug).set(shopData);

    const shop = {
      id: data.slug, // id === slug
      ...shopData,
    };

    return NextResponse.json({
      /** Success */
      success: true,
      shop,
      /** Message */
      message: "Shop created successfully. You can now upload logo and banner.",
    });
  } catch (error) {
    logError(error as Error, { component: "API.shops.POST" });
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: "Failed to create shop",
      },
      { status: 500 }
    );
  }
}
