import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/api/lib/session";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

/**
 * POST /api/support
 * Create a new support ticket
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request
    const data = await request.json();
    const { subject, category, priority, description, attachments, shopId, orderId } = data;

    // Validation
    if (!subject || subject.trim().length < 3) {
      return NextResponse.json(
        { error: "Subject must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    const validCategories = [
      "order-issue",
      "return-refund",
      "product-question",
      "account",
      "payment",
      "other",
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const validPriorities = ["low", "medium", "high", "urgent"];
    const ticketPriority = priority && validPriorities.includes(priority) ? priority : "medium";

    // Database operation
    const db = getFirestoreAdmin();
    const ticketsRef = db.collection("support_tickets");

    const now = new Date();
    const ticket = {
      userId: user.id,
      subject: subject.trim(),
      category,
      priority: ticketPriority,
      description: description.trim(),
      attachments: attachments || [],
      shopId: shopId || null,
      orderId: orderId || null,
      status: "open",
      assignedTo: null,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
    };

    const docRef = await ticketsRef.add(ticket);

    // Log ticket creation
    console.log("Support ticket created:", {
      ticketId: docRef.id,
      userId: user.id,
      subject,
      category,
      priority: ticketPriority,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...ticket,
      },
    });
  } catch (error: any) {
    console.error("Error creating support ticket:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
