import {
  createApiHandler,
  successResponse,
  errorResponse,
  HTTP_STATUS,
} from "@/lib/api";
import { commonSchemas } from "@/lib/api/validation";
import { db } from "@/lib/database/config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { getCurrentUser } from "@/lib/auth/jwt";
import { z } from "zod";

const contactSchema = z.object({
  email: commonSchemas.email,
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  name: z.string().optional(),
  phone: z.string().optional(),
});

/**
 * POST /api/contact
 * REFACTORED: Uses standardized API utilities and validation
 */
export const POST = createApiHandler(async (request) => {
  const body = await request.json();

  // Validate input
  const validation = contactSchema.safeParse(body);
  if (!validation.success) {
    return errorResponse(
      "Validation failed",
      HTTP_STATUS.BAD_REQUEST,
      validation.error.errors,
    );
  }

  const { email, subject, message, name, phone } = validation.data;

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
    updatedAt: new Date(),
  };

  const docRef = await addDoc(
    collection(db, "contactMessages"),
    contactMessageData,
  );

  const contactMessage = {
    id: docRef.id,
    ...contactMessageData,
    createdAt: contactMessageData.createdAt.toISOString(),
    updatedAt: contactMessageData.updatedAt.toISOString(),
  };

  // TODO: In a real implementation, you would:
  // 1. Send email notification to admin
  // 2. Send auto-reply to user
  // 3. Add to customer support system

  console.log("Contact form submission:", contactMessage);

  return successResponse(
    {
      id: contactMessage.id,
      reference: `REF-${contactMessage.id.slice(-8).toUpperCase()}`,
      estimatedResponse: "Within 24 hours",
    },
    "Your message has been sent successfully. We'll get back to you within 24 hours.",
    HTTP_STATUS.CREATED,
  );
});

/**
 * GET /api/contact
 * Admin endpoint to view contact messages
 * REFACTORED: Uses standardized API utilities
 */
export const GET = createApiHandler(async (request) => {
  // Check if user is admin - for admin to view contact messages
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return errorResponse("Admin access required", HTTP_STATUS.FORBIDDEN);
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
    orderBy("createdAt", "desc"),
  );

  const messagesSnapshot = await getDocs(messagesQuery);
  let allMessages = messagesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt:
      doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    updatedAt:
      doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
  })) as any[];

  // Apply filters
  if (status !== "all") {
    allMessages = allMessages.filter((msg) => msg.status === status);
  }
  if (priority !== "all") {
    allMessages = allMessages.filter((msg) => msg.priority === priority);
  }
  if (category !== "all") {
    allMessages = allMessages.filter((msg) => msg.category === category);
  }

  // Apply pagination
  const paginatedMessages = allMessages.slice(offset, offset + limit);

  return successResponse({
    messages: paginatedMessages,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(allMessages.length / limit),
      totalMessages: allMessages.length,
      hasMore: offset + limit < allMessages.length,
    },
    summary: {
      totalMessages: allMessages.length,
      newMessages: allMessages.filter((msg) => msg.status === "new").length,
      inProgressMessages: allMessages.filter(
        (msg) => msg.status === "in-progress",
      ).length,
      resolvedMessages: allMessages.filter((msg) => msg.status === "resolved")
        .length,
      highPriorityMessages: allMessages.filter((msg) => msg.priority === "high")
        .length,
    },
  });
});
