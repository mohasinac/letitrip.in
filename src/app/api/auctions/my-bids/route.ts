import { NextRequest, NextResponse } from 'next/server';
import { Collections } from '@/app/api/lib/firebase/collections';
import { getCurrentUser } from '../../lib/session';

// GET /api/auctions/my-bids - authenticated user's bids
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const snap = await Collections.bids()
      .where('user_id', '==', user.id)
      .orderBy('created_at', 'desc')
      .limit(50)
      .get();
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('My bids error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load my bids' }, { status: 500 });
  }
}
