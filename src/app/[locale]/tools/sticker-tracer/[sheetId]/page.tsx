import { Container, Heading, Section, Stack, Text } from "@mohasinac/appkit";

/**
 * Thin shim for one sheet's review surface. The guard is the parent layout;
 * the review view, run history and retry panel land in Phase 9.
 */
export default async function StickerSheetPage({
  params,
}: {
  params: Promise<{ sheetId: string }>;
}) {
  const { sheetId } = await params;
  return (
    <Section>
      <Container>
        <Stack gap="comfortable">
          <Heading level={1}>Sheet</Heading>
          <Text color="muted">{sheetId}</Text>
        </Stack>
      </Container>
    </Section>
  );
}
