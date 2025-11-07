import { NextRequest, NextResponse } from 'next/server';
import { Collections } from '@/app/api/lib/firebase/collections';
import { getCurrentUser } from '@/app/api/lib/session';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(req);
    if (!user?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const role = user.role;
    if (role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const ref = Collections.returns().doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const { resolution, refundAmount, notes } = await req.json();
    const payload: any = {
      status: 'resolved',
      resolution: resolution || 'resolved',
      admin_notes: notes || '',
      updated_at: new Date().toISOString(),
    };
    if (typeof refundAmount === 'number' && refundAmount > 0) {
      payload.refund = {
        refund_amount: refundAmount,
        refund_method: 'admin_adjustment',
        processed_at: new Date().toISOString(),
        processed_by: user.id,
      };
    }

    await ref.update(payload);
    const updated = await ref.get();
    return NextResponse.json({ success: true, data: { id: updated.id, ...updated.data() } });
  } catch (error) {
    console.error('Return resolve error:', error);
    return NextResponse.json({ success: false, error: 'Failed to resolve return' }, { status: 500 });
  }
}
