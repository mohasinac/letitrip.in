import { NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

// POST /api/products/[slug]/view - increment view count
export async function POST(
  _: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const prodSnap = await Collections.products()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (prodSnap.empty)
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    const id = prodSnap.docs[0].id;

    await Collections.products()
      .doc(id)
      .update({
        views: (prodSnap.docs[0].data().views || 0) + 1,
        updated_at: new Date().toISOString(),
      });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Increment view error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to increment view" },
      { status: 500 },
    );
  }
}
