import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";

/**
 * Unified Bulk Operations for Shops
 * POST /api/shops/bulk
 * Admin only
 *
 * Actions: verify, unverify, feature, unfeature, activate, deactivate, ban, unban, delete, update
 */

export async function POST(request: NextRequest) {
  try {
    // Require admin role
    const authResult = await requireAdmin(request);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { action, ids, data } = body;

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request. Provide action and ids array.",
        },
        { status: 400 }
      );
    }

    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    for (const id of ids) {
      try {
        const shopRef = Collections.shops().doc(id);
        const shopDoc = await shopRef.get();

        if (!shopDoc.exists) {
          results.failed.push({ id, error: "Shop not found" });
          continue;
        }

        switch (action) {
          case "verify":
            await shopRef.update({
              is_verified: true,
              updated_at: new Date(),
            });
            results.success.push(id);
            break;

          case "unverify":
            await shopRef.update({
              is_verified: false,
              updated_at: new Date(),
            });
            results.success.push(id);
            break;

          case "feature":
            await shopRef.update({
              is_featured: true,
              updated_at: new Date(),
            });
            results.success.push(id);
            break;

          case "unfeature":
            await shopRef.update({
              is_featured: false,
              updated_at: new Date(),
            });
            results.success.push(id);
            break;

          case "activate":
            await shopRef.update({
              is_active: true,
              is_banned: false,
              updated_at: new Date(),
            });
            results.success.push(id);
            break;

          case "deactivate":
            await shopRef.update({
              is_active: false,
              updated_at: new Date(),
            });
            results.success.push(id);
            break;

          case "ban":
            await shopRef.update({
              is_banned: true,
              is_active: false,
              ban_reason: data?.banReason || "Bulk ban action",
              updated_at: new Date(),
            });
            results.success.push(id);
            break;

          case "unban":
            await shopRef.update({
              is_banned: false,
              ban_reason: null,
              updated_at: new Date(),
            });
            results.success.push(id);
            break;

          case "delete":
            // Check if shop has products
            const productsSnapshot = await Collections.products()
              .where("shop_id", "==", id)
              .limit(1)
              .get();

            if (!productsSnapshot.empty) {
              results.failed.push({ id, error: "Shop has products" });
              continue;
            }

            // Check if shop has auctions
            const auctionsSnapshot = await Collections.auctions()
              .where("shop_id", "==", id)
              .limit(1)
              .get();

            if (!auctionsSnapshot.empty) {
              results.failed.push({ id, error: "Shop has auctions" });
              continue;
            }

            await shopRef.delete();
            results.success.push(id);
            break;

          case "update":
            if (!data) {
              results.failed.push({ id, error: "No update data provided" });
              continue;
            }

            // Only allow specific fields to be updated in bulk
            const allowedFields = [
              "is_verified",
              "is_featured",
              "show_on_homepage",
              "is_banned",
              "ban_reason",
            ];
            const updates: Record<string, any> = { updated_at: new Date() };

            for (const field of allowedFields) {
              if (field in data) {
                updates[field] = data[field];
              }
            }

            await shopRef.update(updates);
            results.success.push(id);
            break;

          default:
            results.failed.push({ id, error: `Unknown action: ${action}` });
        }
      } catch (error: any) {
        results.failed.push({
          id,
          error: error.message || "Operation failed",
        });
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
    console.error("Bulk shops operation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Bulk operation failed",
      },
      { status: 500 }
    );
  }
}
