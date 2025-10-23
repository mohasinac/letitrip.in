import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, ApiResponse } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "all"; // all, pending, confirmed, processing, shipped, delivered, cancelled
    const offset = (page - 1) * limit;

    const userId = user.userId;

    // Mock user orders - replace with database query
    let userOrders = [
      {
        id: "order_001",
        userId,
        orderNumber: "JV2024001",
        status: "delivered",
        paymentStatus: "paid",
        total: 2890,
        items: [
          {
            id: "item_1",
            productId: "prod_1",
            name: "Premium Beyblade Set",
            image: "/images/product-1.jpg",
            price: 1590,
            quantity: 1
          },
          {
            id: "item_2",
            productId: "prod_2",
            name: "Metal Fusion Launcher",
            image: "/images/product-2.jpg",
            price: 890,
            quantity: 1
          }
        ],
        shippingAddress: {
          name: "John Doe",
          phone: "+91 9876543210",
          addressLine1: "123 Main Street, Apartment 4B",
          city: "Noida",
          state: "Uttar Pradesh",
          pincode: "201301"
        },
        paymentMethod: "razorpay",
        shippingCost: 99,
        tax: 311,
        discount: 0,
        trackingNumber: "TRK123456785",
        estimatedDelivery: "2024-01-20T00:00:00Z",
        deliveredAt: "2024-01-18T14:30:00Z",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-18T14:30:00Z"
      },
      {
        id: "order_002",
        userId,
        orderNumber: "JV2024002",
        status: "shipped",
        paymentStatus: "paid",
        total: 1299,
        items: [
          {
            id: "item_3",
            productId: "prod_3",
            name: "Vintage Action Figure",
            image: "/images/product-3.jpg",
            price: 1199,
            quantity: 1
          }
        ],
        shippingAddress: {
          name: "John Doe",
          phone: "+91 9876543210",
          addressLine1: "456 Business Park, Tower A",
          city: "Noida",
          state: "Uttar Pradesh",
          pincode: "201303"
        },
        paymentMethod: "cod",
        shippingCost: 100,
        tax: 0,
        discount: 100,
        trackingNumber: "TRK123456786",
        estimatedDelivery: "2024-01-25T00:00:00Z",
        createdAt: "2024-01-20T15:30:00Z",
        updatedAt: "2024-01-22T09:15:00Z"
      },
      {
        id: "order_003",
        userId,
        orderNumber: "JV2024003",
        status: "processing",
        paymentStatus: "paid",  
        total: 3450,
        items: [
          {
            id: "item_4",
            productId: "prod_4",
            name: "Collector's Edition Set",
            image: "/images/product-4.jpg",
            price: 2999,
            quantity: 1
          }
        ],
        shippingAddress: {
          name: "John Doe",
          phone: "+91 9876543210",
          addressLine1: "123 Main Street, Apartment 4B",
          city: "Noida",
          state: "Uttar Pradesh",
          pincode: "201301"
        },
        paymentMethod: "razorpay",
        shippingCost: 149,
        tax: 302,
        discount: 0,
        trackingNumber: null,
        estimatedDelivery: "2024-01-30T00:00:00Z",
        createdAt: "2024-01-22T11:45:00Z",
        updatedAt: "2024-01-22T11:45:00Z"
      }
    ];

    // Filter by status
    if (status !== "all") {
      userOrders = userOrders.filter(order => order.status === status);
    }

    const paginatedOrders = userOrders.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        orders: paginatedOrders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(userOrders.length / limit),
          totalOrders: userOrders.length,
          hasMore: offset + limit < userOrders.length
        },
        summary: {
          totalOrders: userOrders.length,
          totalSpent: userOrders.reduce((sum, order) => sum + order.total, 0),
          pendingOrders: userOrders.filter(order => order.status === "pending").length,
          processingOrders: userOrders.filter(order => order.status === "processing").length,
          shippedOrders: userOrders.filter(order => order.status === "shipped").length,
          deliveredOrders: userOrders.filter(order => order.status === "delivered").length
        }
      }
    });

  } catch (error) {
    console.error("Get user orders error:", error);
    return NextResponse.json(
      { error: "Failed to get user orders" },
      { status: 500 }
    );
  }
}
