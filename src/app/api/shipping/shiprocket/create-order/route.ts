/**
 * Shiprocket Create Order API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { shiprocketService } from '@/lib/services/shiprocket';
import { getAdminAuth, getAdminDb } from '@/lib/database/admin';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/config/api';

// POST: Create shipping order
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication (typically called from server-side order processing)
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const token = authHeader.split(' ')[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    // Check if user is admin or this is a system call
    const userRecord = await auth.getUser(decodedToken.uid);
    if (!userRecord.customClaims?.role || 
        !['admin', 'system'].includes(userRecord.customClaims.role)) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.FORBIDDEN },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const orderData = await request.json();

    // Validate required fields
    if (!orderData.orderId || !orderData.customerName || !orderData.customerEmail || 
        !orderData.billingAddress || !orderData.items || !orderData.subtotal) {
      return NextResponse.json(
        { success: false, error: 'Missing required order data' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Format order data for Shiprocket
    const shiprocketOrderData = shiprocketService.formatOrderData({
      orderId: orderData.orderId,
      orderDate: orderData.orderDate || new Date().toISOString(),
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      billingAddress: orderData.billingAddress,
      shippingAddress: orderData.shippingAddress,
      items: orderData.items,
      paymentMethod: orderData.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      subtotal: orderData.subtotal,
      shippingCharges: orderData.shippingCharges || 0,
      totalDiscount: orderData.totalDiscount || 0,
      weight: orderData.weight || 0.5, // Default 500g
      dimensions: orderData.dimensions,
    });

    // Create shipping order
    const shippingOrder = await shiprocketService.createOrder(shiprocketOrderData);

    // Update order in database with shipping information
    if (shippingOrder.order_id) {
      const db = getAdminDb();
      await db.collection('orders').doc(orderData.orderId).update({
        shiprocketOrderId: shippingOrder.order_id,
        shiprocketShipmentId: shippingOrder.shipment_id,
        awbCode: shippingOrder.awb_code,
        courierName: shippingOrder.courier_name,
        trackingUrl: shippingOrder.tracking_url,
        shippingStatus: 'confirmed',
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      data: shippingOrder,
    }, { status: HTTP_STATUS.CREATED });
  } catch (error: any) {
    console.error('Create shipping order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || ERROR_MESSAGES.SHIPPING_UNAVAILABLE },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
}
