import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";

// GET /api/admin/notifications - Get all notifications with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const isRead = searchParams.get("isRead");
    const severity = searchParams.get("severity");
    const userId = searchParams.get("userId");
    const search = searchParams.get("search");

    const db = getAdminDb();
    let query = db.collection("seller_alerts");

    // Apply filters
    if (type && type !== "all") {
      query = query.where("type", "==", type) as any;
    }
    if (isRead && isRead !== "all") {
      query = query.where("isRead", "==", isRead === "true") as any;
    }
    if (severity && severity !== "all") {
      query = query.where("severity", "==", severity) as any;
    }
    if (userId) {
      query = query.where("sellerId", "==", userId) as any;
    }

    const snapshot = await query.orderBy("createdAt", "desc").limit(200).get();

    let notifications = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      readAt: doc.data().readAt?.toDate?.()?.toISOString() || doc.data().readAt,
    }));

    // Apply search filter (client-side for flexible searching)
    if (search) {
      const searchLower = search.toLowerCase();
      notifications = notifications.filter(
        (notif: any) =>
          notif.title?.toLowerCase().includes(searchLower) ||
          notif.message?.toLowerCase().includes(searchLower) ||
          notif.sellerId?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/admin/notifications - Create new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sellerId,
      type,
      title,
      message,
      severity = "info",
      orderId,
      productId,
      shipmentId,
      actionUrl,
      actionLabel,
    } = body;

    if (!sellerId || !type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const notificationData = {
      sellerId,
      type,
      title,
      message,
      severity,
      orderId: orderId || null,
      productId: productId || null,
      shipmentId: shipmentId || null,
      actionUrl: actionUrl || null,
      actionLabel: actionLabel || null,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("seller_alerts").add(notificationData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      ...notificationData,
    });
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create notification" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/notifications - Bulk update notifications
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const body = await request.json();

    const db = getAdminDb();

    if (action === "bulk-read") {
      const { notificationIds } = body;

      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return NextResponse.json(
          { error: "No notification IDs provided" },
          { status: 400 }
        );
      }

      if (notificationIds.length > 500) {
        return NextResponse.json(
          { error: "Maximum 500 notifications can be updated at once" },
          { status: 400 }
        );
      }

      const batch = db.batch();
      const now = new Date().toISOString();

      for (const id of notificationIds) {
        const ref = db.collection("seller_alerts").doc(id);
        batch.update(ref, {
          isRead: true,
          readAt: now,
        });
      }

      await batch.commit();

      return NextResponse.json({
        success: true,
        updated: notificationIds.length,
      });
    }

    if (action === "bulk-delete") {
      const { notificationIds } = body;

      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return NextResponse.json(
          { error: "No notification IDs provided" },
          { status: 400 }
        );
      }

      if (notificationIds.length > 500) {
        return NextResponse.json(
          { error: "Maximum 500 notifications can be deleted at once" },
          { status: 400 }
        );
      }

      const batch = db.batch();

      for (const id of notificationIds) {
        const ref = db.collection("seller_alerts").doc(id);
        batch.delete(ref);
      }

      await batch.commit();

      return NextResponse.json({
        success: true,
        deleted: notificationIds.length,
      });
    }

    if (action === "mark-read") {
      const { notificationId } = body;

      if (!notificationId) {
        return NextResponse.json(
          { error: "Notification ID is required" },
          { status: 400 }
        );
      }

      await db.collection("seller_alerts").doc(notificationId).update({
        isRead: true,
        readAt: new Date().toISOString(),
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update notifications" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/notifications - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    await db.collection("seller_alerts").doc(notificationId).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete notification" },
      { status: 500 }
    );
  }
}
