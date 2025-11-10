import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

// POST /admin/hero-slides/reorder - Reorder slides
export async function POST(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const body = await req.json();

    // Validate slides array
    if (!Array.isArray(body.slides)) {
      return NextResponse.json(
        { error: "Invalid slides array" },
        { status: 400 }
      );
    }

    // Update positions in a batch
    const batch = db.batch();

    body.slides.forEach(
      (slide: { id: string; position: number }, index: number) => {
        const slideRef = db.collection(COLLECTIONS.HERO_SLIDES).doc(slide.id);
        batch.update(slideRef, {
          position: index + 1,
          updated_at: new Date().toISOString(),
        });
      }
    );

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering hero slides:", error);
    return NextResponse.json(
      { error: "Failed to reorder hero slides" },
      { status: 500 }
    );
  }
}
