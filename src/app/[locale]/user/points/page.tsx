import { Container, Heading, Section, Stack, Text } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { UserPointsView } from "@/components/user/UserPointsView";

export const metadata = _gm({
  title: "Your points — LetItRip",
  description: "Points you have earned and what they can be spent on.",
  path: "/user/points",
  // A per-user financial page has nothing to offer a crawler and should not
  // be in an index — the route is auth-gated, so a crawler sees only chrome.
  noIndex: true,
});

/**
 * The buyer's points balance and how each entry arose.
 *
 * Thin shim: the layout owns the session gate and `UserPointsView` fetches its
 * own data client-side, matching the rest of `/user/*` — that subtree reads
 * nothing server-side (`user/layout.tsx` has no session read), so adding one
 * here would make this the only dynamic page in it for no gain.
 */
export default function UserPointsPage() {
  return (
    <Section padding="y-lg">
      <Container size="md">
        <Stack gap="lg" className="min-w-0">
          <Stack gap="xs">
            <Heading level={1}>Your points</Heading>
            <Text color="muted">
              Points come back to you when a parcel costs us less to ship than
              you were quoted. 1 point is worth ₹1 and can be spent on a future
              order — they are a discount on what you buy here, not cash, so
              they cannot be withdrawn or transferred.
            </Text>
          </Stack>
          <UserPointsView />
        </Stack>
      </Container>
    </Section>
  );
}
