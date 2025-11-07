import { NextRequest, NextResponse } from 'next/server';
import { Collections } from '@/app/api/lib/firebase/collections';
import { getCurrentUser } from '@/app/api/lib/session';
import { userOwnsShop } from '@/app/api/lib/firebase/queries';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doc = await Collections.orders().doc(id).get();
    if (!doc.exists) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('Order detail error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load order' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const role = user.role;
    if (!(role === 'seller' || role === 'admin')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const docRef = Collections.orders().doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const order = doc.data() as any;
    if (role === 'seller') {
      const owns = await userOwnsShop(order.shop_id, user.id);
      if (!owns) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const allowed = ['status', 'notes'];
    const payload: any = { updated_at: new Date().toISOString() };
    for (const k of allowed) if (k in body) payload[k] = body[k];
    await docRef.update(payload);

    const updated = await docRef.get();
    return NextResponse.json({ success: true, data: { id: updated.id, ...updated.data() } });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}

// Minimal change placeholder for follow-up
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
}
