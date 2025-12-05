/**
 * @fileoverview TypeScript Module
 * @module src/app/api/favorites/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { getCurrentUser } from "@/app/api/lib/session";
import { favoritesSieveConfig } from "@/app/api/lib/sieve/config";
import { createPaginationMeta } from "@/app/api/lib/sieve/firestore";
import { parseSieveQuery } from "@/app/api/lib/sieve/parser";
import { COLLECTIONS } from "@/constants/database";
import { NextRequest, NextResponse } from "next/server";

// Extended Sieve config with field mappings for favorites
const favoritesConfig = {
  ...favoritesSieveConfig,
  /** Field Mappings */
  fieldMappings: {
    /** User Id */
    userId: "user_id",
    /** Item Id */
    itemId: "product_id",
    /** Created At */
    createdAt: "created_at",
  } as Record<string, string>,
};

/**
 * GET /api/favorites
 * Get user's favorites with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-createdAt
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
    const searchParams = req.nextUrl.searchParams;

    // Get user from session
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }
    const userId = user.id;

    // Parse Sieve query
    const {
      /** Query */
      query: sieveQuery,
      errors,
      warnings,
    } = parseSieveQuery(searchParams, favoritesConfig);

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

    let query: FirebaseFirestore.Query = db
      .collection(COLLECTIONS.FAVORITES)
      .where("user_id", "==", userId);

    // Apply Sieve filters
    for (const filter of sieveQuery.filters) {
      const dbField =
        favoritesConfig.fieldMappings[filter.field] || filter.field;
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
        const dbField = favoritesConfig.fieldMappings[sort.field] || sort.field;
        query = query.orderBy(dbField, sort.direction);
      }
    } else {
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
 * Performs favorites operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The favorites result
 *
 */
const favorites = snapshot.docs.map((doc) => ({
      /** Id */
/**
 * Performs product ids operation
 *
 * @param {any} (fav - The (fav
 *
 * @returns {any} The productids result
 *
 */
      id: doc.id,
      ...doc.data(),
    }));

    // Get product details for each favorite (batch approach)
    const productIds = favorites.map((fav: any) => fav.pr/**
 * Performs favorite operation
 *
 * @param {any} (f - The (f
 *
 * @returns {any} The favorite result
 *
 */
oduct_id);
    const products = [];

    for (const productId of productIds) {
      const productDoc = await db
        .collection(COLLECTIONS.PRODUCTS)
        .doc(productId)
        .get();
      if (productDoc.exists) {
        const favorite = favorites.find((f: any) => f.product_id === productId);
        products.push({
          /** Id */
          id: productDoc.id,
          ...productDoc.data(),
          favorited_at: favorite ? (favorite as any).created_at : null,
        });
      }
    }

    // Build response with Sieve pagination meta
    const pagination = createPaginationMeta(totalCount, sieveQuery);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: products,
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
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add to favorites
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

    // Get user from session
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }
    const userId = user.id;

    if (!body.product_id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if already favorited
    const existing = await db
      .collection(COLLECTIONS.FAVORITES)
      .where("user_id", "==", userId)
      .where("product_id", "==", body.product_id)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        { error: "Product already in favorites" },
        { status: 400 }
      );
    }

    // Add to favorites
    const favoriteData = {
      user_id: userId,
      product_id: body.product_id,
      created_at: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTIONS.FAVORITES).add(favoriteData);

    return NextResponse.json(
      {
        /** Id */
        id: docRef.id,
        ...favoriteData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}
