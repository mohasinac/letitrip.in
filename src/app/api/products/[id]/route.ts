import { NextResponse } from "next/server";
import { productRepository } from "@/repositories";
export {
  productItemPATCH as PATCH,
  productItemDELETE as DELETE,
} from "@mohasinac/appkit/features/products/server";

// Override GET to use the project's ProductRepository, which auto-decrypts
// PII fields (sellerName, sellerEmail) via the mapDoc override.
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const item = await productRepository.findByIdOrSlug(id);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("[products] GET /api/products/[id] failed", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}
