import { Container, Heading, Section, Stack, Text } from "@mohasinac/appkit";

/**
 * Thin shim. The guard is the layout; the view lands in Phase 9.
 */
export default function StickerTracerPage() {
  return (
    <Section>
      <Container>
        <Stack gap="comfortable">
          <Heading level={1}>Sticker sheet tracer</Heading>
          <Text color="muted">
            Upload a scanned sheet to trace its kiss-cut outlines and split it
            into individual stickers.
          </Text>
        </Stack>
      </Container>
    </Section>
  );
}
