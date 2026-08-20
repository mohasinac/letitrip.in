import type { Metadata } from "next";
import { PrizeDrawDetailPageView, PrizeDrawLotteryDetailView } from "@mohasinac/appkit";
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
  return _gm({
    title: `${slug} — Prize Draw — LetItRip`,
    description: "Fair-RNG prize draw on LetItRip.",
    path: `/prize-draws/${slug}`,
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
      <PrizeDrawLotteryDetailView
        product={clientProduct}
        user={user ? { uid: user.uid, displayName: user.displayName } : null}
      />
    );
  }

  // Classic reveal-mode prize draw.
  return <PrizeDrawDetailPageView id={slug} currentUserId={user?.uid} />;
}
