import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";
import { verifyFirebaseToken } from "@/lib/auth/firebase-api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { id: orderId } = await params;
    
    // Verify authentication
    const user = await verifyFirebaseToken(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = user.uid;

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
      createdAt: orderData?.createdAt?.toDate?.() 
        ? orderData.createdAt.toDate().toISOString() 
        : orderData?.createdAt || new Date().toISOString(),
      updatedAt: orderData?.updatedAt?.toDate?.() 
        ? orderData.updatedAt.toDate().toISOString() 
        : orderData?.updatedAt || new Date().toISOString(),
      approvedAt: orderData?.approvedAt?.toDate?.() 
        ? orderData.approvedAt.toDate().toISOString() 
        : orderData?.approvedAt,
      shippedAt: orderData?.shippedAt?.toDate?.() 
        ? orderData.shippedAt.toDate().toISOString() 
        : orderData?.shippedAt,
      deliveredAt: orderData?.deliveredAt?.toDate?.() 
        ? orderData.deliveredAt.toDate().toISOString() 
        : orderData?.deliveredAt,
      cancelledAt: orderData?.cancelledAt?.toDate?.() 
        ? orderData.cancelledAt.toDate().toISOString() 
        : orderData?.cancelledAt,
      paidAt: orderData?.paidAt?.toDate?.() 
        ? orderData.paidAt.toDate().toISOString() 
        : orderData?.paidAt,
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
