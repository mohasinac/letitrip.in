"use client";

import { Container, Heading, Section, Stack, Text } from "@mohasinac/appkit/client";
import { RegisterBoxForm } from "@mohasinac/appkit/features/inventory/components/AdminStorageBoxesView";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit";

/**
 * Register a physical box.
 *
 * A PAGE rather than a drawer on the listing, for a reason worth keeping:
 * `DataListingView` resolves its row affordances `onRowClick` → `renderEditor`
 * → `rowHrefTemplate`, so a config carrying both a create drawer and a row
 * href gets the drawer on every row — the pencil would open a create form,
 * ignoring the id, presented as an edit of that box.
 *
 * It is also the moment the CODE is chosen, and the code is immutable
 * afterwards because the document id derives from it. That is not one-field
 * drawer work.
 */
export default function Page() {
  const router = useRouter();
  return (
    <Section>
      <Container size="md">
        <Stack gap="comfortable">
          <Heading level={1}>Register a storage box</Heading>
          <Text color="muted">
            Use exactly the code written on the physical label. The code cannot
            be changed later — relabelling a box means registering the new code
            and moving its contents, which the ledger records.
          </Text>
          <RegisterBoxForm
            onCreated={() => router.push(String(ROUTES.ADMIN.INVENTORY_BOXES))}
          />
        </Stack>
      </Container>
    </Section>
  );
}
