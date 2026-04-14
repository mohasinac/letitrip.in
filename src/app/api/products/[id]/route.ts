import { NextResponse } from "next/server";
import { productRepository } from "@/repositories";
import { withProviders } from "@/providers.config";
import {
  productItemPATCH,
  productItemDELETE,
} from "@mohasinac/appkit/features/products/server";

export const PATCH = withProviders(productItemPATCH);
export const DELETE = withProviders(productItemDELETE);

// Override GET to use the project's ProductRepository, which auto-decrypts
// PII fields (sellerName, sellerEmail) via the mapDoc override.
async function _GET(
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

export const GET = withProviders(_GET);
