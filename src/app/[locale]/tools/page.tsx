import { Container, Heading, Section, Stack, Text, TextLink, ROUTES } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { HELP_AUTHENTICITY_PATH, TOOL_AUTHENTICITY_PATH } from "@/constants";

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
    title: "Beyblade parts gallery",
    body:
      "Every Beyblade component we have a record of, grouped by what it is — attack rings, fusion wheels, spin tracks, performance tips, drivers, ratchets and bits. Each one shows its weight, the codes it is printed with, which models use it, and what is currently listed.",
  },
  {
    href: String(ROUTES.PUBLIC.SCAMS),
    title: "Scam registry",
    body:
      "Check a UPI handle, phone number or seller name against reports the community has filed, and file one yourself.",
  },
  {
    href: TOOL_AUTHENTICITY_PATH,
    title: "Authenticity checker",
    body:
      "Give it a model name, a box code or the brand on the packaging and it tells you which checks apply to that generation, what the recorded box codes say, and what is still unsettled. It opens on Metal Fight, which is where every recorded box code lives. It grades rather than rules: the strongest thing it will say is that something matches a batch the community records as a midfake.",
  },
  {
    href: HELP_AUTHENTICITY_PATH,
    title: "Is my Beyblade original?",
    body:
      "The vocabulary, free and with no account: what original, reproduction, midfake and unlicensed each mean, how to read the code on the box and why a real code proves nothing on its own, which checks are conclusive per generation, and which brands are actually licensed.",
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
              Each of these answers a question rather than selling you something.
              All free, and none of them asks you to sign in first — the moment
              you need the authenticity checker is usually the moment you are
              standing in front of the thing, which is a bad time to be asked to
              register.
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
                {/*
                  * The "sign-in needed" chip and the `requiresAccount` flag
                  * behind it were deleted with the authenticity gate rather
                  * than left in place with nothing setting them: a badge no
                  * entry can carry is a promise the list silently stopped
                  * being able to keep, and the next tool that needs one would
                  * inherit a mechanism nobody had seen render.
                  */}
                <Heading level={2}>
                  <TextLink href={t.href}>{t.title}</TextLink>
                </Heading>
                <Text color="muted">{t.body}</Text>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
