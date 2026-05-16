import type { Metadata } from "next";
import { PrizeDrawDetailPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

/**
 * Public Prize Draw detail page (SB4-E + SB4-G).
 *
 * Delegates to the appkit `PrizeDrawDetailPageView` which:
 *   - Server-fetches the product by slug/id
 *   - Strips `isWon` from prizeDrawItems[] (public buyers stay unspoiled)
 *   - Renders the full PrizeDrawCollage + entry-fee + reveal-window panel
 *   - Wires "Enter Draw" → NonRefundableConsentModal → add to guest cart
 *   - Surfaces the prizeGithubFileUrl "View RNG source" link
 */

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
  const user = await getServerSessionUser();
  return (
    <PrizeDrawDetailPageView id={slug} currentUserId={user?.uid} />
  );
}
