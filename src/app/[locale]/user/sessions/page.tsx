import { Container, Heading, Section, Stack, Text } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { UserSessionsView } from "@/components/user/UserSessionsView";

export const metadata = _gm({
  title: "Signed-in devices — LetItRip",
  description: "Devices currently signed in to your account, and how to sign one out.",
  path: "/user/sessions",
  // Auth-gated and per-user; a crawler would see only chrome.
  noIndex: true,
});

/**
 * The devices signed in to this account.
 *
 * 🛑 This page is NEW, and the surprising part is that nothing else was.
 * `GET /api/user/sessions` and `DELETE /api/user/sessions/[id]` have both been
 * live with zero consumers, and `BuyerAccountGuideView` already told buyers to
 * "view all devices signed in at My Account → Sessions" — a help doc pointing
 * at a security control that did not exist.
 *
 * Thin shim, like its siblings: the layout owns the session gate and the view
 * fetches client-side, because `user/layout.tsx` reads nothing server-side and
 * adding a read here would make this the only dynamic page in that subtree.
 */
export default function UserSessionsPage() {
  return (
    <Section padding="y-lg">
      <Container size="md">
        <Stack gap="lg" className="min-w-0">
          <Stack gap="xs">
            <Heading level={1}>Signed-in devices</Heading>
            <Text color="muted">
              Every device currently signed in to your account. If you do not
              recognise one, sign it out — and change your password, since
              signing a device out does not stop whoever has your password from
              signing back in.
            </Text>
          </Stack>
          <UserSessionsView />
        </Stack>
      </Container>
    </Section>
  );
}
