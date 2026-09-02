"use client";

import { Suspense } from "react";

import { Container, Heading, ROUTES, Section, Stack, GroupedListingEditorView } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";



/**
 * Create a grouped listing for THIS seller's store.
 *
 * ## What the hand-rolled form this replaced could not do
 *
 * It collected 5 of the entity's 8 fields and hardcoded `productIds: []`, so a
 * group could only ever be created empty and then populated from somewhere
 * else. `minActiveMembers` — the threshold that decides whether the group
 * shows at all — and `coverImage` had no input on any seller surface, so both
 * were permanently stuck at their defaults.
 *
 * Its only validation was `title.trim()` non-empty, reported as a toast.
 *
 * `storeId` is deliberately NOT sent. The route derives it from the session,
 * which is what stops a seller filing a group under another store.
 */
function StoreGroupedListingNewPageInner() {
  const router = useRouter();

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>New Grouped Listing</Heading>
          <GroupedListingEditorView
            scope="store"
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
export default function StoreGroupedListingNewPage() {
  return (
    <Suspense>
      <StoreGroupedListingNewPageInner />
    </Suspense>
  );
}
