import { ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { sellerUpdateProductAction } from "@/actions/seller.actions";
import { redirect } from "@/i18n/navigation";
import { StoreEditProductShell } from "@/components";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender. Static export also
 * throws on any client tree reaching useSearchParams() without a Suspense
 * boundary (Root Cause #17), and static generation runs 15 parallel workers,
 * so WHICH page trips it varies between builds — a latent class rather than
 * one bad page. Dynamic is both the correct semantics and the fix.
 */
export const dynamic = "force-dynamic";


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
