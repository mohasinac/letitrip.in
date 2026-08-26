"use client";

import { use } from "react";
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
export default function StoreGroupedListingEditPage({
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
