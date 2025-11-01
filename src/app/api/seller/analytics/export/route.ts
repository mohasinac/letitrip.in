import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * Export analytics data
 * POST /api/seller/analytics/export
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    const userId = decoded.uid;
    const userRole = (decoded as any).role || "user";

    const body = await req.json();
    const { period = "30days" } = body;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "7days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
        startDate = new Date(0);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const startTimestamp = startDate;

    // Get orders using Admin SDK
    const db = getAdminDb();
    let ordersQuery = db
      .collection("seller_orders")
      .where("createdAt", ">=", startTimestamp)
      .orderBy("createdAt", "desc");

    if (userRole !== "admin") {
      ordersQuery = ordersQuery.where("sellerId", "==", userId);
    }

    const ordersSnap = await ordersQuery.get();
    const orders = ordersSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        orderNumber: data.orderNumber,
        date: data.createdAt?.toDate?.()?.toLocaleDateString() || "N/A",
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        items: data.items?.length || 0,
        subtotal: data.subtotal || 0,
        discount: (data.couponDiscount || 0) + (data.saleDiscount || 0),
        shipping: data.shippingCharges || 0,
        tax: data.tax || 0,
        total: data.total || 0,
        status: data.status,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
      };
    });

    // Generate CSV
    const csvHeaders = [
      "Order Number",
      "Date",
      "Customer Name",
      "Customer Email",
      "Items",
      "Subtotal",
      "Discount",
      "Shipping",
      "Tax",
      "Total",
      "Status",
      "Payment Method",
      "Payment Status",
    ];

    const csvRows = orders.map((order) => [
      order.orderNumber,
      order.date,
      order.customerName,
      order.customerEmail,
      order.items,
      order.subtotal.toFixed(2),
      order.discount.toFixed(2),
      order.shipping.toFixed(2),
      order.tax.toFixed(2),
      order.total.toFixed(2),
      order.status,
      order.paymentMethod,
      order.paymentStatus,
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    // Return CSV data
    return NextResponse.json({
      success: true,
      data: {
        csv: csvContent,
        filename: `analytics-${period}-${Date.now()}.csv`,
        recordCount: orders.length,
      },
    });
  } catch (error: any) {
    console.error("Error exporting analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to export analytics",
      },
      { status: 500 },
    );
  }
}
