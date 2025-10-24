import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { JWTPayload } from "@/lib/auth/jwt";
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req: NextRequest, user: JWTPayload) => {
    try {
      const { id: orderId } = await params;
      const db = getAdminDb();

      // Get order from Firestore
      const orderDoc = await db.collection('orders').doc(orderId).get();
      
      if (!orderDoc.exists) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      const orderData = orderDoc.data();
      
      // Check if user owns this order
      if (orderData?.userId !== user.userId) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      const order = {
        id: orderDoc.id,
        ...orderData,
        createdAt: orderData?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: orderData?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        estimatedDelivery: orderData?.estimatedDelivery?.toDate?.()?.toISOString() || new Date().toISOString(),
        statusHistory: orderData?.statusHistory || [
          {
            status: orderData?.status || 'processing',
            timestamp: orderData?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            message: `Order ${orderData?.status || 'processing'}`
          }
        ]
      };

      return NextResponse.json({
        success: true,
        data: order
      });

    } catch (error) {
      console.error("Get order error:", error);
      return NextResponse.json(
        { error: "Failed to get order" },
        { status: 500 }
      );
    }
  })(request);
}
