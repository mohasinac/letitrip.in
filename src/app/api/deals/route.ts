import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const sortBy = searchParams.get('sort') || 'discount';

    // Get database
    const { getAdminDb } = await import('@/lib/firebase/admin');
    const db = getAdminDb();

    // Fetch active deals from Firestore
    let query: any = db.collection('deals').where('active', '==', true);

    // Apply category filter
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    
    const deals = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      validUntil: doc.data().validUntil?.toDate?.()?.toISOString() || doc.data().validUntil,
    }));

    // Fetch active flash sales
    const flashSalesSnapshot = await db.collection('flash_sales')
      .where('active', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    const flashSales = flashSalesSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      endsAt: doc.data().endsAt?.toDate?.()?.toISOString() || doc.data().endsAt,
      deals: []
    }));

    // Sort deals
    let sortedDeals = deals;
    if (sortBy === 'discount') {
      sortedDeals.sort((a: any, b: any) => (b.discountPercent || 0) - (a.discountPercent || 0));
    } else if (sortBy === 'price_low') {
      sortedDeals.sort((a: any, b: any) => (a.salePrice || 0) - (b.salePrice || 0));
    } else if (sortBy === 'price_high') {
      sortedDeals.sort((a: any, b: any) => (b.salePrice || 0) - (a.salePrice || 0));
    } else if (sortBy === 'newest') {
      sortedDeals.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({
      success: true,
      deals: sortedDeals,
      flashSales,
      pagination: {
        total: deals.length,
        returned: sortedDeals.length
      }
    });
  } catch (error) {
    console.error("Error fetching deals:", error);
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}
