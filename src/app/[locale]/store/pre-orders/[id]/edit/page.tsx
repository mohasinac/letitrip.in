import { ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { productToDraft } from "@mohasinac/appkit";
import { sellerUpdateProductAction, getSellerProductAction } from "@/actions/seller.actions";
import { redirect, notFound } from "@/i18n/navigation";
import { StoreEditProductShell } from "@/components";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  const product = await getSellerProductAction(id);
  if (!product) notFound();

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
    title: (product as any).title,
    slug: (product as any).slug,
    description: (product as any).description,
    category: (product as any).categorySlug ?? (product as any).category,
    brand: (product as any).brandSlug ?? (product as any).brand,
    condition: (product as any).condition,
    tags: (product as any).tags,
    mainImage: (product as any).mainImage ?? (product as any).images?.[0],
    images: (product as any).images,
    youtubeId: (product as any).youtubeId,
    price: (product as any).price,
    compareAtPrice: (product as any).compareAtPrice,
    stockQuantity: (product as any).stockQuantity ?? (product as any).stock,
    featured: (product as any).isFeatured,
    isNew: (product as any).isNew,
    isOnSale: (product as any).isOnSale,
    status: (product as any).status === "published" ? "published" : "draft",
    seoTitle: (product as any).seoTitle ?? (product as any).seo?.title,
    seoDescription: (product as any).seoDescription ?? (product as any).seo?.description,
    // Pre-order-specific
    preOrderDeliveryDate: (product as any).preOrderDeliveryDate,
    preOrderDepositPercent: (product as any).preOrderDepositPercent,
    preOrderMaxQuantity: (product as any).preOrderMaxQuantity,
    preOrderProductionStatus: (product as any).preOrderProductionStatus,
  };

  async function handleSave(draft: SellerProductDraft) {
    "use server";
    return sellerUpdateProductAction(id, { ...draft, listingType: "pre-order" });
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    const result = await sellerUpdateProductAction(id, { ...draft, listingType: "pre-order", status: "published" });
    if (result.ok) redirect(String(ROUTES.STORE.PRE_ORDERS));
    return result;
  }

  return (
    <StoreEditProductShell
      listingType="pre-order"
      productId={id}
      initialValues={initialValues}
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
