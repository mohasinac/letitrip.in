import { NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

// GET /api/products/[slug]/variants - same leaf category
export async function GET(
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
    const prod: any = { id: prodSnap.docs[0].id, ...prodSnap.docs[0].data() };

    const sameLeaf = (await Collections.products()
      .where("category_id", "==", prod.category_id)
      .where("slug", "!=", slug)) as any;
    const sameLeafSnap = await sameLeaf.limit(20).get();
    const data = sameLeafSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Product variants error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load variants" },
      { status: 500 },
    );
  }
}
