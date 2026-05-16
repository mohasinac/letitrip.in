import { ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { sellerUpdateProductAction } from "@/actions/seller.actions";
import { redirect } from "@/i18n/navigation";
import { StoreEditProductShell } from "@/components";

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

  async function handleSave(draft: SellerProductDraft) {
    "use server";
    await sellerUpdateProductAction(id, {
      ...draft,
      listingType: "prize-draw",
      status: "draft",
    });
    redirect(String(ROUTES.ADMIN.PRIZE_DRAWS));
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    await sellerUpdateProductAction(id, {
      ...draft,
      listingType: "prize-draw",
      status: "published",
    });
    redirect(String(ROUTES.ADMIN.PRIZE_DRAWS));
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
