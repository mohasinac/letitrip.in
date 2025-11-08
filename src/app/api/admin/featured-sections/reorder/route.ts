import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/app/api/lib/firebase/admin';
import { COLLECTIONS } from '@/constants/database';

// POST /api/admin/featured-sections/reorder - Reorder sections
export async function POST(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const body = await req.json();
    
    // Validate sections array
    if (!Array.isArray(body.sections)) {
      return NextResponse.json(
        { error: 'Invalid sections array' },
        { status: 400 }
      );
    }
    
    // Update positions in a batch
    const batch = db.batch();
    
    body.sections.forEach((section: { id: string; position: number }, index: number) => {
      const sectionRef = db.collection(COLLECTIONS.FEATURED_SECTIONS).doc(section.id);
      batch.update(sectionRef, {
        position: index + 1,
        updated_at: new Date().toISOString(),
      });
    });
    
    await batch.commit();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering featured sections:', error);
    return NextResponse.json(
      { error: 'Failed to reorder featured sections' },
      { status: 500 }
    );
  }
}
