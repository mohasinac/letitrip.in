import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { getAdminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
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

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      createdBy: user.id || user.sub,
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
}
