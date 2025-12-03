/**
 * Notifications API
 * Epic: E016 - Notifications System
 *
 * GET: List user notifications with Sieve pagination
 * POST: Create notification (admin only)
 * PATCH: Mark notifications as read
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import {
  parseSieveQuery,
  notificationsSieveConfig,
  createPaginationMeta,
} from "@/app/api/lib/sieve";

export interface NotificationBE {
  id: string;
  userId: string;
  type:
    | "order"
    | "auction"
    | "bid"
    | "message"
    | "system"
    | "payment"
    | "shipping"
    | "review";
  title: string;
  message: string;
  read: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  readAt?: string;
}

// Extended Sieve config with field mappings for notifications
const notificationsConfig = {
  ...notificationsSieveConfig,
  fieldMappings: {
    userId: "userId",
    createdAt: "createdAt",
    readAt: "readAt",
  } as Record<string, string>,
};

/**
 * Transform notification document to API response format
 */
function transformNotification(id: string, data: any): NotificationBE {
  return {
    id,
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    read: data.read,
    link: data.link,
    metadata: data.metadata,
    createdAt: data.createdAt,
    readAt: data.readAt,
  };
}

/**
 * GET /api/notifications
 * List notifications for the authenticated user with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-createdAt&filters=read==false
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);

    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse Sieve query
    const {
      query: sieveQuery,
      errors,
      warnings,
    } = parseSieveQuery(searchParams, notificationsConfig);

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: errors,
        },
        { status: 400 },
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
          filter.value,
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
    const notifications = snapshot.docs.map((doc) =>
      transformNotification(doc.id, doc.data()),
    );

    // Build response with Sieve pagination meta
    const pagination = createPaginationMeta(totalCount, sieveQuery);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination,
      },
      meta: {
        appliedFilters: sieveQuery.filters,
        appliedSorts: sieveQuery.sorts,
        warnings: warnings.length > 0 ? warnings : undefined,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification (admin only or internal use)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);

    // Only admins or internal calls can create notifications
    if (!auth.user || auth.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { userId, type, title, message, link, metadata } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: userId, type, title, message",
        },
        { status: 400 },
      );
    }

    const db = getFirestoreAdmin();
    const now = new Date().toISOString();

    const notification: Omit<NotificationBE, "id"> = {
      userId,
      type,
      title,
      message,
      read: false,
      link,
      metadata,
      createdAt: now,
    };

    const docRef = await db
      .collection(COLLECTIONS.NOTIFICATIONS)
      .add(notification);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...notification,
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create notification" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);

    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
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
        success: true,
        data: { marked: unreadSnapshot.size },
      });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { success: false, error: "notificationIds array required" },
        { status: 400 },
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
      success: true,
      data: { marked: notificationIds.length },
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark notifications as read" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/notifications
 * Delete notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);

    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
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
        success: true,
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
        success: true,
        data: { deleted: readSnapshot.size },
      });
    }

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: "Notification id required" },
        { status: 400 },
      );
    }

    // Delete single notification
    const docRef = db.collection(COLLECTIONS.NOTIFICATIONS).doc(notificationId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 },
      );
    }

    if (doc.data()?.userId !== auth.user.uid) {
      return NextResponse.json(
        { success: false, error: "Not authorized" },
        { status: 403 },
      );
    }

    await docRef.delete();

    return NextResponse.json({
      success: true,
      data: { deleted: 1 },
    });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete notifications" },
      { status: 500 },
    );
  }
}
