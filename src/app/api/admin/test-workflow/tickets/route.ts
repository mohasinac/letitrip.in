import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/api/lib/session";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await getCurrentUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { count = 2, userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    if (count < 1 || count > 10) {
      return NextResponse.json(
        { success: false, error: "count must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Get Firestore instance
    const db = getFirestoreAdmin();

    const subjects = [
      "Order Issue", "Product Question", "Account Problem",
      "Technical Support", "Shipping Inquiry", "Payment Issue"
    ];

    const categories = ["order", "product", "account", "technical", "other"];
    const statuses = ["open", "in-progress", "resolved"];
    const createdIds: string[] = [];

    // Create tickets
    for (let i = 0; i < count; i++) {
      const ticketId = `TEST_TICKET_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;
      const subject = subjects[Math.floor(Math.random() * subjects.length)];

      const ticketData = {
        id: ticketId,
        subject: `TEST_${subject} #${i + 1}`,
        description: `Test support ticket for development purposes. Ticket ID: ${ticketId}. This is a test description with enough content to be meaningful.`,
        userId,
        category: categories[Math.floor(Math.random() * categories.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: Math.random() > 0.7 ? "high" : "medium",
        assignedTo: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        resolvedAt: null,
      };

      await db.collection("support_tickets").doc(ticketId).set(ticketData);

      // Add initial message
      await db.collection("support_tickets").doc(ticketId).collection("messages").add({
        message: ticketData.description,
        sender: "user",
        senderId: userId,
        createdAt: new Date().toISOString(),
      });

      createdIds.push(ticketId);
    }

    return NextResponse.json({
      success: true,
      data: { ids: createdIds, count: createdIds.length },
      message: `${createdIds.length} test tickets created successfully`
    });
  } catch (error: any) {
    console.error("Error creating test tickets:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create test tickets" },
      { status: 500 }
    );
  }
}
