/**
 * @fileoverview TypeScript Module
 * @module src/app/api/tickets/[id]/reply/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { requireAuth } from "@/app/api/middleware/rbac-auth";
import { COLLECTIONS, SUBCOLLECTIONS } from "@/constants/database";
import { ValidationError } from "@/lib/api-errors";
import { logError } from "@/lib/firebase-error-logger";
import { canReadResource } from "@/lib/rbac-permissions";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/tickets/[id]/reply
 * Reply to a support ticket
 * - Owner: Can reply to own tickets
 * - Seller: Can reply to shop-related tickets
 * - Admin: Can reply to any ticket (with internal message option)
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request, {});
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(/** Request */
  request, {});
 */

export async function POST(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let ticketId: string | undefined;
  let user: any;
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    user = authResult.user!;

    const awaitedParams = await params;
    ticketId = awaitedParams.id;

    const data = await request.json();
    const { message, isInternal, attachments } = data;

    // Validation
    if (!message || message.trim().length < 1) {
      throw new ValidationError("Validation failed", {
        /** Message */
        message: "Message cannot be empty",
      });
    }

    const db = getFirestoreAdmin();
    const ticketRef = db.collection(COLLECTIONS.SUPPORT_TICKETS).doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticketData = ticketDoc.data();

    // Check permissions
    if (!canReadResource(user, "tickets", ticketData)) {
      return NextResponse.json(
        { error: "You don't have permission to reply to this ticket" },
        { status: 403 },
      );
    }

    // Only admins can send internal messages
    const messageIsInternal = isInternal === true && user.role === "admin";

    // Add message to subcollection
    const now = new Date();
    const messageData = {
      ticketId,
      /** Sender Id */
      senderId: user.uid,
      /** Sender Role */
      senderRole: user.role,
      /** Message */
      message: message.trim(),
      /** Attachments */
      attachments: attachments || [],
      /** Is Internal */
      isInternal: messageIsInternal,
      /** Created At */
      createdAt: now,
    };

    const messageRef = await ticketRef
      .collection(SUBCOLLECTIONS.TICKET_MESSAGES)
      .add(messageData);

    // Update ticket status
    const ticketStatus = ticketData?.status;
    const updates: any = { updatedAt: now };

    if (ticketStatus === "open" && user.role !== "user") {
      // Admin or seller responding to open ticket -> set to in-progress
      updates.status = "in-progress";
    } else if (ticketStatus === "resolved" || ticketStatus === "closed") {
      // User responding to resolved/closed ticket -> reopen
      if (user.role === "user") {
        updates.status = "open";
        updates.resolvedAt = null;
      }
    }

    await ticketRef.update(updates);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: {
        /** Id */
        id: messageRef.id,
        ...messageData,
      },
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, errors: error.errors },
        { status: 400 },
      );
    }
    logError(error as Error, {
      /** Component */
      component: "API.tickets.reply",
      /** Metadata */
      metadata: { ticketId, userId: user?.uid },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
