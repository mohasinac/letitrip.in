import { ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { createSellerProductAction } from "@/actions/seller.actions";
import { redirect } from "@/i18n/navigation";
import { StoreCreateProductShell } from "@/components";

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
    // Auto-save: create as draft but do NOT redirect — user is still editing.
    return createSellerProductAction({
      ...draft,
      listingType: "prize-draw",
      status: "draft",
    });
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    const result = await createSellerProductAction({
      ...draft,
      listingType: "prize-draw",
      status: "published",
    });
    if (result.ok) redirect(String(ROUTES.STORE.PRIZE_DRAWS));
    return result;
  }

  return (
    <StoreCreateProductShell
      listingType="prize-draw"
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
