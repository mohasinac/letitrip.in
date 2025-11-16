import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/api/middleware/rbac-auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { ValidationError } from "@/lib/api-errors";

/**
 * POST /api/tickets/bulk
 * Bulk operations on tickets (admin only)
 * Actions: delete, update, assign, resolve, close, escalate
 */
export async function POST(request: NextRequest) {
  try {
    const roleResult = await requireRole(request, ["admin"]);
    if (roleResult.error) {
      return roleResult.error;
    }

    const data = await request.json();
    const { action, ids, updates } = data;

    // Validation
    if (!action) {
      throw new ValidationError("Validation failed", {
        action: "Action is required",
      });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError("Validation failed", {
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
        action: `Invalid action. Must be one of: ${validActions.join(", ")}`,
      });
    }

    const db = getFirestoreAdmin();
    const batch = db.batch();
    const now = new Date();

    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    for (const ticketId of ids) {
      try {
        const ticketRef = db.collection("support_tickets").doc(ticketId);
        const ticketDoc = await ticketRef.get();

        if (!ticketDoc.exists) {
          results.failed.push({ id: ticketId, error: "Ticket not found" });
          continue;
        }

        switch (action) {
          case "delete":
            // Delete all messages first
            const messagesSnapshot = await ticketRef
              .collection("messages")
              .get();
            messagesSnapshot.docs.forEach((doc) => {
              batch.delete(doc.ref);
            });
            batch.delete(ticketRef);
            break;

          case "update":
            if (!updates || typeof updates !== "object") {
              results.failed.push({
                id: ticketId,
                error: "Updates object required",
              });
              continue;
            }
            batch.update(ticketRef, {
              ...updates,
              updatedAt: now,
            });
            break;

          case "assign":
            if (!updates?.assignedTo) {
              results.failed.push({
                id: ticketId,
                error: "assignedTo field required",
              });
              continue;
            }
            batch.update(ticketRef, {
              assignedTo: updates.assignedTo,
              status: "in-progress",
              updatedAt: now,
            });
            break;

          case "resolve":
            batch.update(ticketRef, {
              status: "resolved",
              resolvedAt: now,
              updatedAt: now,
            });
            break;

          case "close":
            batch.update(ticketRef, {
              status: "closed",
              resolvedAt: now,
              updatedAt: now,
            });
            break;

          case "escalate":
            batch.update(ticketRef, {
              status: "escalated",
              priority: "urgent",
              updatedAt: now,
            });
            break;

          default:
            results.failed.push({ id: ticketId, error: "Unknown action" });
            continue;
        }

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
      success: true,
      data: results,
      message: `Bulk ${action} completed. Success: ${results.success.length}, Failed: ${results.failed.length}`,
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Error in bulk ticket operation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
