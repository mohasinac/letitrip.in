import { NextRequest, NextResponse } from "next/server";
import { createAdminHandler } from "@/lib/auth/api-middleware";
import { getAdminDb } from "@/lib/database/admin";
import { API_RESPONSES, HTTP_STATUS, PAGINATION_DEFAULTS, NOTIFICATION_CONSTANTS } from "@/lib/api/constants";

export const GET = createAdminHandler(async (request: NextRequest, user) => {
  try {

    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || PAGINATION_DEFAULTS.DEFAULT_PAGE.toString());
    const limit = Math.min(
      parseInt(searchParams.get('limit') || PAGINATION_DEFAULTS.DEFAULT_LIMIT.toString()),
      PAGINATION_DEFAULTS.MAX_LIMIT
    );
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    let query: any = db.collection('notifications');

    // Apply filters
    if (type) {
      query = query.where('type', '==', type);
    }
    if (isActive !== null) {
      query = query.where('isActive', '==', isActive === 'true');
    }

    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const notifications = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });

    // Get total count for pagination
    const totalSnapshot = await db.collection('notifications').get();
    const total = totalSnapshot.size;

    return NextResponse.json(
      API_RESPONSES.SUCCESS({
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      })
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
});

export const POST = createAdminHandler(async (request: NextRequest, user) => {
  try {

    const data = await request.json();
    const { title, message, type, targetAudience, isActive = true } = data;

    if (!title || !message || !type || !targetAudience) {
      return NextResponse.json(
        { error: "Missing required fields: title, message, type, targetAudience" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const notificationData = {
      title,
      message,
      type,
      targetAudience,
      isActive,
      createdBy: user.userId || 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('notifications').add(notificationData);
    
    return NextResponse.json({
      id: docRef.id,
      ...notificationData,
      createdAt: notificationData.createdAt.toISOString(),
      updatedAt: notificationData.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
});
