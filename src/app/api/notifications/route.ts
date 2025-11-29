/**
 * Notifications API
 * Epic: E016 - Notifications System
 *
 * GET: List user notifications with pagination
 * POST: Create notification (admin only)
 * PATCH: Mark notifications as read
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

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

/**
 * GET /api/notifications
 * List notifications for the authenticated user
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
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const db = getFirestoreAdmin();
    let query = db
      .collection(COLLECTIONS.NOTIFICATIONS)
      .where("userId", "==", auth.user.uid)
      .orderBy("createdAt", "desc");

    if (unreadOnly) {
      query = query.where("read", "==", false);
    }

    // Get total count
    const countSnapshot = await db
      .collection(COLLECTIONS.NOTIFICATIONS)
      .where("userId", "==", auth.user.uid)
      .count()
      .get();
    const total = countSnapshot.data().count || 0;

    // Get paginated notifications
    const offset = (page - 1) * pageSize;
    const snapshot = await query.offset(offset).limit(pageSize).get();

    const notifications: NotificationBE[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as NotificationBE[];

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
          hasNext: offset + notifications.length < total,
          hasPrev: page > 1,
        },
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
        { success: false, error: "Missing required fields: userId, type, title, message" },
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
      read: false,
      link,
      metadata,
      createdAt: now,
    };

    const docRef = await db.collection(COLLECTIONS.NOTIFICATIONS).add(notification);

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
      { status: 500 }
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
        success: true,
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
      success: true,
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
      success: true,
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
