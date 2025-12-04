import { Collections } from "@/app/api/lib/firebase/collections";
import { logError } from "@/lib/firebase-error-logger";
import { NextResponse } from "next/server";

// POST /api/products/[slug]/view - increment view count
export async function POST(
  _: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  let slug: string | undefined;
  try {
    const awaitedParams = await params;
    slug = awaitedParams.slug;
    const prodSnap = await Collections.products()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (prodSnap.empty)
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
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
    logError(error as Error, {
      component: "API.products.slug.view.POST",
      metadata: { slug },
    });
    return NextResponse.json(
      { success: false, error: "Failed to increment view" },
      { status: 500 }
    );
  }
}
