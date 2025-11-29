import { NextResponse } from "next/server";
import { rebuildAllCategoryCounts } from "@/lib/category-hierarchy";

/**
 * POST /api/admin/categories/rebuild-counts
 * Rebuild all category product counts (admin only)
 * Useful for fixing count discrepancies
 */
export async function POST() {
  try {
    console.log("Starting category counts rebuild...");
    const result = await rebuildAllCategoryCounts();

    if (result.errors.length > 0) {
      console.error("Errors during rebuild:", result.errors);
      return NextResponse.json({
        success: true,
        message: `Rebuilt ${result.updated} categories with ${result.errors.length} errors`,
        updated: result.updated,
        errors: result.errors,
        details: result.details,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully rebuilt counts for ${result.updated} categories`,
      updated: result.updated,
      details: result.details,
    });
  } catch (error: any) {
    console.error("Error rebuilding category counts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to rebuild category counts",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
