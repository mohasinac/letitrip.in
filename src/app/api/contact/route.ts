import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, ApiResponse } from "@/lib/auth/middleware";

export async function POST(request: NextRequest) {
  try {
    const { email, subject, message, name, phone } = await request.json();

    // Validate required fields
    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: "Email, subject, and message are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Create contact message - replace with database insert
    const contactMessage = {
      id: `contact_${Date.now()}`,
      email,
      name: name || "Anonymous",
      phone: phone || null,
      subject,
      message,
      status: "new",
      priority: "normal",
      category: "general", // Could be determined from subject/message
      source: "website",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real implementation, you would:
    // 1. Save to database
    // 2. Send email notification to admin
    // 3. Send auto-reply to user
    // 4. Add to customer support system

    // Mock email sending
    console.log("Contact form submission:", contactMessage);

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully. We'll get back to you within 24 hours.",
      data: {
        id: contactMessage.id,
        reference: `REF-${contactMessage.id.slice(-8).toUpperCase()}`,
        estimatedResponse: "Within 24 hours"
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin - for admin to view contact messages
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") {
      return ApiResponse.unauthorized("Admin access required");
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "all"; // all, new, in-progress, resolved
    const priority = searchParams.get("priority") || "all"; // all, low, normal, high
    const category = searchParams.get("category") || "all"; // all, general, technical, billing, feedback
    const offset = (page - 1) * limit;

    // Mock contact messages - replace with database query
    let contactMessages = [
      {
        id: "contact_1",
        email: "john.doe@example.com",
        name: "John Doe",
        phone: "+91 9876543210",
        subject: "Issue with order delivery",
        message: "My order #JV2024001 was supposed to be delivered yesterday but I haven't received it yet. Can you please check the status?",
        status: "resolved",
        priority: "high",
        category: "delivery",
        source: "website",
        assignedTo: "support_agent_1",
        response: "Hi John, we've checked with the courier and your package was delivered to your neighbor. Please check with them.",
        createdAt: "2024-01-20T14:30:00Z",
        updatedAt: "2024-01-21T09:15:00Z"
      },
      {
        id: "contact_2",
        email: "collector.pro@example.com",
        name: "Collector Pro",
        phone: null,
        subject: "Product authenticity question",
        message: "I'm interested in the vintage Beyblade on auction. Can you provide more details about its authenticity?",
        status: "in-progress",
        priority: "normal",
        category: "product",
        source: "website",
        assignedTo: "support_agent_2",
        response: null,
        createdAt: "2024-01-22T11:45:00Z",
        updatedAt: "2024-01-22T11:45:00Z"
      },
      {
        id: "contact_3",
        email: "newuser@example.com",
        name: "New User",
        phone: "+91 8765432109",
        subject: "How to participate in auctions?",
        message: "I'm new to the platform and would like to know how to participate in auctions. Is there a guide available?",
        status: "new",
        priority: "normal",
        category: "general",
        source: "website",
        assignedTo: null,
        response: null,
        createdAt: "2024-01-23T16:20:00Z",
        updatedAt: "2024-01-23T16:20:00Z"
      }
    ];

    // Apply filters
    if (status !== "all") {
      contactMessages = contactMessages.filter(msg => msg.status === status);
    }
    if (priority !== "all") {
      contactMessages = contactMessages.filter(msg => msg.priority === priority);
    }
    if (category !== "all") {
      contactMessages = contactMessages.filter(msg => msg.category === category);
    }

    const paginatedMessages = contactMessages.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        messages: paginatedMessages,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(contactMessages.length / limit),
          totalMessages: contactMessages.length,
          hasMore: offset + limit < contactMessages.length
        },
        summary: {
          totalMessages: contactMessages.length,
          newMessages: contactMessages.filter(msg => msg.status === "new").length,
          inProgressMessages: contactMessages.filter(msg => msg.status === "in-progress").length,
          resolvedMessages: contactMessages.filter(msg => msg.status === "resolved").length,
          highPriorityMessages: contactMessages.filter(msg => msg.priority === "high").length
        }
      }
    });

  } catch (error) {
    console.error("Get contact messages error:", error);
    return NextResponse.json(
      { error: "Failed to get contact messages" },
      { status: 500 }
    );
  }
}
