import type { Metadata } from "next";
import { Container, Heading, Text } from "@mohasinac/appkit/client";
import { generateMetadata as _gm } from "@/constants/seo.server";

/**
 * Public Prize Draw detail page (SB4-E).
 *
 * Placeholder until SB4-G `PrizeDrawDetailPageView` lands. Slug-based route
 * matches the product slug (e.g. `prize-pokemon-mystery-box-june`).
 */

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
  return (
    <Container className="px-4 py-8">
      <Heading level={1} className="text-3xl font-bold mb-4">
        Prize Draw: {slug}
      </Heading>
      <Text className="text-[var(--appkit-color-text-muted)]">
        Detail UI ships with SB4-G — page shim wired so the route resolves.
      </Text>
    </Container>
  );
}
