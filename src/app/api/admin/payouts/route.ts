import { NextRequest, NextResponse } from "next/server";
import { requireRole, handleAuthError } from "../../lib/auth-helpers";
import { getFirestoreAdmin } from "../../lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ["admin"]);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const db = getFirestoreAdmin();
    let query = db.collection("payouts");

    // Apply filters
    if (status) {
      query = query.where("status", "==", status) as any;
    }
    if (startDate) {
      query = query.where("createdAt", ">=", new Date(startDate)) as any;
    }
    if (endDate) {
      query = query.where("createdAt", "<=", new Date(endDate)) as any;
    }

    // Add ordering
    query = query.orderBy("createdAt", "desc") as any;

    // Get total count
    const countSnapshot = await query.get();
    const total = countSnapshot.size;

    // Apply pagination
    const offset = (page - 1) * limit;
    const snapshot = await query.limit(limit).offset(offset).get();

    const payouts = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      data: payouts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return handleAuthError(error);
  }
}
