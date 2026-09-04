import { ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { productToDraft } from "@mohasinac/appkit";
import { sellerUpdateProductAction, getSellerProductAction } from "@/actions/seller.actions";
import { redirect, notFound } from "@/i18n/navigation";
import { StoreEditProductShell } from "@/components";
import type { ProductListingMode } from "@mohasinac/appkit";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  const product = await getSellerProductAction(id);
  if (!product) notFound();

  // Spread the FULL fetched product first so every writable field (auction,
  // pre-order, classified, digital-code, live-item, print-meta, offers,
  // insurance, GST, shipping, etc.) is seeded from its real saved value —
  // then override only the handful of fields that need renaming/normalizing
  // between ProductDocument's shape and SellerProductDraft's. A hand-picked
  // allow-list here previously dropped ~30 writable fields silently, and two
  // of them (minOfferPercent/insuranceCost) were destructively reset to a
  // hardcoded default the moment the seller touched the paired toggle.
  /*
   * `productToDraft` folds the document's NESTED per-type blocks
   * (classified.meetupArea.city, liveItem.species, digitalCode.*, printMeta.*)
   * back into the flat keys this form uses, plus finalSale / returnPolicy.
   *
   * Spread FIRST so the explicit fields below still win — this only fills in
   * what the hand-written literal never listed. Without it the edit form
   * opened blank for every per-type field, which read as "the data was lost".
   */
  const initialValues: SellerProductDraft = {
    ...productToDraft(product as any),
    ...(product as unknown as SellerProductDraft),
    category: (product as any).categorySlug ?? (product as any).category,
    brand: (product as any).brandSlug ?? (product as any).brand,
    mainImage: (product as any).mainImage ?? (product as any).images?.[0],
    stockQuantity: (product as any).stockQuantity ?? (product as any).stock,
    featured: (product as any).isFeatured,
    status: (product as any).status === "published" ? "published" : "draft",
    seoTitle: (product as any).seoTitle ?? (product as any).seo?.title,
    seoDescription: (product as any).seoDescription ?? (product as any).seo?.description,
  };

  const listingType: ProductListingMode = (product as any).listingType ?? "standard";

  async function handleSave(draft: SellerProductDraft) {
    "use server";
    return sellerUpdateProductAction(id, { ...draft });
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    const result = await sellerUpdateProductAction(id, { ...draft, status: "published" });
    if (result.ok) redirect(String(ROUTES.STORE.PRODUCTS));
    return result;
  }

  return (
    <StoreEditProductShell
      listingType={listingType}
      productId={id}
      initialValues={initialValues}
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
