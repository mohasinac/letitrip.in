import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, ApiResponse } from "@/lib/auth/middleware";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    const { orderId, reason, items } = await request.json();
    const userId = user.userId;

    // Validate request
    if (!orderId || !reason) {
      return NextResponse.json(
        { error: "Order ID and reason are required" },
        { status: 400 }
      );
    }

    // Mock order validation - replace with database query
    const order = {
      id: orderId,
      userId,
      status: "delivered",
      deliveredAt: "2024-01-18T14:30:00Z",
      total: 2890,
      canReturn: true
    };

    // Check if order belongs to user
    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order can be returned (within return window)
    if (!order.canReturn || order.status !== "delivered") {
      return NextResponse.json(
        { error: "This order cannot be returned" },
        { status: 400 }
      );
    }

    // Check return window (e.g., 7 days)
    const deliveredDate = new Date(order.deliveredAt);
    const returnDeadline = new Date(deliveredDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (new Date() > returnDeadline) {
      return NextResponse.json(
        { error: "Return window has expired" },
        { status: 400 }
      );
    }

    // Create return request - replace with database insert
    const returnRequest = {
      id: `return_${Date.now()}`,
      orderId,
      userId,
      reason,
      items: items || [], // Specific items to return (empty means all items)
      status: "pending",
      refundAmount: order.total,
      requestedAt: new Date().toISOString(),
      expectedProcessing: "3-5 business days"
    };

    return NextResponse.json({
      success: true,
      message: "Return request submitted successfully",
      data: returnRequest
    }, { status: 201 });

  } catch (error) {
    console.error("Create return request error:", error);
    return NextResponse.json(
      { error: "Failed to create return request" },
      { status: 500 }
    );
  }
}

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
    const status = searchParams.get("status") || "all"; // all, pending, approved, rejected, processing, completed
    const offset = (page - 1) * limit;

    const userId = user.userId;

    // Get return requests from Firebase
    const { getAdminDb } = await import('@/lib/firebase/admin');
    const db = getAdminDb();
    
    const returnsSnapshot = await db.collection('returns')
      .where('userId', '==', userId)
      .orderBy('requestedAt', 'desc')
      .get();

    let returnRequests: any[] = [];
    
    for (const doc of returnsSnapshot.docs) {
      const returnData = doc.data();
      
      // Get order details
      let orderDetails = null;
      if (returnData.orderId) {
        try {
          const orderDoc = await db.collection('orders').doc(returnData.orderId).get();
          if (orderDoc.exists) {
            orderDetails = orderDoc.data();
          }
        } catch (error) {
          console.error('Error fetching order details:', error);
        }
      }

      returnRequests.push({
        id: doc.id,
        ...returnData,
        orderNumber: orderDetails?.orderNumber || `JV${returnData.orderId}`,
        requestedAt: returnData.requestedAt?.toDate?.()?.toISOString() || returnData.requestedAt,
        processedAt: returnData.processedAt?.toDate?.()?.toISOString() || returnData.processedAt,
        completedAt: returnData.completedAt?.toDate?.()?.toISOString() || returnData.completedAt,
      });
    }

    // Filter by status
    if (status !== "all") {
      returnRequests = returnRequests.filter(req => req.status === status);
    }

    const paginatedRequests = returnRequests.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        returnRequests: paginatedRequests,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(returnRequests.length / limit),
          totalRequests: returnRequests.length,
          hasMore: offset + limit < returnRequests.length
        },
        summary: {
          totalRequests: returnRequests.length,
          pendingRequests: returnRequests.filter(req => req.status === "pending").length,
          completedRequests: returnRequests.filter(req => req.status === "completed").length,
          totalRefunded: returnRequests
            .filter(req => req.status === "completed")
            .reduce((sum, req) => sum + req.refundAmount, 0)
        }
      }
    });

  } catch (error) {
    console.error("Get return requests error:", error);
    return NextResponse.json(
      { error: "Failed to get return requests" },
      { status: 500 }
    );
  }
}
