import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/app/api/lib/firebase/admin';
import { COLLECTIONS } from '@/constants/database';

// GET /api/admin/hero-slides - List hero slides
export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    
    // Get all hero slides ordered by position
    const snapshot = await db
      .collection(COLLECTIONS.HERO_SLIDES)
      .orderBy('position', 'asc')
      .get();
    
    const slides = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return NextResponse.json({ slides });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero slides' },
      { status: 500 }
    );
  }
}

// POST /api/admin/hero-slides - Create hero slide
export async function POST(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const body = await req.json();
    
    // Validate required fields
    if (!body.title || !body.image_url) {
      return NextResponse.json(
        { error: 'Title and image are required' },
        { status: 400 }
      );
    }
    
    // Get max position
    const maxSnapshot = await db
      .collection(COLLECTIONS.HERO_SLIDES)
      .orderBy('position', 'desc')
      .limit(1)
      .get();
    
    const maxPosition = maxSnapshot.empty ? 0 : maxSnapshot.docs[0].data().position;
    
    // Create slide
    const slideData = {
      title: body.title,
      subtitle: body.subtitle || '',
      description: body.description || '',
      image_url: body.image_url,
      link_url: body.link_url || '',
      cta_text: body.cta_text || 'Shop Now',
      position: maxPosition + 1,
      is_active: body.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const docRef = await db.collection(COLLECTIONS.HERO_SLIDES).add(slideData);
    
    return NextResponse.json({ 
      id: docRef.id,
      ...slideData 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating hero slide:', error);
    return NextResponse.json(
      { error: 'Failed to create hero slide' },
      { status: 500 }
    );
  }
}
