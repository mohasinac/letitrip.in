import { NextRequest, NextResponse } from 'next/server';
import { verifySellerSession } from '../../../_lib/auth/admin-auth';
import { Timestamp } from 'firebase-admin/firestore';
import { AuthorizationError } from '../../../_lib/middleware/error-handler';



/**
 * POST /api/seller/analytics/export
 * Export analytics data as CSV
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await verifySellerSession(request);
    const db = getAdminDb();

    // Parse body
    const body = await request.json();
    const { period = '30days' } = body;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const startTimestamp = Timestamp.fromDate(startDate);

    // Build orders query
    let ordersQuery: any = db
      .collection('orders')
      .where('createdAt', '>=', startTimestamp)
      .orderBy('createdAt', 'desc');

    if (seller.role !== 'admin') {
      ordersQuery = ordersQuery.where('sellerId', '==', seller.uid);
    }

    const ordersSnap = await ordersQuery.get();
    const orders = ordersSnap.docs.map((doc: any) => {
      const data = doc.data();
      return {
        orderNumber: data.orderNumber,
        date: data.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A',
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
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Items',
      'Subtotal',
      'Discount',
      'Shipping',
      'Tax',
      'Total',
      'Status',
      'Payment Method',
      'Payment Status',
    ];

    const csvRows = orders.map((order: any) => [
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
      csvHeaders.join(','),
      ...csvRows.map((row: any) =>
        row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n');

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
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error exporting analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export analytics' },
      { status: 500 }
    );
  }
}
