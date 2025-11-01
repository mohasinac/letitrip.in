import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";

const adminDb = getAdminDb();
const BULK_JOBS_COLLECTION = "bulk_jobs";

// GET /api/admin/bulk/[id] - Get job status and details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const doc = await adminDb.collection(BULK_JOBS_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error: any) {
    console.error("Error fetching job status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch job status" },
      { status: 500 }
    );
  }
}
