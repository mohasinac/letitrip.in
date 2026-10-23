import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { SellerGuideView } from "@mohasinac/appkit/features/seller/components/SellerGuideView";
import { SellerStandingPanel } from "@mohasinac/appkit/features/stores/components/SellerStandingPanel";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import { Stack, Row } from "@mohasinac/appkit/ui/components/Layout";
import { Section, Ol, Ul, Li } from "@mohasinac/appkit/ui/components/Semantic";
import { TextLink } from "@mohasinac/appkit/ui/components/TextLink";
import { Heading, Span, Text } from "@mohasinac/appkit/ui/components/Typography";

export const metadata: Metadata = _gm({
  title: "Seller Guide — LetItRip",
  description: "Everything you need to know to start selling collectibles on LetItRip. List products, manage orders, run auctions and grow your store.",
  path: "/seller-guide",
  keywords: ["sell collectibles india", "become a seller letitrip", "marketplace seller guide"],
});

export const revalidate = 3600;

const H2 = "mb-3 text-[length:var(--appkit-text-xl)] font-semibold";

/*
 * 🛑 THIS PAGE RENDERED NOTHING AT ALL UNTIL 2026-10-02.
 *
 * It was `return <SellerGuideView />` — no props. SellerGuideView is a pure slot
 * shell whose `sections`, `cta`, `renderSections` and `renderCTA` are ALL
 * optional, so it rendered a StackedViewShell with sections [undefined,
 * undefined] and no title. That is Recurrent Root Cause #8 word for word:
 * "Calling any appkit view shell with zero render props renders a layout
 * skeleton with no content."
 *
 * Measured signed out on production: header, the breadcrumb "Home / Seller
 * guide", a blank white gap, the trust strip, the footer. <main> existed and
 * held no text, there were ZERO headings at any level, and the only links on the
 * page belonged to the footer. Stable across 10 seconds, with no error boundary
 * — it did not crash, it rendered nothing.
 *
 * It failed three checklist cases at once: the guide itself, "linked from
 * /seller-guide" for both sub-pages, and the signed-out call to action. All
 * three were one unwired page.
 *
 * And it is public-facing: the metadata above promises "Everything you need to
 * know to start selling collectibles on LetItRip", which is what a search
 * result showed for a blank page.
 *
 * The two sub-pages (bundles, prize-draws) were always fine and are the model
 * this follows — same shell, same Section/Heading/Ol structure. The shell was
 * never broken; only the parent never passed it anything.
 */
