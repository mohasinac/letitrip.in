import { NextRequest, NextResponse } from 'next/server';
import { Collections } from '@/app/api/lib/firebase/collections';
import { getCurrentUser } from '@/app/api/lib/session';

// Track shipment status (stub). In production, integrate with carrier API.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ref = Collections.orders().doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    const order = snap.data() as any;
    const shipment = order.shipment || null;

    if (!shipment) {
      return NextResponse.json({ success: true, data: { status: 'pending_shipment' } });
    }

    // Basic derived status example
    const status = order.status === 'shipped' ? 'in_transit' : order.status;
    return NextResponse.json({ success: true, data: { shipment, status } });
  } catch (error) {
    console.error('Order track error:', error);
    return NextResponse.json({ success: false, error: 'Failed to track order' }, { status: 500 });
  }
}
