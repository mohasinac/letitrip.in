/**
 * @fileoverview TypeScript Module
 * @module src/app/api/users/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { usersSieveConfig } from "@/app/api/lib/sieve/config";
import { createPaginationMeta } from "@/app/api/lib/sieve/firestore";
import { parseSieveQuery } from "@/app/api/lib/sieve/parser";
import { requireRole } from "@/app/api/middleware/rbac-auth";
import {
  VALIDATION_MESSAGES,
  VALIDATION_RULES,
  isValidEmail,
} from "@/constants/validation-messages";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// Extended Sieve config with field mappings for users
const usersConfig = {
  ...usersSieveConfig,
  /** Field Mappings */
  fieldMappings: {
    /** Display Name */
    displayName: "name",
    /** Created At */
    createdAt: "created_at",
    /** Updated At */
    updatedAt: "updated_at",
    /** Last Login */
    lastLogin: "last_login",
    /** Email Verified */
    emailVerified: "email_verified",
    /** Is Banned */
    isBanned: "is_banned",
  } as Record<string, string>,
};

/**
 * Transform user document to API response format
 */
/**
 * Transforms user
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformuser result
 */

/**
 * Transforms user
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformuser result
 */

function transformUser(id: string, data: any) {
  return {
    id,
    ...data,
    /** Display Name */
    displayName: data.name,
    /** Created At */
    createdAt: data.created_at,
    /** Updated At */
    updatedAt: data.updated_at,
    /** Last Login */
    lastLogin: data.last_login,
    /** Email Verified */
    emailVerified: data.email_verified,
    /** Is Banned */
    isBanned: data.is_banned,
  };
}

/**
 * GET /api/users
 * List users with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-createdAt&filters=role==admin
 * - Admin: Can view all users
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
  try {
    // Require admin role for listing users
    const authResult = await requireRole(request, ["admin"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);

    // Parse Sieve query
    const {
      /** Query */
      query: sieveQuery,
      errors,
      warnings,
    } = parseSieveQuery(searchParams, usersConfig);

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

    let query: FirebaseFirestore.Query = Collections.users();

    // Legacy query params support (for backward compatibility)
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Filter by role
    if (role && role !== "all") {
      query = query.where("role", "==", role);
    }

    // Filter by status (banned users have is_banned = true)
    if (status === "banned") {
      query = query.where("is_banned", "==", true);
    } else if (status === "active") {
      query = query.where("is_banned", "==", false);
    }

    // Apply Sieve filters
    for (const filter of sieveQuery.filters) {
      const dbField = usersConfig.fieldMappings[filter.field] || filter.field;
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
        const dbField = usersConfig.fieldMappings[sort.field] || sort.field;
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
    let data = snapshot.docs.map((doc) => transformUser(doc.id, doc.data()));

    // Client-side search filter (Firestore doesn't support full-text search)
    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter(
        (user: any) =>
          user.email?.toLowerCase().includes(searchLower) ||
          user.name?.toLowerCase().includes(searchLower) ||
          user.phone?.includes(search)
      );
    }

    // Build response with Sieve pagination meta
    const pagination = createPaginationMeta(
      search ? data.length : totalCount,
      sieveQuery
    );

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
  } catch (error: any) {
    logError(error as Error, { component: "API.users.list" });
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create a new user (admin only)
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
  let body: any;
  try {
    const authResult = await requireRole(request, ["admin"]);
    if (authResult.error) return authResult.error;

    body = await request.json();
    const { email, name, role = "user", phone } = body;

    // Validation
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = VALIDATION_MESSAGES.REQUIRED.FIELD("Email");
    } else if (!isValidEmail(email)) {
      errors.email = VALIDATION_MESSAGES.EMAIL.INVALID;
    }

    if (!name) {
      errors.name = VALIDATION_MESSAGES.REQUIRED.FIELD("Name");
    } else if (
      name.length < VALIDATION_RULES.NAME.MIN_LENGTH ||
      name.length > VALIDATION_RULES.NAME.MAX_LENGTH
    ) {
      errors.name = `Name must be between ${VALIDATION_RULES.NAME.MIN_LENGTH} and ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`;
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, error: "Validation failed", errors },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await Collections.users()
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      );
    }

    const newUser = {
      email,
      name,
      role,
      /** Phone */
      phone: phone || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_banned: false,
      email_verified: false,
      phone_verified: false,
    };

    const docRef = await Collections.users().add(newUser);
    const userDoc = await docRef.get();

    return NextResponse.json(
      {
        /** Success */
        success: true,
        /** Message */
        message: "User created successfully",
        /** Data */
        data: { id: docRef.id, ...userDoc.data() },
      },
      { status: 201 }
    );
  } catch (error: any) {
    logError(error as Error, {
      /** Component */
      component: "API.users.create",
      /** Metadata */
      metadata: { email: body?.email },
    });

    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
