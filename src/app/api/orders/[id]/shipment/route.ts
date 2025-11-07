import { NextRequest, NextResponse } from 'next/server';
import { Collections } from '@/app/api/lib/firebase/collections';
import { getCurrentUser } from '@/app/api/lib/session';
import { userOwnsShop } from '@/app/api/lib/firebase/queries';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const role = user.role;
    if (!(role === 'seller' || role === 'admin')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const orderRef = Collections.orders().doc(id);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const order = orderSnap.data() as any;
    if (role === 'seller') {
      const owns = await userOwnsShop(order.shop_id, user.id);
      if (!owns) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { carrier, tracking_number, eta } = await request.json();
    const shipment = {
      carrier: carrier || null,
      tracking_number: tracking_number || null,
      eta: eta || null,
      created_at: new Date().toISOString(),
      created_by: user.id,
    };

    await orderRef.update({ shipment, status: 'shipped', updated_at: new Date().toISOString() });

    const updated = await orderRef.get();
    return NextResponse.json({ success: true, data: { id: updated.id, ...updated.data() } });
  } catch (error) {
    console.error('Order shipment error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create shipment' }, { status: 500 });
  }
}
