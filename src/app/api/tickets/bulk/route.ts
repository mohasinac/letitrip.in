/**
 * @fileoverview TypeScript Module
 * @module src/app/api/tickets/bulk/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { requireRole } from "@/app/api/middleware/rbac-auth";
import { COLLECTIONS, SUBCOLLECTIONS } from "@/constants/database";
import { ValidationError } from "@/lib/api-errors";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// Build update object for each action (excluding delete which needs special handling)
/**
 * Function: Build Ticket Update
 */
/**
 * Performs build ticket update operation
 *
 * @param {string} action - The action
 * @param {Date} now - The now
 * @param {any} [updates] - The updates
 *
 * @returns {string} The buildticketupdate result
 */

/**
 * Performs build ticket update operation
 *
 * @returns {string} The buildticketupdate result
 */

function buildTicketUpdate(
  /** Action */
  action: string,
  /** Now */
  now: Date,
  /** Updates */
  updates?: any,
): Record<string, any> | null {
  switch (action) {
    case "update":
      if (!updates || typeof updates !== "object") return null;
      return { ...updates, updatedAt: now };
    case "assign":
      if (!updates?.assignedTo) return null;
      return {
        /** Assigned To */
        assignedTo: updates.assignedTo,
        /** Status */
        status: "in-progress",
        /** Updated At */
        updatedAt: now,
      };
    case "resolve":
      return { status: "resolved", resolvedAt: now, updatedAt: now };
    case "close":
      return { status: "closed", resolvedAt: now, updatedAt: now };
    case "escalate":
      return { status: "escalated", priority: "urgent", updatedAt: now };
    /** Default */
    default:
      return null;
  }
}

/**
 * POST /api/tickets/bulk
 * Bulk operations on tickets (admin only)
 * Actions: delete, update, assign, resolve, close, escalate
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

export async function POST(request: NextRequest) {
  let data: any;
  try {
    const roleResult = await requireRole(request, ["admin"]);
    if (roleResult.error) {
      return roleResult.error;
    }

    data = await request.json();
    const { action, ids, updates } = data;

    // Validation
    if (!action) {
      throw new ValidationError("Validation failed", {
        /** Action */
        action: "Action is required",
      });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError("Validation failed", {
        /** Ids */
        ids: "At least one ticket ID is required",
      });
    }

    const validActions = [
      "delete",
      "update",
      "assign",
      "resolve",
      "close",
      "escalate",
    ];
    if (!validActions.includes(action)) {
      throw new ValidationError("Validation failed", {
        /** Action */
        action: `Invalid action. Must be one of: ${validActions.join(", ")}`,
      });
    }

    const db = getFirestoreAdmin();
    const batch = db.batch();
    const now = new Date();

    const results = {
      /** Success */
      success: [] as string[],
      /** Failed */
      failed: [] as { id: string; error: string }[],
    };

    for (const ticketId of ids) {
      try {
        const ticketRef = db
          .collection(COLLECTIONS.SUPPORT_TICKETS)
          .doc(ticketId);
        const ticketDoc = await ticketRef.get();

        if (!ticketDoc.exists) {
          results.failed.push({ id: ticketId, error: "Ticket not found" });
          continue;
        }

        // Handle delete action (needs to delete messages first)
        if (action === "delete") {
          /**
 * Performs messages snapshot operation
 *
 * @param {any} SUBCOLLECTIONS.TICKET_MESSAGES - The subcollections.ticket_messages
 *
 * @returns {any} The messagessnapshot result
 *
 */
const messagesSnapshot = await ticketRef
            .collection(SUBCOLLECTIONS.TICKET_MESSAGES)
            .get();
          messagesSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
          batch.delete(ticketRef);
          results.success.push(ticketId);
          continue;
        }

        // Build update for other actions
        const ticketUpdate = buildTicketUpdate(action, now, updates);
        if (!ticketUpdate) {
          const errorMsg =
            action === "update"
              ? "Updates object required"
              : action === "assign"
                ? "assignedTo field required"
                : "Unknown action";
          results.failed.push({ id: ticketId, error: errorMsg });
          continue;
        }

        batch.update(ticketRef, ticketUpdate);
        results.success.push(ticketId);
      } catch (error: any) {
        results.failed.push({ id: ticketId, error: error.message });
      }
    }

    // Commit batch
    if (results.success.length > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: results,
      /** Message */
      message: `Bulk ${action} completed. Success: ${results.success.length}, Failed: ${results.failed.length}`,
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
      component: "API.tickets.bulk",
      /** Metadata */
      metadata: { action: data?.action, idsCount: data?.ids?.length },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
