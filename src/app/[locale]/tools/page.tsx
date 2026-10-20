import { Container, Heading, Section, Stack, Text, ROUTES } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { HELP_AUTHENTICITY_PATH, TOOL_AUTHENTICITY_PATH } from "@/constants";
import { ToolList, type ToolEntry } from "./ToolList";

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
const TOOLS: readonly ToolEntry[] = [
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
  {
    /*
     * 🛑 Last, and `adminOnly`. It is an internal production utility rather
     * than something that answers a buyer's question, which is what every
     * other entry on this page is — the intro promises exactly that, so the
     * card is placed where it cannot be read as part of the promise.
     *
     * Listed here at all because the page was the one place the tool was
     * unreachable from: the navbar's Tools dropdown has carried this entry
     * (admin-gated) since it shipped, and this index had no notion of
     * `adminOnly`, so it was hidden from admins too.
     */
    href: String(ROUTES.PUBLIC.TOOL_STICKER_TRACER),
    title: "Sticker sheet tracer",
    adminOnly: true,
    body:
      "Trace the kiss-cut outlines on a scanned sticker sheet and split it into individual stickers. Tuning runs entirely in your browser and nothing is uploaded until you commit a run.",
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
          <ToolList tools={TOOLS} />
        </Stack>
      </Container>
    </Section>
  );
}
