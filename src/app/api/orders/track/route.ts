import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Order number or tracking number is required' },
        { status: 400 }
      );
    }

    let order: any = null;

    // Try to find order by order number first
    if (query.toLowerCase().includes('ord')) {
      const orderSnapshot = await db.collection('orders')
        .where('orderNumber', '==', query)
        .limit(1)
        .get();
      
      if (!orderSnapshot.empty) {
        order = { id: orderSnapshot.docs[0].id, ...orderSnapshot.docs[0].data() };
      }
    }

    // If not found, try by tracking number
    if (!order && query.toLowerCase().includes('trk')) {
      const orderSnapshot = await db.collection('orders')
        .where('trackingNumber', '==', query)
        .limit(1)
        .get();
      
      if (!orderSnapshot.empty) {
        order = { id: orderSnapshot.docs[0].id, ...orderSnapshot.docs[0].data() };
      }
    }

    // If still not found, try a general search
    if (!order) {
      const orderSnapshot = await db.collection('orders')
        .limit(10)
        .get();
      
      // Search through orders for matching query
      for (const doc of orderSnapshot.docs) {
        const orderData = doc.data();
        if (orderData.orderNumber?.includes(query) || 
            orderData.trackingNumber?.includes(query) ||
            doc.id === query) {
          order = { id: doc.id, ...orderData };
          break;
        }
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get tracking events from a separate collection or create them based on order status
    let trackingEvents = [];
    
    try {
      const eventsSnapshot = await db.collection('tracking_events')
        .where('orderId', '==', order.id)
        .orderBy('timestamp', 'asc')
        .get();
      
      trackingEvents = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString(),
      }));
    } catch (error) {
      // If no tracking events exist, generate basic ones based on order status
      trackingEvents = generateTrackingEvents(order);
    }

    const trackingData = {
      orderId: order.orderNumber || order.id,
      trackingNumber: order.trackingNumber || `TRK${order.id}`,
      carrier: order.carrier || 'Standard Shipping',
      status: getTrackingStatus(order.status),
      estimatedDelivery: order.estimatedDelivery?.toDate?.()?.toISOString()?.split('T')[0],
      currentLocation: getCurrentLocation(order.status),
      events: trackingEvents,
      orderDetails: {
        orderDate: order.createdAt?.toDate?.()?.toISOString()?.split('T')[0],
        totalAmount: order.total,
        shippingAddress: order.shippingAddress,
        items: order.items || [],
      },
    };

    return NextResponse.json(trackingData);
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking data' },
      { status: 500 }
    );
  }
}

function getTrackingStatus(orderStatus: string): string {
  const statusMap: { [key: string]: string } = {
    'pending': 'Order Placed',
    'confirmed': 'Order Confirmed',
    'processing': 'Preparing for Shipment',
    'shipped': 'In Transit',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
  };
  return statusMap[orderStatus] || 'Unknown';
}

function getCurrentLocation(orderStatus: string): string {
  const locationMap: { [key: string]: string } = {
    'pending': 'Order Processing Center',
    'confirmed': 'Order Processing Center',
    'processing': 'Fulfillment Center',
    'shipped': 'In Transit',
    'delivered': 'Delivered to Customer',
    'cancelled': 'Order Cancelled',
  };
  return locationMap[orderStatus] || 'Unknown Location';
}

function generateTrackingEvents(order: any) {
  const events = [];
  const baseDate = order.createdAt?.toDate() || new Date();

  events.push({
    id: '1',
    status: 'Order Placed',
    description: 'Your order has been received and is being processed',
    location: 'Online Store',
    timestamp: baseDate.toISOString(),
    isCompleted: true,
  });

  if (['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)) {
    const confirmDate = new Date(baseDate.getTime() + 60 * 60 * 1000); // 1 hour later
    events.push({
      id: '2',
      status: 'Order Confirmed',
      description: 'Payment confirmed and order details validated',
      location: 'Order Processing Center',
      timestamp: confirmDate.toISOString(),
      isCompleted: true,
    });
  }

  if (['processing', 'shipped', 'delivered'].includes(order.status)) {
    const processDate = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000); // 1 day later
    events.push({
      id: '3',
      status: 'Preparing for Shipment',
      description: 'Items are being picked and packed for shipment',
      location: 'Fulfillment Center',
      timestamp: processDate.toISOString(),
      isCompleted: true,
    });
  }

  if (['shipped', 'delivered'].includes(order.status)) {
    const shipDate = new Date(baseDate.getTime() + 48 * 60 * 60 * 1000); // 2 days later
    events.push({
      id: '4',
      status: 'Shipped',
      description: 'Package has been dispatched and is on its way',
      location: 'Fulfillment Center',
      timestamp: shipDate.toISOString(),
      isCompleted: true,
    });
  }

  if (order.status === 'delivered') {
    const deliverDate = order.deliveredAt?.toDate() || new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000);
    events.push({
      id: '5',
      status: 'Delivered',
      description: 'Package has been successfully delivered',
      location: 'Customer Address',
      timestamp: deliverDate.toISOString(),
      isCompleted: true,
    });
  } else {
    // Add pending events
    events.push({
      id: '5',
      status: 'Out for Delivery',
      description: 'Package is out for delivery and will arrive soon',
      location: 'Local Delivery Hub',
      timestamp: '',
      isCompleted: false,
    });

    events.push({
      id: '6',
      status: 'Delivered',
      description: 'Package will be delivered to your address',
      location: 'Customer Address',
      timestamp: '',
      isCompleted: false,
    });
  }

  return events;
}
