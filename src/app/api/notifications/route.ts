/**
 * @fileoverview TypeScript Module
 * @module src/app/api/notifications/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Notifications API
 * Epic: E016 - Notifications System
 *
 * GET: List user notifications with Sieve pagination
 * POST: Create notification (admin only)
 * PATCH: Mark notifications as read
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { notificationsSieveConfig } from "@/app/api/lib/sieve/config";
import { createPaginationMeta } from "@/app/api/lib/sieve/firestore";
import { parseSieveQuery } from "@/app/api/lib/sieve/parser";
import { COLLECTIONS } from "@/constants/database";
import { NextRequest, NextResponse } from "next/server";

/**
 * NotificationBE interface
 * 
 * @interface
 * @description Defines the structure and contract for NotificationBE
 */
export interface NotificationBE {
  /** Id */
  id: string;
  /** User Id */
  userId: string;
  /** Type */
  type:
    | "order"
    | "auction"
    | "bid"
    | "message"
    | "system"
    | "payment"
    | "shipping"
    | "review";
  /** Title */
  title: string;
  /** Message */
  message: string;
  /** Read */
  read: boolean;
  /** Link */
  link?: string;
  /** Metadata */
  metadata?: Record<string, unknown>;
  /** Created At */
  createdAt: string;
  /** Read At */
  readAt?: string;
}

// Extended Sieve config with field mappings for notifications
const notificationsConfig = {
  ...notificationsSieveConfig,
  /** Field Mappings */
  fieldMappings: {
    /** User Id */
    userId: "userId",
    /** Created At */
    createdAt: "createdAt",
    /** Read At */
    readAt: "readAt",
  } as Record<string, string>,
};

/**
 * Transform notification document to API response format
 */
/**
 * Transforms notification
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformnotification result
 */

/**
 * Transforms notification
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformnotification result
 */

function transformNotification(id: string, data: any): NotificationBE {
  return {
    id,
    /** User Id */
    userId: data.userId,
    /** Type */
    type: data.type,
    /** Title */
    title: data.title,
    /** Message */
    message: data.message,
    /** Read */
    read: data.read,
    /** Link */
    link: data.link,
    /** Metadata */
    metadata: data.metadata,
    /** Created At */
    createdAt: data.createdAt,
    /** Read At */
    readAt: data.readAt,
  };
}

/**
 * GET /api/notifications
 * List notifications for the authenticated user with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-createdAt&filters=read==false
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
    const auth = await getAuthFromRequest(request);

    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse Sieve query
    const {
      /** Query */
      query: sieveQuery,
      errors,
      warnings,
    } = parseSieveQuery(searchParams, notificationsConfig);

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

    // Legacy query param support (backward compatibility)
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const db = getFirestoreAdmin();
    let query: FirebaseFirestore.Query = db
      .collection(COLLECTIONS.NOTIFICATIONS)
      .where("userId", "==", auth.user.uid);

    // Legacy filter support
    if (unreadOnly) {
      query = query.where("read", "==", false);
    }

    // Apply Sieve filters
    for (const filter of sieveQuery.filters) {
      const dbField =
        notificationsConfig.fieldMappings[filter.field] || filter.field;
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
        const dbField =
          notificationsConfig.fieldMappings[sort.field] || sort.field;
        query = query.orderBy(dbField, sort.direction);
      }
    } else {
      query = query.orderBy("createdAt", "desc");
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
 * Performs notifications operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The notifications result
 *
 */
const notifications = snapshot.docs.map((doc) =>
      transformNotification(doc.id, doc.data())
    );

    // Build response with Sieve pagination meta
    const pagination = createPaginationMeta(totalCount, sieveQuery);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: {
        notifications,
        pagination,
      },
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
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification (admin only or internal use)
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
    const auth = await getAuthFromRequest(request);

    // Only admins or internal calls can create notifications
    if (!auth.user || auth.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, type, title, message, link, metadata } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Missing required fields: userId, type, title, message",
        },
        { status: 400 }
      );
    }

    const db = getFirestoreAdmin();
    const now = new Date().toISOString();

    const notification: Omit<NotificationBE, "id"> = {
      userId,
      type,
      title,
      message,
      /** Read */
      read: false,
      link,
      metadata,
      /** Created At */
      createdAt: now,
    };

    const docRef = await db
      .collection(COLLECTIONS.NOTIFICATIONS)
      .add(notification);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: {
        /** Id */
        id: docRef.id,
        ...notification,
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 */
/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(request);
 */

/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(request);
 */

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);

    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationIds, markAll } = body;

    const db = getFirestoreAdmin();
    const batch = db.batch();
    const now = new Date().toISOString();

    if (markAll) {
      // Mark all unread notifications as read
      const unreadSnapshot = await db
        .collection(COLLECTIONS.NOTIFICATIONS)
        .where("userId", "==", auth.user.uid)
        .where("read", "==", false)
        .get();

      unreadSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true, readAt: now });
      });

      await batch.commit();

      return NextResponse.json({
        /** Success */
        success: true,
        /** Data */
        data: { marked: unreadSnapshot.size },
      });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { success: false, error: "notificationIds array required" },
        { status: 400 }
      );
    }

    // Verify ownership and mark specific notifications as read
    for (const id of notificationIds) {
      const docRef = db.collection(COLLECTIONS.NOTIFICATIONS).doc(id);
      const doc = await docRef.get();

      if (doc.exists && doc.data()?.userId === auth.user.uid) {
        batch.update(docRef, { read: true, readAt: now });
      }
    }

    await batch.commit();

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: { marked: notificationIds.length },
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * Delete notifications
 */
/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(request);
 */

/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(request);
 */

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);

    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");
    const deleteAll = searchParams.get("deleteAll") === "true";
    const deleteRead = searchParams.get("deleteRead") === "true";

    const db = getFirestoreAdmin();
    const batch = db.batch();

    if (deleteAll) {
      const allSnapshot = await db
        .collection(COLLECTIONS.NOTIFICATIONS)
        .where("userId", "==", auth.user.uid)
        .get();

      allSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      return NextResponse.json({
        /** Success */
        success: true,
        /** Data */
        data: { deleted: allSnapshot.size },
      });
    }

    if (deleteRead) {
      const readSnapshot = await db
        .collection(COLLECTIONS.NOTIFICATIONS)
        .where("userId", "==", auth.user.uid)
        .where("read", "==", true)
        .get();

      readSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      return NextResponse.json({
        /** Success */
        success: true,
        /** Data */
        data: { deleted: readSnapshot.size },
      });
    }

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: "Notification id required" },
        { status: 400 }
      );
    }

    // Delete single notification
    const docRef = db.collection(COLLECTIONS.NOTIFICATIONS).doc(notificationId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    if (doc.data()?.userId !== auth.user.uid) {
      return NextResponse.json(
        { success: false, error: "Not authorized" },
        { status: 403 }
      );
    }

    await docRef.delete();

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: { deleted: 1 },
    });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete notifications" },
      { status: 500 }
    );
  }
}
