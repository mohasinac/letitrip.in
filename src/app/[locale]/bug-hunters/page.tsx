import type { Metadata } from "next";
import { BugHunterLeaderboardView, normalizeError, ROUTES } from "@mohasinac/appkit";
import { getBugHunterLeaderboard } from "@mohasinac/appkit/server";
import { Container, Heading, Section, Text } from "@mohasinac/appkit/ui";
import { generateMetadata as _gm } from "@/constants";

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
    void normalizeError(err);
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
        <BugHunterLeaderboardView isEmpty={entries.length === 0} entries={entries} />
      </Section>
    </Container>
  );
}
