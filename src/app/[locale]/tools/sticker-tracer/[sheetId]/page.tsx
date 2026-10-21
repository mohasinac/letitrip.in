import { Container, Heading, Section, Stack, Text } from "@mohasinac/appkit";
import { StickerTracerWorkbench } from "@/components/sticker-trace/StickerTracerWorkbench";

/**
 * One sheet's review surface.
 *
 * 🛑 THIS WAS A STUB that rendered `<Heading>Sheet</Heading>` and the raw id,
 * with a comment deferring the real thing to "Phase 9". So a real, reachable
 * URL displayed a page title and a slug — and
 * `ROUTES.PUBLIC.TOOL_STICKER_SHEET` pointed at it with zero callers, which is
 * the other half of why the tracer "shows no previous runs": a sheet existed
 * in Firestore and nothing in the product could open it.
 *
 * Nothing new had to be built. `StickerTracerWorkbench` already renders the
 * run history, the retry panel and the print panel — every one of them gated
 * on a `sheetId` it could previously only obtain by creating a sheet in the
 * same session. Handing it one through `initialSheetId` is the whole fix.
 *
 * Imported by DEEP PATH for the same reason as the parent page:
 * `@mohasinac/appkit/client` is `"use client"`, so a Server Component
 * importing a runtime value from it gets a client-reference proxy and throws
 * an opaque React #441 (Root Cause #76).
 *
 * 🛑 No existence check here, unlike the admin detail pages. The workbench
 * fetches the run list itself and `refreshRuns` already reports a failed fetch
 * as a visible error rather than an empty list — its own comment is explicit
 * that "no runs yet" about a sheet with eight is the worst thing it could
 * say. A `notFound()` would need a second read of the same document to answer
 * a question the panel already answers honestly.
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
          <Heading level={1}>Sticker sheet</Heading>
          <Text color="muted">
            Every trace attempt on this sheet, newest first. Pick one to open
            its overlay, retry it with different settings, or accept it as the
            sheet&apos;s result.
          </Text>
          <StickerTracerWorkbench initialSheetId={sheetId} />
        </Stack>
      </Container>
    </Section>
  );
}
