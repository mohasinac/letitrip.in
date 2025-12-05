/**
 * @fileoverview TypeScript Module
 * @module src/app/api/tickets/[id]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { requireAuth, requireRole } from "@/app/api/middleware/rbac-auth";
import { COLLECTIONS, SUBCOLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { canReadResource, canWriteResource } from "@/lib/rbac-permissions";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/tickets/[id]
 * Get ticket details with role-based access
 * - Owner: Can view own tickets
 * - Seller: Can view tickets related to their shops
 * - Admin: Can view all tickets
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request, {});
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(/** Request */
  request, {});
 */

export async function GET(
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
        { error: "You don't have permission to view this ticket" },
        { status: 403 },
      );
    }

    // Get conversation messages
    const messagesSnapshot = await ticketRef
      .collection(SUBCOLLECTIONS.TICKET_MESSAGES)
      .orderBy("createdAt", "asc")
      .get();

    const messages = messagesSnapshot.docs
      .map((doc: any) => {
        const data = doc.data();
        // Filter internal messages for non-admin users
        if (data.isInternal && user.role !== "admin") {
          return null;
        }
        return {
          /** Id */
          id: doc.id,
          ...data,
          /** Created At */
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
        };
      })
      .filter(Boolean);

    // Get user details (admin only gets full user info)
    let userData = null;
    if (user.role === "admin" && ticketData?.userId) {
      const userDoc = await db
        .collection(COLLECTIONS.USERS)
        .doc(ticketData.userId)
        .get();
      if (userDoc.exists) {
        const data = userDoc.data();
        userData = {
          /** Id */
          id: userDoc.id,
          /** Name */
          name: data?.name,
          /** Email */
          email: data?.email,
        };
      }
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: {
        /** Id */
        id: ticketDoc.id,
        ...ticketData,
        /** Created At */
        createdAt: ticketData?.createdAt?.toDate?.() || ticketData?.createdAt,
        /** Updated At */
        updatedAt: ticketData?.updatedAt?.toDate?.() || ticketData?.updatedAt,
        /** Resolved At */
        resolvedAt:
          ticketData?.resolvedAt?.toDate?.() || ticketData?.resolvedAt,
        messages,
        ...(userData && { user: userData }),
      },
    });
  } catch (error: any) {
    logError(error as Error, {
      /** Component */
      component: "API.tickets.getDetail",
      /** Metadata */
      metadata: { ticketId, userId: user?.uid },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/tickets/[id]
 * Update ticket
 * - Owner: Can update own tickets (limited fields)
 * - Seller: Can update shop-related tickets (limited fields)
 * - Admin: Can update any ticket (all fields)
 */
/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(request, {});
 */

/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(/** Request */
  request, {});
 */

export async function PATCH(
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
    const { status, assignedTo, priority, subject, description } = data;

    const db = getFirestoreAdmin();
    const ticketRef = db.collection(COLLECTIONS.SUPPORT_TICKETS).doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticketData = ticketDoc.data();

    // Check permissions
    if (!canWriteResource(user, "tickets", ticketData as any)) {
      return NextResponse.json(
        { error: "You don't have permission to update this ticket" },
        { status: 403 },
      );
    }

    const updates: any = {
      /** Updated At */
      updatedAt: new Date(),
    };

    // Admin can update all fields
    if (user.role === "admin") {
      if (status) updates.status = status;
      if (assignedTo !== undefined) updates.assignedTo = assignedTo;
      if (priority) updates.priority = priority;
      if (subject) updates.subject = subject;
      if (description) updates.description = description;

      if (status === "resolved" || status === "closed") {
        updates.resolvedAt = new Date();
      }
    } else {
      // Users and sellers can only update limited fields on open tickets
      if (ticketData?.status !== "open") {
        return NextResponse.json(
          { error: "Can only update open tickets" },
          { status: 403 },
        );
      }
      if (subject) updates.subject = subject;
      if (description) updates.description = description;
    }

    await ticketRef.update(updates);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: {
        /** Id */
        id: ticketId,
        ...updates,
      },
    });
  } catch (error: any) {
    logError(error as Error, {
      /** Component */
      component: "API.tickets.update",
      /** Metadata */
      metadata: { ticketId, userId: user?.uid },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/tickets/[id]
 * Delete ticket (admin only)
 */
/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(request, {});
 */

/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(/** Request */
  request, {});
 */

export async function DELETE(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let ticketId: string | undefined;
  try {
    const roleResult = await requireRole(request, ["admin"]);
    if (roleResult.error) {
      return roleResult.error;
    }

    const awaitedParams = await params;
    ticketId = awaitedParams.id;

    const db = getFirestoreAdmin();
    const ticketRef = db.collection(COLLECTIONS.SUPPORT_TICKETS).doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Delete all messages first
    const messagesSnapshot = await ticketRef
      .collection(SUBCOLLECTIONS.TICKET_MESSAGES)
      .get();
    const batch = db.batch();
    messagesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    batch.delete(ticketRef);
    await batch.commit();

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Ticket deleted successfully",
    });
  } catch (error: any) {
    logError(error as Error, {
      /** Component */
      component: "API.tickets.delete",
      /** Metadata */
      metadata: { ticketId },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
