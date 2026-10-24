import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";

/*
 * A per-review title would need the review fetched twice (here and in the
 * page). The id is in the path, so the canonical is still unique per review;
 * the TITLE is deliberately generic because a review's own text is the
 * buyer's, not a page name we should synthesise.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return _gm({
    title: "Buyer Review — LetItRip",
    description: "A verified buyer review of a Beyblade listing on LetItRip.",
    path: `/reviews/${id}`,
  });
}

import { ReviewDetailPageView } from "@mohasinac/appkit";
import { PageViewTracker } from "@mohasinac/appkit/client";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return (
    <>
      {/* `review` was a declared PageViewEntityType that nothing emitted. */}
      <PageViewTracker entityType="review" entityId={id} url={`/reviews/${id}`} />
      <ReviewDetailPageView id={id} />
    </>
  );
}