export default function Page() {
  return (
    <SellerGuideView
      labels={{ title: "Seller Guide" }}
      sections={
        <Stack gap="none" className="max-w-3xl">
          <Section>
            <Heading level={2} className={H2}>Why sell on LetItRip?</Heading>
            <Text color="muted">
              LetItRip is a collector-first marketplace for figures, TCG gear, cosplay and curated
              collectibles. You list what you have, buyers find it through category, brand and store
              pages, and payouts settle to your account after delivery.
            </Text>
          </Section>

          <Section>
            <Heading level={2} className={H2}>Getting started</Heading>
            <Ol marker="decimal" spacing="comfortable" indent="lg" size="sm" color="muted">
              <Li>
                Create an account, then open{" "}
                <TextLink href={String(ROUTES.USER.BECOME_SELLER)}>Become a Seller</TextLink> and tell us
                about your store.
              </Li>
              <Li>Add your store name, logo and banner so buyers can recognise you.</Li>
              <Li>Add a pickup address and your payout details.</Li>
              <Li>
                List your first item from <Span weight="bold">Store Dashboard → Listings → New</Span>.
              </Li>
              <Li>Publish. Your listing appears on your store page and in the relevant browse pages.</Li>
            </Ol>
          </Section>

          <Section>
            <Heading level={2} className={H2}>What you can list</Heading>
            <Ul marker="disc" spacing="comfortable" indent="lg" size="sm" color="muted">
              <Li><Span weight="bold">Standard products</Span> — a fixed price, add to cart, ship on order.</Li>
              <Li><Span weight="bold">Auctions</Span> — a starting price and an end date, with an optional Buy It Now.</Li>
              <Li><Span weight="bold">Pre-orders</Span> — take a deposit now against a later release date.</Li>
              <Li><Span weight="bold">Classifieds</Span> — local, contact-the-seller listings with no cart.</Li>
              <Li><Span weight="bold">Digital codes</Span> — delivered from a code pool as soon as payment clears.</Li>
              {/*
                🛑 HIDDEN BLOCK — bundles and prize draws, withdrawn 2026-10-20
                with their footer entries and their guides-hub cards. This list
                answers "what can I list?", so an entry here is a commitment
                that the type can be published today.

                <Li>
                  <Span weight="bold">Bundles</Span> and <Span weight="bold">prize draws</Span> — the two
                  worth reading up on first, below.
                </Li>
              */}
            </Ul>
          </Section>

          <Section>
            <Heading level={2} className={H2}>Orders, shipping and payouts</Heading>
            <Ul marker="disc" spacing="comfortable" indent="lg" size="sm" color="muted">
              <Li>Orders arrive in <Span weight="bold">Store Dashboard → Orders</Span> with the buyer&apos;s delivery address.</Li>
              <Li>Mark an order shipped and enter the carrier and tracking number; the buyer sees both.</Li>
              <Li>
                Fees are listed on{" "}
                <TextLink href={String(ROUTES.PUBLIC.FEES)}>Fees &amp; Pricing</TextLink>, and{" "}
                <TextLink href={String(ROUTES.PUBLIC.HOW_PAYOUTS_WORK)}>How Payouts Work</TextLink>{" "}
                explains when money reaches you.
              </Li>
            </Ul>
          </Section>

          {/*
            🛑 HIDDEN BLOCK — the whole section, not just its two links: a
            heading reading "Guides for specific listing types" over an empty
            Row is a worse page than no section at all.

            Both guides still exist at their own URLs and still render; what is
            withdrawn is every link that leads to them. Restore this section and
            the `<Li>` above together — they describe the same two types.

            <Section>
              <Heading level={2} className={H2}>Guides for specific listing types</Heading>
              <Row gap="dense" wrap>
                <TextLink href={String(ROUTES.PUBLIC.SELLER_GUIDE_BUNDLES)}>Bundles Guide →</TextLink>
                <TextLink href={String(ROUTES.PUBLIC.SELLER_GUIDE_PRIZE_DRAWS)}>Prize Draws Guide →</TextLink>
              </Row>
            </Section>
          */}
        </Stack>
      }
      cta={
        <Section>
          {/*
            🛑 The criteria table is RENDERED FROM `SELLER_STANDING_DEFAULTS`,
            never typed out here. A hand-written "25 delivered orders" on this
            page is exactly how the feature came to be remembered as something
            it was not: the only statement of the criteria that existed was
            prose in an admin guide (">=20 delivered orders, >=4.0 rating, 3+
            months active") that no code ever read. If an admin retunes the
            thresholds, this page follows.

            `showProgress` is off — there is no signed-in seller here to be
            "3 of 5" about, and `standing` is absent so every figure renders as
            an em-dash against its target rather than a fake zero.
          */}
          <Stack gap="md" className="max-w-3xl">
            <Heading level={2} className={H2}>Growing your store</Heading>
            <Text color="muted">
              Sellers who consistently deliver earn <Span weight="bold">Trusted Seller</Span>{" "}
              status. It puts a badge on your store and every listing card, and it
              changes when you get paid: your payout starts when you ship, instead of
              waiting for the parcel to be delivered.
            </Text>
            <SellerStandingPanel heading="How to earn it" />
            <Text color="muted" size="sm">
              Status is recalculated on the last day of every month, so a good month
              shows up at month end rather than immediately. It can also be lost — if
              your store drops below any criterion, the badge pauses and payouts return
              to starting on delivery until you are back above it. See{" "}
              <TextLink href={String(ROUTES.PUBLIC.HOW_PAYOUTS_WORK)}>how payouts work</TextLink>{" "}
              and <TextLink href={String(ROUTES.PUBLIC.FEES)}>fees</TextLink>.
            </Text>
          </Stack>

          <Stack gap="xs" className="max-w-3xl">
            <Heading level={2} className={H2}>Ready to start?</Heading>
            <Text color="muted">
              Setting up a store takes a few minutes and costs nothing until you sell.
            </Text>
            <Row gap="dense" wrap>
              <TextLink href={String(ROUTES.USER.BECOME_SELLER)}>Become a Seller →</TextLink>
              <TextLink href={String(ROUTES.PUBLIC.FEES)}>See fees first</TextLink>
            </Row>
          </Stack>
        </Section>
      }
    />
  );
}
