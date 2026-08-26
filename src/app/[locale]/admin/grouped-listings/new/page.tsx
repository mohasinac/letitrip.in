"use client";

import { Container, Heading, ROUTES, Section, Stack, GroupedListingEditorView } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";

/**
 * Create a grouped listing on behalf of any store.
 *
 * Admin had a list, a detail GET, a PATCH and a DELETE — and no create path at
 * all, so `/admin/grouped-listings` had no create affordance and one had to be
 * made from the seller's own dashboard.
 *
 * The editor asks for the owning store explicitly. That is not symmetry with
 * the seller form — the seller route derives `storeId` from the session on
 * purpose, and an admin has no session store to derive it from.
 *
 * Imports from `@mohasinac/appkit/client`, never the bare package: the bare
 * specifier resolves to the SERVER entry and pulls firebase-admin into the
 * client bundle (the Turbopack trap, Root Cause #6).
 */
export default function AdminGroupedListingNewPage() {
  const router = useRouter();

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>New Grouped Listing</Heading>
          <GroupedListingEditorView
            scope="admin"
            onSaved={() => router.push(String(ROUTES.ADMIN.GROUPED_LISTINGS))}
            onCancel={() => router.push(String(ROUTES.ADMIN.GROUPED_LISTINGS))}
          />
        </Stack>
      </Container>
    </Section>
  );
}
