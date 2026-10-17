import { notFound } from "next/navigation";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import type { SellerProductDraft } from "@mohasinac/appkit/features/seller/components/SellerProductShell";
import { sellerUpdateProductAction } from "@/actions/seller.actions";
import { redirect } from "@/i18n/navigation";
import { StoreEditProductShell } from "@/components";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { normalizeListingType } from "@mohasinac/appkit/features/products/utils/listing-type";
import { requireRecord } from "@mohasinac/appkit/next/routing/require-record";

/**
 * Admin prize-draw edit page (SB4-E). Re-uses SellerEditProductView so admin
 * has the same lock semantics: once any prize is revealed, the listing is
 * frozen for everybody (server-side gate in /api/products/[id] PATCH).
 */

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  /*
   * A prize draw is a `product`, so the TYPE is part of existing here: this
   * page hardcodes `listingType: "prize-draw"` into both save handlers, so
   * opening a standard product at this URL and pressing Save would REWRITE its
   * listing type — the same defect shape as the admin product editor's missing
   * art/stickers tabs (Root Cause #98). A wrong-type id is a wrong URL, not a
   * missing record.
   */
  const product = await requireRecord(() => productRepository.findById(id), {
    route: "/admin/prize-draws/[id]/edit",
    key: "products.findById",
  });
  if (product && normalizeListingType(product) !== "prize-draw") notFound();

  async function handleSave(draft: SellerProductDraft) {
    "use server";
    const result = await sellerUpdateProductAction(id, {
      ...draft,
      listingType: "prize-draw",
      status: "draft",
    });
    if (result.ok) redirect(String(ROUTES.ADMIN.PRIZE_DRAWS));
    return result;
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    const result = await sellerUpdateProductAction(id, {
      ...draft,
      listingType: "prize-draw",
      status: "published",
    });
    if (result.ok) redirect(String(ROUTES.ADMIN.PRIZE_DRAWS));
    return result;
  }

  return (
    <StoreEditProductShell
      listingType="prize-draw"
      productId={id}
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
