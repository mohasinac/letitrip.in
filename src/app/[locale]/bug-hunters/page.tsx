import type { Metadata } from "next";
import { BugHunterLeaderboardView, normalizeError, ROUTES, serverLogger } from "@mohasinac/appkit";
import { getBugHunterLeaderboard } from "@mohasinac/appkit/server";
import { Container, Heading, Section, Text, TextLink } from "@mohasinac/appkit/ui";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const revalidate = 0;

export const metadata: Metadata = _gm({
  title: "Bug Hunters Leaderboard — LetItRip",
  description: "Top testers ranked by confirmed bugs found during LetItRip's tester QA program.",
  path: String(ROUTES.PUBLIC.BUG_HUNTERS),
  keywords: ["letitrip bug hunters", "tester leaderboard", "qa rewards"],
});

export default async function Page() {
  let entries: Awaited<ReturnType<typeof getBugHunterLeaderboard>> = [];
  try {
    entries = await getBugHunterLeaderboard();
  } catch (err) {
    // `entries` stays [], which renders as "no bug hunters yet" — a claim, not
    // an error state. Log it so an empty board is attributable.
    const normalized = normalizeError(err);
    serverLogger.warn("getBugHunterLeaderboard failed — /bug-hunters rendering empty", {
      error: normalized.message,
    });
  }

  return (
    <Container size="lg" paddingY="y-xl">
      <Section>
        <Heading level={1} size="xl" weight="bold">
          Bug Hunters Leaderboard
        </Heading>
        <Text color="muted" paddingY="sm">
          Testers ranked by confirmed bugs found during our QA program.
        </Text>
        <TextLink href={String(ROUTES.USER.TESTER_HUB)} variant="underline" weight="medium">
          ← Back to Tester Hub
        </TextLink>
        <BugHunterLeaderboardView isEmpty={entries.length === 0} entries={entries} />
      </Section>
    </Container>
  );
}
