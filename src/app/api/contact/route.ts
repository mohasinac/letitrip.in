import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/config";
import { collection, addDoc, getDocs, query, orderBy, where } from "firebase/firestore";
import { getCurrentUser } from "@/lib/auth/jwt";

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

    // Create contact message in Firestore
    const contactMessageData = {
      email,
      name: name || "Anonymous",
      phone: phone || null,
      subject,
      message,
      status: "new",
      priority: "normal",
      category: "general", // Could be determined from subject/message
      source: "website",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, "contactMessages"), contactMessageData);

    const contactMessage = {
      id: docRef.id,
      ...contactMessageData,
      createdAt: contactMessageData.createdAt.toISOString(),
      updatedAt: contactMessageData.updatedAt.toISOString()
    };

    // TODO: In a real implementation, you would:
    // 1. Send email notification to admin
    // 2. Send auto-reply to user
    // 3. Add to customer support system

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
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "all"; // all, new, in-progress, resolved
    const priority = searchParams.get("priority") || "all"; // all, low, normal, high
    const category = searchParams.get("category") || "all"; // all, general, technical, billing, feedback
    const offset = (page - 1) * limit;

    // Fetch contact messages from Firestore
    let messagesQuery = query(
      collection(db, "contactMessages"),
      orderBy("createdAt", "desc")
    );

    const messagesSnapshot = await getDocs(messagesQuery);
    let allMessages = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
    })) as any[];

    // Apply filters
    if (status !== "all") {
      allMessages = allMessages.filter(msg => msg.status === status);
    }
    if (priority !== "all") {
      allMessages = allMessages.filter(msg => msg.priority === priority);
    }
    if (category !== "all") {
      allMessages = allMessages.filter(msg => msg.category === category);
    }

    // Apply pagination
    const paginatedMessages = allMessages.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        messages: paginatedMessages,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(allMessages.length / limit),
          totalMessages: allMessages.length,
          hasMore: offset + limit < allMessages.length
        },
        summary: {
          totalMessages: allMessages.length,
          newMessages: allMessages.filter(msg => msg.status === "new").length,
          inProgressMessages: allMessages.filter(msg => msg.status === "in-progress").length,
          resolvedMessages: allMessages.filter(msg => msg.status === "resolved").length,
          highPriorityMessages: allMessages.filter(msg => msg.priority === "high").length
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
