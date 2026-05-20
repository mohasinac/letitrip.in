import { ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
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
  };

  async function handleSave(draft: SellerProductDraft) {
    "use server";
    await sellerUpdateProductAction(id, { ...draft, listingType: "prize-draw" });
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    await sellerUpdateProductAction(id, {
      ...draft,
      listingType: "prize-draw",
      status: "published",
    });
    redirect(String(ROUTES.STORE.PRIZE_DRAWS));
  }

  return (
    <StoreEditProductShell
      listingType="prize-draw"
      productId={id}
      initialValues={initialValues}
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
