import { NextRequest, NextResponse } from 'next/server';
import { Collections } from '@/app/api/lib/firebase/collections';

// GET /api/products/[slug]/seller-items - other products from same shop
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const limit = parseInt(new URL(request.url).searchParams.get('limit') || '10', 10);

    const prodSnap = await Collections.products().where('slug', '==', slug).limit(1).get();
    if (prodSnap.empty) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    const prod: any = { id: prodSnap.docs[0].id, ...prodSnap.docs[0].data() };

    const q = await Collections.products().where('shop_id', '==', prod.shop_id).limit(limit + 1).get();
    const data = q.docs
      .map(d => ({ id: d.id, ...d.data() } as any))
      .filter(p => p.slug !== slug)
      .slice(0, limit);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Seller items error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load seller items' }, { status: 500 });
  }
}
