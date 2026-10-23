import type { Metadata } from "next";
import { Button, Container, Grid, Heading, Row, Section, Stack, Text, TextLink } from "@mohasinac/appkit";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import { generateMetadata as _gm } from "@/constants/seo.server";

/**
 * /sell — the public "why and how to sell on LetItRip" page.
 *
 * 🛑 It was a bare `redirect()` to `/user/become-seller`, which lives under the
 * auth-gated `/user` subtree. So the one page whose entire job is recruiting
 * sellers bounced every logged-out visitor into a login wall — the audience it
 * exists for could not read a word of it. It was also unreachable to crawlers
 * and to anyone assessing the business from outside.
 *
 * ## Static on purpose
 *
 * No session is read here. Both calls to action are rendered unconditionally —
 * "create an account" for a new seller, "log in" for a returning one — so the
 * page stays cacheable and the root layout stays static (Root Cause #82).
 * Reading the session to pick ONE button would make this route dynamic and buy
 * nothing: a signed-in visitor clicking "create account" lands on their own
 * account anyway.
 */
export const metadata: Metadata = _gm({
  title: "Sell on LetItRip — open your collectibles store",
  description:
    "Open a store on LetItRip and sell Beyblades, trading cards, figures and collectibles to buyers across India. No listing fees to start, and order updates sent to your buyers on WhatsApp.",
  path: "/sell",
  keywords: ["sell collectibles india", "open online store", "sell beyblade online", "become a seller"],
});

export const revalidate = 3600;

const STEPS: readonly { n: string; title: string; body: string }[] = [
  {
    n: "1",
    title: "Create your account",
    body: "Sign up with an email address. It takes a minute and costs nothing.",
  },
  {
    n: "2",
    title: "Open your store",
    body: "Pick a store name and web address, add a logo, and tell buyers what you collect and sell.",
  },
  {
    n: "3",
    title: "List what you have",
    body: "Add items with photos and a price. Sell outright, run an auction, take pre-orders, or list spare parts — whatever fits the item.",
  },
  {
    n: "4",
    title: "Ship and get paid",
    body: "We handle checkout and payments. You pack the order, add a tracking number, and your payout follows.",
  },
];

const BENEFITS: readonly { title: string; body: string }[] = [
  {
    title: "Buyers who are already looking",
    body: "People come to LetItRip for collectibles specifically, so your listings are in front of an audience that knows what they are looking at.",
  },
  {
    title: "Every kind of listing",
    body: "Fixed price, auctions, pre-orders, prize draws, spare parts, art and sticker sheets — all supported, each with the right chrome.",
  },
  {
    title: "WhatsApp order updates",
    body: "Subscribe to our monthly add-on and your buyers get order confirmed, shipped and delivered updates on WhatsApp, sent from LetItRip's verified business number. You need no WhatsApp Business account of your own.",
  },
  {
    title: "Your own storefront",
    body: "A store page at your own address, with your branding, that you can share anywhere.",
  },
];

export default function Page() {
  return (
    <Section>
      <Container>
        <Stack gap="section">
          <Stack gap="md" className="max-w-3xl">
            <Heading level={1} size="3xl" weight="bold" color="primary">
              Sell your collectibles on LetItRip
            </Heading>
            <Text variant="secondary" size="lg">
              Open a store and reach buyers across India who are already hunting for
              Beyblades, trading cards, figures and the rest. Listing is free to start.
            </Text>

            <Row gap="sm" wrap>
              <Button asChild variant="primary" size="lg">
                <Link href={String(ROUTES.AUTH.REGISTER)}>Create your seller account</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href={String(ROUTES.AUTH.LOGIN)}>Log in</Link>
              </Button>
            </Row>
            <Text color="muted" size="sm">
              Already signed in? Head straight to{" "}
              <TextLink href={String(ROUTES.USER.BECOME_SELLER)}>opening your store</TextLink>.
            </Text>
          </Stack>

          <Stack gap="md">
            <Heading level={2} size="xl" weight="semibold">
              How it works
            </Heading>
            <Grid cols="cards" gap="md">
              {STEPS.map((s) => (
                <Stack key={s.n} gap="sm" surface="card" padding="md" rounded="lg">
                  <Row gap="sm" align="center">
                    <Row
                      className="shrink-0 w-7 h-7"
                      align="center"
                      justify="center"
                      rounded="full"
                      surface="subtle"
                    >
                      <Text size="xs" weight="bold">{s.n}</Text>
                    </Row>
                    <Text weight="semibold">{s.title}</Text>
                  </Row>
                  <Text color="muted" size="sm">{s.body}</Text>
                </Stack>
              ))}
            </Grid>
          </Stack>

          <Stack gap="md">
            <Heading level={2} size="xl" weight="semibold">
              What you get
            </Heading>
            <Grid cols="cards" gap="md">
              {BENEFITS.map((b) => (
                <Stack key={b.title} gap="sm" surface="card" padding="md" rounded="lg">
                  <Text weight="semibold">{b.title}</Text>
                  <Text color="muted" size="sm">{b.body}</Text>
                </Stack>
              ))}
            </Grid>
          </Stack>

          <Stack gap="md" surface="card" padding="md" rounded="lg" className="max-w-3xl">
            <Heading level={2} size="lg" weight="semibold">
              Ready to start?
            </Heading>
            <Text color="muted" size="sm">
              Create an account, open your store, and list your first item. If you want to
              see what other stores look like first, browse the{" "}
              <TextLink href={String(ROUTES.PUBLIC.STORES)}>seller directory</TextLink>.
            </Text>
            <Row gap="sm" wrap>
              <Button asChild variant="primary">
                <Link href={String(ROUTES.AUTH.REGISTER)}>Create your seller account</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href={String(ROUTES.AUTH.LOGIN)}>I already have an account</Link>
              </Button>
            </Row>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
