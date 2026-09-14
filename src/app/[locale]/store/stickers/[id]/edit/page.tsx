import { ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { productToDraft } from "@mohasinac/appkit";
import { sellerUpdateProductAction, getSellerProductAction } from "@/actions/seller.actions";
import { redirect, notFound } from "@/i18n/navigation";
import { StoreEditProductShell } from "@/components";
import { buildPrintMetaPayload } from "@/lib/print-meta";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  /*
   * getSellerProductAction returns an ActionResult ENVELOPE, not a product.
   * `if (!product)` on `{ ok, data }` is always false, so notFound() never
   * fired and the envelope was spread into initialValues below — every real
   * field undefined, which is what rendered the editor blank. Worse, the
   * `status === "published" ? "published" : "draft"` line then read undefined,
   * so saving wrote "draft" over a live listing. Unwrap, exactly as
   * prize-draws/[id]/entries/page.tsx always did.
   */
  const result = await getSellerProductAction(id);
  const product = result.ok ? result.data : null;
  if (!product) notFound();

  const printMeta = (product as any).printMeta ?? {};
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
    /*
     * 🛑 `categorySlug` (singular) IS NOT A FIELD on ProductDocument — the real
     * one is `categorySlugs: string[]`, whose FIRST entry is the leaf. This read
     * therefore always yielded undefined and fell through to the @deprecated
     * `category` scalar; for any product written by the seed, the catalogue
     * promoter or an admin PATCH (all of which write `categorySlugs` and may
     * omit `category`) BOTH sides were undefined, so the edit form opened with
     * an empty Category — and saving that blank re-submitted it. Same family as
     * the ActionResult envelope bug these nine files carried (Root Cause #98):
     * a form that silently loses the field it was opened to edit.
     */
    category:
      (product as any).categorySlugs?.[0] ?? (product as any).category,
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
    printSize: printMeta.size,
    printMaterial: printMeta.material,
    printFinish: printMeta.finish,
    printEditionSize: printMeta.editionSize,
  };

  async function handleSave(draft: SellerProductDraft) {
    "use server";
    return sellerUpdateProductAction(id, { ...buildPrintMetaPayload(draft), listingType: "stickers" });
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    const result = await sellerUpdateProductAction(id, {
      ...buildPrintMetaPayload(draft),
      listingType: "stickers",
      status: "published",
    });
    if (result.ok) redirect(String(ROUTES.STORE.STICKERS));
    return result;
  }

  return (
    <StoreEditProductShell
      listingType="stickers"
      productId={id}
      initialValues={initialValues}
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
