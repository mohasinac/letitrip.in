import { Container, Heading, Section, Stack, Text } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { UserPaymentMethodsView } from "@/components/user/UserPaymentMethodsView";

export const metadata = _gm({
  title: "Saved payment methods — LetItRip",
  description: "The payment methods saved to your account, and how to remove one.",
  path: "/user/payment-methods",
  // Auth-gated and per-user; a crawler would see only chrome.
  noIndex: true,
});

/**
 * The buyer's saved payment methods.
 *
 * 🛑 This page is NEW and its API was not. `GET`/`POST
 * /api/user/payment-methods` and `DELETE [id]` have all been live with zero
 * consumers — a grep for the path returned only the route files themselves —
 * so buyers had saved methods they could neither see nor remove.
 *
 * See `UserPaymentMethodsView` for why there is no "Set as default" control:
 * the PUT route exists only to appeal a ban and would 400 on anything else.
 */
export default function UserPaymentMethodsPage() {
  return (
    <Section padding="y-lg">
      <Container size="md">
        <Stack gap="lg" className="min-w-0">
          <Stack gap="xs">
            <Heading level={1}>Saved payment methods</Heading>
            <Text color="muted">
              Methods you chose to save at checkout. We store a masked label
              and never the full number — removing one here stops it appearing
              at checkout and does not affect any order already placed with it.
            </Text>
          </Stack>
          <UserPaymentMethodsView />
        </Stack>
      </Container>
    </Section>
  );
}
