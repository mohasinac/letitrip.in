import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/app/api/lib/firebase/admin';
import { COLLECTIONS } from '@/constants/database';

// GET /api/homepage/hero-slides - Public endpoint for active hero slides
export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    
    // Get all active hero slides ordered by position
    const snapshot = await db
      .collection(COLLECTIONS.HERO_SLIDES)
      .where('is_active', '==', true)
      .orderBy('position', 'asc')
      .get();
    
    const slides = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        image: data.image_url,
        title: data.title,
        subtitle: data.subtitle || '',
        description: data.description || '',
        ctaText: data.cta_text || 'Shop Now',
        ctaLink: data.link_url || '/',
        order: data.position,
        enabled: data.is_active,
      };
    });
    
    return NextResponse.json({ slides });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    // Return empty array on error to prevent breaking the frontend
    return NextResponse.json({ slides: [] });
  }
}
