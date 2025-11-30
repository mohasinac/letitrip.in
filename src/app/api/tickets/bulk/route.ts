import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/api/middleware/rbac-auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { ValidationError } from "@/lib/api-errors";

// Build update object for each action (excluding delete which needs special handling)
function buildTicketUpdate(action: string, now: Date, updates?: any): Record<string, any> | null {
  switch (action) {
    case "update":
      if (!updates || typeof updates !== "object") return null;
      return { ...updates, updatedAt: now };
    case "assign":
      if (!updates?.assignedTo) return null;
      return { assignedTo: updates.assignedTo, status: "in-progress", updatedAt: now };
    case "resolve":
      return { status: "resolved", resolvedAt: now, updatedAt: now };
    case "close":
      return { status: "closed", resolvedAt: now, updatedAt: now };
    case "escalate":
      return { status: "escalated", priority: "urgent", updatedAt: now };
    default:
      return null;
  }
}

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

        // Handle delete action (needs to delete messages first)
        if (action === "delete") {
          const messagesSnapshot = await ticketRef.collection("messages").get();
          messagesSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
          batch.delete(ticketRef);
          results.success.push(ticketId);
          continue;
        }

        // Build update for other actions
        const ticketUpdate = buildTicketUpdate(action, now, updates);
        if (!ticketUpdate) {
          const errorMsg = action === "update" ? "Updates object required" : 
                           action === "assign" ? "assignedTo field required" : "Unknown action";
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
      success: true,
      data: results,
      message: `Bulk ${action} completed. Success: ${results.success.length}, Failed: ${results.failed.length}`,
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, errors: error.errors },
        { status: 400 },
      );
    }
    console.error("Error in bulk ticket operation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
