import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/app/api/lib/firebase/admin';
import { COLLECTIONS } from '@/constants/database';

// GET /api/admin/featured-sections - List featured sections
export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    
    // Get all featured sections ordered by position
    const snapshot = await db
      .collection(COLLECTIONS.FEATURED_SECTIONS)
      .orderBy('position', 'asc')
      .get();
    
    const sections = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Error fetching featured sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured sections' },
      { status: 500 }
    );
  }
}

// POST /api/admin/featured-sections - Create featured section
export async function POST(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const body = await req.json();
    
    // Validate required fields
    if (!body.title || !body.type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      );
    }
    
    // Get max position
    const maxSnapshot = await db
      .collection(COLLECTIONS.FEATURED_SECTIONS)
      .orderBy('position', 'desc')
      .limit(1)
      .get();
    
    const maxPosition = maxSnapshot.empty ? 0 : maxSnapshot.docs[0].data().position;
    
    // Create section
    const sectionData = {
      title: body.title,
      subtitle: body.subtitle || '',
      type: body.type, // 'categories' | 'shops' | 'products' | 'auctions'
      item_ids: body.item_ids || [],
      layout: body.layout || 'grid', // 'grid' | 'carousel' | 'list'
      max_items: body.max_items || 8,
      position: maxPosition + 1,
      is_active: body.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const docRef = await db.collection(COLLECTIONS.FEATURED_SECTIONS).add(sectionData);
    
    return NextResponse.json({ 
      id: docRef.id,
      ...sectionData 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating featured section:', error);
    return NextResponse.json(
      { error: 'Failed to create featured section' },
      { status: 500 }
    );
  }
}
