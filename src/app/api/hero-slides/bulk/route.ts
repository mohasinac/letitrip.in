import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { requireRole } from "@/app/api/middleware/rbac-auth";
import { COLLECTIONS } from "@/constants/database";
import { ValidationError, errorToJson, ApiError } from "@/lib/api-errors";

/**
 * POST /api/hero-slides/bulk
 * Admin only: Bulk operations on hero slides
 */
export async function POST(req: NextRequest) {
  try {
    // Require admin role
    const roleResult = await requireRole(req, ["admin"]);
    if (roleResult.error) {
      return roleResult.error;
    }

    const db = getFirestoreAdmin();
    const body = await req.json();

    // Validate request
    if (!body.action || !Array.isArray(body.ids) || body.ids.length === 0) {
      const errors: Record<string, string> = {};
      if (!body.action) errors.action = "Action is required";
      if (!body.ids || body.ids.length === 0)
        errors.ids = "At least one ID is required";
      throw new ValidationError("Action and ids are required", errors);
    }

    const { action, ids, updates } = body;
    const batch = db.batch();

    switch (action) {
      case "delete":
        // Bulk delete
        for (const id of ids) {
          const docRef = db.collection(COLLECTIONS.HERO_SLIDES).doc(id);
          batch.delete(docRef);
        }
        break;

      case "update":
        // Bulk update
        if (!updates || typeof updates !== "object") {
          throw new ValidationError("Updates are required for update action");
        }

        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        // Only update provided fields
        if (updates.is_active !== undefined) {
          updateData.is_active = updates.is_active;
        }
        if (updates.position !== undefined) {
          updateData.position = updates.position;
        }

        for (const id of ids) {
          const docRef = db.collection(COLLECTIONS.HERO_SLIDES).doc(id);
          batch.update(docRef, updateData);
        }
        break;

      case "activate":
        // Bulk activate
        for (const id of ids) {
          const docRef = db.collection(COLLECTIONS.HERO_SLIDES).doc(id);
          batch.update(docRef, {
            is_active: true,
            updated_at: new Date().toISOString(),
          });
        }
        break;

      case "deactivate":
        // Bulk deactivate
        for (const id of ids) {
          const docRef = db.collection(COLLECTIONS.HERO_SLIDES).doc(id);
          batch.update(docRef, {
            is_active: false,
            updated_at: new Date().toISOString(),
          });
        }
        break;

      default:
        throw new ValidationError(`Unknown action: ${action}`);
    }

    // Commit batch
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}d ${ids.length} hero slide(s)`,
    });
  } catch (error) {
    console.error("Error in bulk operation:", error);
    if (error instanceof ApiError) {
      return NextResponse.json(errorToJson(error), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}
