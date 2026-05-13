/**
 * Admin prize draws list (SB4-E).
 *
 * Placeholder until SB4-F + admin column wiring land in Phase 4.
 */

import { Container, Heading, Text } from "@mohasinac/appkit/client";

export default function Page() {
  return (
    <Container className="px-4 py-8">
      <Heading level={1} className="text-3xl font-bold mb-4">
        Admin — Prize Draws
      </Heading>
      <Text className="text-[var(--appkit-color-text-muted)]">
        Admin listing + moderation controls land in Phase 4 alongside SB4-F.
      </Text>
    </Container>
  );
}
