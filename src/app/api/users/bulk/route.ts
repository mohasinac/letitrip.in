import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { requireRole } from "@/app/api/middleware/rbac-auth";

/**
 * POST /api/users/bulk
 * Bulk operations on users (admin only)
 *
 * Supported actions:
 * - make-seller: Change role to seller
 * - make-user: Change role to user
 * - ban: Ban users
 * - unban: Unban users
 * - verify-email: Verify email
 * - verify-phone: Verify phone
 * - delete: Delete users
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRole(request, ["admin"]);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const body = await request.json();
    const { action, ids, data } = body;

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Action and IDs are required" },
        { status: 400 },
      );
    }

    const results = {
      success: [] as string[],
      failed: [] as Array<{ id: string; error: string }>,
    };

    for (const id of ids) {
      try {
        const userRef = Collections.users().doc(id);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          results.failed.push({ id, error: "User not found" });
          continue;
        }

        const updates: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        switch (action) {
          case "make-seller":
            updates.role = "seller";
            break;

          case "make-user":
            updates.role = "user";
            break;

          case "ban":
            updates.is_banned = true;
            updates.ban_reason = data?.banReason || "Bulk ban action";
            updates.banned_at = new Date().toISOString();
            updates.banned_by = user.uid;
            break;

          case "unban":
            updates.is_banned = false;
            updates.ban_reason = null;
            updates.banned_at = null;
            updates.banned_by = null;
            break;

          case "verify-email":
            updates.email_verified = true;
            break;

          case "verify-phone":
            updates.phone_verified = true;
            break;

          case "delete":
            await userRef.delete();
            results.success.push(id);
            continue;

          default:
            results.failed.push({ id, error: `Unknown action: ${action}` });
            continue;
        }

        await userRef.update(updates);
        results.success.push(id);
      } catch (error: any) {
        results.failed.push({ id, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      action,
      results,
      summary: {
        total: ids.length,
        succeeded: results.success.length,
        failed: results.failed.length,
      },
    });
  } catch (error: any) {
    console.error("Bulk operation error:", error);
    return NextResponse.json(
      { success: false, error: "Bulk operation failed" },
      { status: 500 },
    );
  }
}
