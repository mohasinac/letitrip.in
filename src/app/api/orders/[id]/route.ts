import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { JWTPayload } from "@/lib/auth/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req: NextRequest, user: JWTPayload) => {
    try {
      const orderId = params.id;

      // Mock order data - replace with database query
      const mockOrder = {
        id: orderId,
        userId: user.userId,
        status: "shipped",
        items: [
          {
            id: "1",
            productId: "prod_1",
            name: "Premium Beyblade Stadium",
            image: "/images/product-1.jpg",
            price: 2999,
            quantity: 1
          }
        ],
        shippingAddress: {
          firstName: "John",
          lastName: "Doe",
          address: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          phone: "+91 9876543210"
        },
        paymentMethod: "card",
        subtotal: 2999,
        shipping: 0,
        tax: 539,
        total: 3538,
        trackingNumber: "TRK123456789",
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: new Date().toISOString(),
        statusHistory: [
          {
            status: "processing",
            timestamp: "2024-01-15T10:30:00Z",
            message: "Order received and being processed"
          },
          {
            status: "confirmed",
            timestamp: "2024-01-15T12:00:00Z",
            message: "Payment confirmed, preparing for shipment"
          },
          {
            status: "shipped",
            timestamp: "2024-01-16T09:00:00Z",
            message: "Order shipped with tracking number TRK123456789"
          }
        ]
      };

      // Check if user owns this order
      if (mockOrder.userId !== user.userId) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: mockOrder
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
