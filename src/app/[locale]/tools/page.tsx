import { Container, Heading, Row, Section, Stack, Text, TextLink, ROUTES } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const metadata = _gm({
  title: "Tools — LetItRip",
  description:
    "Free collector tools: look up what an item actually sold for, and check a seller against the scam registry.",
  path: "/tools",
});

/**
 * The Tools index.
 *
 * 🛑 This page exists because the navbar's "Tools" dropdown trigger is a REAL
 * LINK, not a `#`. Three reasons, and each one on its own is sufficient:
 * someone on a touch device who taps the trigger has to land somewhere;
 * `audit-nav-page-wiring` is strict-zero on a nav href with no `page.tsx`; and
 * a crawler follows it, so a dead parent would be a 404 in the sitemap's own
 * navigation.
 *
 * Static — nothing here is per-request, so it inherits the locale layout's
 * caching and costs no function invocation.
 */
const TOOLS = [
  {
    href: String(ROUTES.PUBLIC.TOOL_PRICE_INDEX),
    title: "What it sold for",
    body:
      "Search any model, part or set and see what it actually sold for here — the range, the median, the average and the most recent sale, broken down by condition. Completed sales only, never asking prices.",
  },
  {
    href: String(ROUTES.PUBLIC.PARTS),
    title: "Parts database",
    body:
      "Every Beyblade component we have a record of, grouped by what it is — attack rings, fusion wheels, spin tracks, performance tips, drivers, ratchets and bits. Each one shows its weight, the codes it is printed with, which models use it, and what is currently listed.",
  },
  {
    href: String(ROUTES.PUBLIC.SCAMS),
    title: "Scam registry",
    body:
      "Check a UPI handle, phone number or seller name against reports the community has filed, and file one yourself.",
  },
];

export default function ToolsIndexPage() {
  return (
    <Section padding="y-lg">
      <Container size="lg">
        <Stack gap="lg" className="min-w-0">
          <Stack gap="xs">
            <Heading level={1}>Tools</Heading>
            <Text color="muted">
              Free for anyone, no account needed. Both of these answer a
              question rather than sell you something.
            </Text>
          </Stack>
          <Stack gap="md" className="min-w-0">
            {TOOLS.map((t) => (
              <Stack
                key={t.href}
                gap="xs"
                padding="card"
                rounded="lg"
                surface="card"
                border="subtle"
                className="min-w-0"
              >
                <Row align="center" justify="between" gap="sm" className="min-w-0">
                  <Heading level={2}>
                    <TextLink href={t.href}>{t.title}</TextLink>
                  </Heading>
                </Row>
                <Text color="muted">{t.body}</Text>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
