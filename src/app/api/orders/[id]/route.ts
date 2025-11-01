import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";
import { verifyFirebaseToken } from "@/lib/auth/firebase-api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await verifyFirebaseToken(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = user.uid;
    const orderId = params.id;

    // Fetch order from Firestore
    const adminDb = getAdminDb();
    const orderDoc = await adminDb.collection("orders").doc(orderId).get();

    if (!orderDoc.exists) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    const orderData = orderDoc.data();

    // Verify ownership (unless admin)
    if (orderData?.userId !== userId && user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const order = {
      id: orderDoc.id,
      ...orderData,
    };

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}
