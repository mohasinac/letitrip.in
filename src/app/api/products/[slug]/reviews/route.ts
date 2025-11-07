import { NextRequest, NextResponse } from 'next/server';
import { Collections } from '@/app/api/lib/firebase/collections';

// GET /api/products/[slug]/reviews
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const prodSnap = await Collections.products().where('slug', '==', slug).limit(1).get();
    if (prodSnap.empty) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    const productId = prodSnap.docs[0].id;

    const revSnap = await Collections.reviews().where('product_id', '==', productId).orderBy('created_at', 'desc').limit(limit).get();
    const data = revSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ success: true, data, pagination: { page, limit } });
  } catch (error) {
    console.error('Product reviews error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load reviews' }, { status: 500 });
  }
}
