import { NextRequest, NextResponse } from 'next/server';
import { Collections } from '@/app/api/lib/firebase/collections';
import { getCurrentUser } from '../lib/session';
import { userOwnsShop } from '@/app/api/lib/firebase/queries';
import { getUserShops } from '../lib/auth-helpers';

// GET /api/coupons - List coupons (public active or owner/admin)
// POST /api/coupons - Create coupon (seller/admin)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const role = user?.role || 'guest';
    const { searchParams } = new URL(request.url);
    const shopSlug = searchParams.get('shop_slug');
    let shopId = searchParams.get('shop_id');

    let query: FirebaseFirestore.Query = Collections.coupons();

    if (role === 'guest' || role === 'user') {
      query = query.where('is_active', '==', true);
    } else if (role === 'seller') {
      // If no shopId provided, get user's shops
      if (!shopId && user?.id) {
        const userShops = await getUserShops(user.id);
        if (userShops.length > 0) {
          // Filter by user's shops
          shopId = userShops[0]; // Use primary shop
        }
      }
      
      if (shopId) {
        query = query.where('shop_id', '==', shopId);
      }
    } else if (role === 'admin' && shopId) {
      query = query.where('shop_id', '==', shopId);
    }

    const snapshot = await query.limit(200).get();
    let coupons = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ success: true, data: coupons });
  } catch (error) {
    console.error('Error listing coupons:', error);
    return NextResponse.json({ success: false, error: 'Failed to list coupons' }, { status: 500 });
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
    const shopIdCamel = body.shopId; // support camelCase from frontend service
    const { shop_id: shopIdSnake, code } = body;
    const shop_id = shopIdSnake || shopIdCamel; // unify
    if (!shop_id || !code) {
      return NextResponse.json({ success: false, error: 'shop_id/shopId and code required' }, { status: 400 });
    }

    if (role === 'seller') {
      const ownsShop = await userOwnsShop(shop_id, user.id);
      if (!ownsShop) {
        return NextResponse.json({ success: false, error: 'Cannot create coupon for this shop' }, { status: 403 });
      }
    }

    // Enforce unique code per shop
    const existing = await Collections.coupons()
      .where('shop_id', '==', shop_id)
      .where('code', '==', code)
      .limit(1)
      .get();
    if (!existing.empty) {
      return NextResponse.json({ success: false, error: 'Coupon code already exists for this shop' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const docRef = await Collections.coupons().add({
      shop_id,
      code,
      name: body.name || code,
      description: body.description || '',
      type: body.type || 'percentage',
      discount_value: body.discount_value || body.discountValue || 0,
      is_active: body.is_active !== false && body.isActive !== false,
      usage_limit: body.usage_limit || body.usageLimit || null,
      start_date: body.start_date || body.startDate || now,
      end_date: body.end_date || body.endDate || null,
      created_at: now,
      updated_at: now,
    });
    const created = await docRef.get();
    return NextResponse.json({ success: true, data: { id: created.id, ...created.data() } }, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ success: false, error: 'Failed to create coupon' }, { status: 500 });
  }
}
