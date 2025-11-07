import { NextRequest, NextResponse } from 'next/server';
import { Collections } from '@/app/api/lib/firebase/collections';
import { getCurrentUser } from '../lib/session';
import { userOwnsShop } from '@/app/api/lib/firebase/queries';

// GET /api/auctions - List auctions (role-filtered)
// POST /api/auctions - Create auction (seller/admin)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const role = user?.role || 'guest';
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shop_id');

    let query: FirebaseFirestore.Query = Collections.auctions();
    if (role === 'guest' || role === 'user') {
      query = query.where('status', '==', 'active');
    } else if (role === 'seller' && shopId) {
      query = query.where('shop_id', '==', shopId);
    } else if (role === 'seller' && !shopId) {
      // require shopId for seller scoped queries
      return NextResponse.json({ success: true, data: [] });
    }

    const snapshot = await query.limit(200).get();
    const auctions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ success: true, data: auctions });
  } catch (error) {
    console.error('Error listing auctions:', error);
    return NextResponse.json({ success: false, error: 'Failed to list auctions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const role = user.role;
    if (!(role === 'seller' || role === 'admin')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { shop_id, name, slug, starting_bid, end_time } = body;
    if (!shop_id || !name || !slug || starting_bid == null || !end_time) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (role === 'seller') {
      const ownsShop = await userOwnsShop(shop_id, user.id);
      if (!ownsShop) {
        return NextResponse.json({ success: false, error: 'Cannot create auction for this shop' }, { status: 403 });
      }
      // Limit: 5 active auctions per shop
      const activeCount = await Collections.auctions().where('shop_id', '==', shop_id).where('status', '==', 'active').count().get();
      if ((activeCount.data().count || 0) >= 5) {
        return NextResponse.json({ success: false, error: 'Active auction limit reached for this shop' }, { status: 400 });
      }
    }

    // Slug uniqueness (may become slug-based detail later)
    const existingSlug = await Collections.auctions().where('slug', '==', slug).limit(1).get();
    if (!existingSlug.empty) {
      return NextResponse.json({ success: false, error: 'Auction slug already exists' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const docRef = await Collections.auctions().add({
      shop_id,
      name,
      slug,
      description: body.description || '',
      starting_bid,
      current_bid: starting_bid,
      bid_count: 0,
      status: 'active',
      start_time: body.start_time || now,
      end_time,
      created_at: now,
      updated_at: now,
    });
    const created = await docRef.get();
    return NextResponse.json({ success: true, data: { id: created.id, ...created.data() } }, { status: 201 });
  } catch (error) {
    console.error('Error creating auction:', error);
    return NextResponse.json({ success: false, error: 'Failed to create auction' }, { status: 500 });
  }
}
