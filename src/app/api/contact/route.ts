/**
 * API Route: Contact Form
 * GET /api/contact - List contact messages (admin only)
 * POST /api/contact - Submit contact form (public access)
 * 
 * Features:
 * - Public contact form submission
 * - Admin-only message viewing with filters
 * - Email validation
 * - Message categorization and priority
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "../_lib/database/admin";
import { Timestamp } from "firebase-admin/firestore";
import { AuthorizationError, ValidationError } from "../_lib/middleware/error-handler";

const auth = getAdminAuth();
const db = getAdminDb();

/**
 * Helper function to verify admin authentication
 */
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthorizationError("Missing or invalid authorization header");
  }

  const token = authHeader.substring(7);
  const decodedToken = await auth.verifyIdToken(token);

  // Check if user is admin
  if (!decodedToken.admin && decodedToken.role !== "admin") {
    throw new AuthorizationError("Admin access required");
  }

  return decodedToken;
}

/**
 * POST /api/contact
 * Submit contact form (public access, no authentication required)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.subject || !body.message) {
      throw new ValidationError("Email, subject, and message are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      throw new ValidationError("Invalid email format");
    }

    // Validate lengths
    if (body.subject.length < 3) {
      throw new ValidationError("Subject must be at least 3 characters");
    }

    if (body.message.length < 10) {
      throw new ValidationError("Message must be at least 10 characters");
    }

    // Create contact message
    const contactMessageData = {
      email: body.email.trim().toLowerCase(),
      name: body.name?.trim() || "Anonymous",
      phone: body.phone?.trim() || null,
      subject: body.subject.trim(),
      message: body.message.trim(),
      status: "new",
      priority: "normal",
      category: "general",
      source: "website",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await db.collection("contactMessages").add(contactMessageData);

    // Generate reference number
    const reference = `REF-${docRef.id.slice(-8).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        reference,
        estimatedResponse: "Within 24 hours",
      },
      message: "Your message has been sent successfully. We'll get back to you within 24 hours.",
    }, { status: 201 });
  } catch (error) {
    console.error("Error submitting contact form:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit contact form",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/contact
 * List contact messages (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const status = searchParams.get("status") || "all";
    const priority = searchParams.get("priority") || "all";
    const category = searchParams.get("category") || "all";

    // Build Firestore query
    let query = db.collection("contactMessages").orderBy("createdAt", "desc");

    // Apply status filter
    if (status !== "all") {
      query = query.where("status", "==", status) as any;
    }

    // Apply priority filter
    if (priority !== "all") {
      query = query.where("priority", "==", priority) as any;
    }

    // Apply category filter
    if (category !== "all") {
      query = query.where("category", "==", category) as any;
    }

    // Get all matching documents
    const snapshot = await query.get();
    const allMessages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });

    // Calculate pagination
    const offset = (page - 1) * limit;
    const paginatedMessages = allMessages.slice(offset, offset + limit);
    const totalMessages = allMessages.length;
    const totalPages = Math.ceil(totalMessages / limit);

    // Calculate summary statistics
    const summary = {
      totalMessages,
      newMessages: allMessages.filter((msg: any) => msg.status === "new").length,
      inProgressMessages: allMessages.filter((msg: any) => msg.status === "in-progress").length,
      resolvedMessages: allMessages.filter((msg: any) => msg.status === "resolved").length,
      highPriorityMessages: allMessages.filter((msg: any) => msg.priority === "high").length,
    };

    return NextResponse.json({
      success: true,
      data: {
        messages: paginatedMessages,
        pagination: {
          currentPage: page,
          totalPages,
          totalMessages,
          pageSize: limit,
          hasMore: offset + limit < totalMessages,
        },
        summary,
      },
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes("Missing or invalid") ? 401 : 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch contact messages",
      },
      { status: 500 }
    );
  }
}
