import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import { Stack } from "@mohasinac/appkit/ui/components/Layout";
import { Section, Ul, Li } from "@mohasinac/appkit/ui/components/Semantic";
import { TextLink } from "@mohasinac/appkit/ui/components/TextLink";
import { Heading, Span, Text } from "@mohasinac/appkit/ui/components/Typography";
import { ProseHero } from "@mohasinac/appkit/features/about/components/ProseHero";
import { SellerStandingPanel } from "@mohasinac/appkit/features/stores/components/SellerStandingPanel";

/**
 * What the seller badges mean — written for a BUYER.
 *
 * 🛑 The one genuinely new page in this change. Everything else about seller
 * trust extended a page that already existed, because the repo already has
 * ~35 public explainers; this gap was real: both badges were explained only
 * inside the seller dashboard, i.e. to the one audience that does not need
 * reassuring by them. Every `SellerTierBadge` links here.
 *
 * 🛑 PUBLIC MEANING ONLY. It must never say "we pay them before delivery" —
 * that is `trustedSeller`, our own risk posture, and it is in
 * `PRIVATE_STORE_FIELDS` precisely so it is not presented to buyers as an
 * endorsement. The seller-facing guides state the payout consequence because
 * it is the seller's own money; a buyer is told what the badge says about the
 * seller, which is all it is evidence of.
 */
export const metadata: Metadata = _gm({
  title: "What seller badges mean — LetItRip",
  description:
    "Verified and Trusted Seller badges on LetItRip: what each one means, how a seller earns it, and what it does and does not tell you before you buy.",
  path: "/help/seller-badges",
  keywords: ["verified seller", "trusted seller", "letitrip seller badges", "is this seller safe"],
});

export const revalidate = 3600;

export default function Page() {
  return (
    <Section>
      <Stack gap="section">
        <ProseHero
          title="What the seller badges mean"
          subtitle="Two badges can appear on a store. They answer different questions, and neither is a guarantee about a particular item."
          width="md"
        />

        <Stack gap="md" className="max-w-3xl">
          <Heading level={2} size="xl" weight="semibold">
            Verified
          </Heading>
          <Text color="muted">
            <Span weight="bold">Verified</Span> means LetItRip has checked who the
            seller is — a real person or business behind the store, confirmed against
            government-issued ID. An admin reviews and grants it.
          </Text>
          <Text color="muted">
            It is about identity, not performance. A brand-new store can be Verified on
            its first day, and a very busy store might not be.
          </Text>
        </Stack>

        <Stack gap="md" className="max-w-3xl">
          <Heading level={2} size="xl" weight="semibold">
            Trusted Seller
          </Heading>
          <Text color="muted">
            <Span weight="bold">Trusted Seller</Span> is earned from the store&apos;s
            recent trading record, and it is recalculated on the last day of every
            month. A store has to meet all of these at once, measured over the same
            rolling window:
          </Text>
          {/*
            🛑 Rendered from `SELLER_STANDING_DEFAULTS`, never typed out. A
            buyer-facing page stating different numbers from the job that grants
            the badge is worse than no page: it is a promise the platform is not
            keeping, and it is exactly how this feature came to be remembered as
            something nobody had built.
          */}
          <SellerStandingPanel heading="What a Trusted Seller has done" />
          <Text color="muted" size="sm">
            Because it is recalculated monthly, a store can lose it — and regain it.
            A store that stops meeting any one of these has the badge paused until it
            is back above the line.
          </Text>
        </Stack>

        <Stack gap="md" className="max-w-3xl">
          <Heading level={2} size="xl" weight="semibold">
            What a badge does not tell you
          </Heading>
          <Ul marker="disc" spacing="tight" indent="lg" size="sm" color="muted">
            <Li>
              It is not a statement about a particular item. Read the listing, the
              photos and the item&apos;s own reviews.
            </Li>
            <Li>
              It is not a guarantee against a dispute. Your{" "}
              <TextLink href={String(ROUTES.PUBLIC.REFUND_POLICY)}>refund rights</TextLink>{" "}
              are the same whatever badges a store holds.
            </Li>
            <Li>
              An unbadged store is not a warning. Most stores are ordinary sellers who
              have not met the volume bar or have not applied for an identity check.
            </Li>
          </Ul>
          <Text color="muted" size="sm">
            Buying something? <TextLink href={String(ROUTES.PUBLIC.SPOT_A_FAKE)}>How to spot a fake</TextLink>{" "}
            and the <TextLink href={String(ROUTES.PUBLIC.HELP)}>help centre</TextLink>{" "}
            cover the checks worth doing on any listing.
          </Text>
        </Stack>
      </Stack>
    </Section>
  );
}
