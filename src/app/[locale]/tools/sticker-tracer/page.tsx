import { Container, Heading, Section, Stack, Text } from "@mohasinac/appkit";
import { StickerTracerWorkbench } from "@/components/sticker-trace/StickerTracerWorkbench";

/**
 * Thin shim — the guard is the layout, the surface is the workbench.
 *
 * Imported by DEEP PATH, not from the client barrel: `@mohasinac/appkit/client`
 * is `"use client"`, so a Server Component importing a runtime value from it
 * gets a client-reference proxy and throws an opaque React #441 (Root Cause
 * #76). A component rendered as JSX is the one safe shape — and importing the
 * defining module keeps that unambiguous.
 */
export default function StickerTracerPage() {
  return (
    <Section>
      <Container>
        <Stack gap="comfortable">
          <Heading level={1}>Sticker sheet tracer</Heading>
          <Text color="muted">
            Pick a scanned sheet to trace its kiss-cut outlines. Tuning runs
            entirely in your browser — nothing is uploaded until you commit a run.
          </Text>
          <StickerTracerWorkbench />
        </Stack>
      </Container>
    </Section>
  );
}
