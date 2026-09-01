"use client";

import {use, Suspense } from "react";
import { Container, Heading, ROUTES, Section, Stack, GroupedListingEditorView } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";



/**
 * Edit any store's grouped listing.
 *
 * 🛑 This page could not have existed before the API was fixed. The admin
 * PATCH schema was `z.object({ productIds })`, and `z.object()` strips unknown
 * keys — so saving a title, theme or visibility flag returned **200 and wrote
 * nothing**. A page shipped against that would have looked like it worked, and
 * the only way to notice is a reload. See `audit-tester-checklist` case
 * `admin-grouped-listing-title-actually-saves`, which is written as exactly
 * that before/after.
 *
 * The editor loads the record from the single-item GET itself rather than
 * being handed a list row (Root Cause #38).
 */
function AdminGroupedListingEditPageInner({
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
            scope="admin"
            groupId={id}
            onSaved={() => router.push(String(ROUTES.ADMIN.GROUPED_LISTINGS))}
            onCancel={() => router.push(String(ROUTES.ADMIN.GROUPED_LISTINGS))}
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
 * throws during prerender without a boundary (Root Cause #17). The dashboard
 * layout wraps {children} in Suspense too, and empirically that is not enough
 * for a client PAGE component.
 */
export default function AdminGroupedListingEditPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <AdminGroupedListingEditPageInner {...props} />
    </Suspense>
  );
}
