import { SellerCreateProductView, ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { createSellerProductAction } from "@/actions/seller.actions";
import { redirect } from "next/navigation";

/**
 * Store-side prize-draw create page (SB4-E + SB4-D).
 *
 * Delegates to SellerCreateProductView with listingType="prize-draw" — the
 * shell renders ProductForm which now includes the prize-draw section
 * (SB4-C) that owns pricePerEntry, reveal window, items editor, etc.
 */

export default function Page() {
  async function handleSave(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({
      ...draft,
      listingType: "prize-draw",
      status: "draft",
    });
    redirect(String(ROUTES.STORE.PRIZE_DRAWS));
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({
      ...draft,
      listingType: "prize-draw",
      status: "published",
    });
    redirect(String(ROUTES.STORE.PRIZE_DRAWS));
  }

  return (
    <SellerCreateProductView
      listingType="prize-draw"
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
