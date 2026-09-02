"use client";

import {use, Suspense } from "react";
import { Container, Heading, ROUTES, Section, Stack, GroupedListingEditorView } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";



/**
 * Edit this seller's grouped listing.
 *
 * Replaces a hand-rolled form that validated nothing at all and, like its
 * `new` sibling, had no input for `productIds`, `minActiveMembers` or
 * `coverImage` — so the members of a group could not be changed from the page
 * whose whole job is editing the group.
 *
 * Now the same component the admin pages use, so a field added to
 * `groupedListingFormSchema` appears on all four surfaces at once instead of
 * needing four edits that can each be forgotten separately.
 */
function StoreGroupedListingEditPageInner({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>Edit Grouped Listing</Heading>
          <GroupedListingEditorView
            scope="store"
            groupId={id}
            onSaved={() => router.push(String(ROUTES.STORE.GROUPED_LISTINGS))}
            onCancel={() => router.push(String(ROUTES.STORE.GROUPED_LISTINGS))}
          />
        </Stack>
      </Container>
    </Section>
  );
}

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). This boundary
 * is the fix. (This comment used to add that the dashboard layout's own
 * <Suspense> was "empirically not enough" — that was wrong; the layout's
 * boundary was being defeated by a swallowed prerender bailout, not ignored.
 * See Root Cause #89. A segment config is never the answer here, and
 * `audit-no-force-dynamic` blocks it.)
 */
export default function StoreGroupedListingEditPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <StoreGroupedListingEditPageInner {...props} />
    </Suspense>
  );
}
