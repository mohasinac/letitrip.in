import { ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { sellerUpdateProductAction, getSellerProductAction } from "@/actions/seller.actions";
import { redirect, notFound } from "@/i18n/navigation";
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


interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  const product = await getSellerProductAction(id);
  if (!product) notFound();

  const initialValues: SellerProductDraft = {
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
