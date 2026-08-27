import type { Metadata } from "next";
import { PrizeDrawDetailPageView, PrizeDrawLotteryDetailView } from "@mohasinac/appkit";
import { PageViewTracker } from "@mohasinac/appkit/client";
import { getPrizeDrawForDetail, toClientLotteryConfig } from "@mohasinac/appkit/server";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // This used to interpolate the raw slug straight into the title, shipping
  // `<title>prizedraw-beyblade-burst-collectors-draw — Prize Draw — LetItRip</title>`
  // to Google on every prize-draw page, with a constant description shared by
  // all of them. It never fetched the draw.
  //
  // `getPrizeDrawForDetail` is React.cache()-wrapped (makeGetListingForDetail),
  // and the page body below already calls it — so this read is deduped and adds
  // no Firestore cost.
  const product = await getPrizeDrawForDetail(slug).catch(() => null);
  if (!product) {
    return _gm({
      title: "Prize draw not found — LetItRip",
      description: "This prize draw is unavailable or has ended.",
      path: `/prize-draws/${slug}`,
      noIndex: true,
    });
  }
  return _gm({
    title: `${product.title} — Prize Draw — LetItRip`,
    description:
      product.seoDescription?.trim() ||
      product.description?.slice(0, 160) ||
      `Enter the ${product.title} prize draw on LetItRip — provably fair RNG, verified sellers.`,
    path: `/prize-draws/${slug}`,
    image: product.mainImage || product.images?.[0] || undefined,
  });
}

export const revalidate = 120;

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const [product, user] = await Promise.all([
    getPrizeDrawForDetail(slug),
    getServerSessionUser(),
  ]);

  if (!product) notFound();

  if (product.prizeDrawMode === "lottery" && product.lotteryConfig) {
    // Lottery-mode prize draw — slot grid + self-pull form.
    // Revalidate more frequently since slots change as users pull.
    // (Next.js doesn't allow dynamic revalidate in server components;
    //  the parent layout or segment config handles it — set at 30s via cache tags in future.)
    const clientProduct = {
      id: product.id,
      title: product.title ?? "",
      description: product.description ?? undefined,
      status: product.status ?? "draft",
      mainImage: product.images?.[0] ?? undefined,
      prizeDrawMode: "lottery" as const,
      lotteryConfig: toClientLotteryConfig(product.lotteryConfig),
    };

    return (
      <>
        <PageViewTracker entityType="prize-draw" entityId={slug} url={`/prize-draws/${slug}`} />
        <PrizeDrawLotteryDetailView
          product={clientProduct}
          user={user ? { uid: user.uid, displayName: user.displayName } : null}
        />
      </>
    );
  }

  // Classic reveal-mode prize draw.
  return (
    <>
      <PageViewTracker entityType="prize-draw" entityId={slug} url={`/prize-draws/${slug}`} />
      <PrizeDrawDetailPageView id={slug} currentUserId={user?.uid} />
    </>
  );
}
