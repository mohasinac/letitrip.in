import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * GET /api/admin/support
 * List all support tickets with filters
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || "user";

    // Only admins can access
    if (role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const priority = searchParams.get("priority") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const db = getAdminDb();
    
    // Build query
    let query = db.collection("support_tickets").orderBy("createdAt", "desc");

    // Apply status filter
    if (status !== "all") {
      query = query.where("status", "==", status) as any;
    }

    // Apply priority filter
    if (priority !== "all") {
      query = query.where("priority", "==", priority) as any;
    }

    // Get tickets
    const snapshot = await query.limit(limit).offset((page - 1) * limit).get();

    const tickets = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ticketNumber: data.ticketNumber,
        subject: data.subject,
        category: data.category,
        status: data.status,
        priority: data.priority,
        userId: data.userId,
        userName: data.userName || "Unknown User",
        userEmail: data.userEmail || "",
        sellerId: data.sellerId,
        sellerName: data.sellerName || null,
        messages: data.messages?.length || 0,
        lastReply: data.lastReply?.toDate?.()?.toISOString() || data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    });

    // Get total count for pagination
    const totalSnapshot = await db.collection("support_tickets").count().get();
    const total = totalSnapshot.data().count;

    return NextResponse.json({
      success: true,
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching support tickets:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch support tickets",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/support
 * Create a new support ticket (admin creating on behalf of user)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || "user";

    // Only admins can access
    if (role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const db = getAdminDb();
    const body = await request.json();
    const { subject, description, category, priority, userId, userEmail, userName } = body;

    // Validate required fields
    if (!subject || !description || !category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create ticket
    const ticketRef = await db.collection("support_tickets").add({
      ticketNumber,
      subject,
      category,
      priority: priority || "medium",
      status: "open",
      userId: userId || null,
      userName: userName || "Guest",
      userEmail: userEmail || "",
      sellerId: null,
      sellerName: null,
      messages: [
        {
          id: `msg-${Date.now()}`,
          text: description,
          sender: "user",
          senderName: userName || "Guest",
          createdAt: new Date(),
        },
      ],
      assignedTo: null,
      lastReply: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: decodedToken.uid,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: ticketRef.id,
          ticketNumber,
        },
        message: "Support ticket created successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating support ticket:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create support ticket",
      },
      { status: 500 }
    );
  }
}
