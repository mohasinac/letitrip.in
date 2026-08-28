"use client";

import { useRouter } from "@/i18n/navigation";
import { AddressForm, useCreateAddress, useToast, ROUTES } from "@mohasinac/appkit/client";
import { normalizeError } from "@mohasinac/appkit/client";
import { Heading, Stack } from "@mohasinac/appkit/client";
export function AddAddressClient() {
  const router = useRouter();
  const { showToast } = useToast();

  const create = useCreateAddress({
    onSuccess: () => {
      showToast("Address saved successfully!", "success");
      router.push(String(ROUTES.USER.ADDRESSES));
    },
    onError: (err) => {
      void normalizeError(err);
      // Authored copy only — the rejection's own message is developer text.
      showToast("Failed to save address.", "error");
    },
  });

  return (
    <Stack className="max-w-lg" gap="md">
      <Heading level={1} size="xl" weight="bold" color="primary">Add New Address</Heading>
      <AddressForm
        onSubmit={async (data) => { await create.mutateAsync(data); }}
        onCancel={() => router.push(String(ROUTES.USER.ADDRESSES))}
        isLoading={create.isPending}
        submitLabel="Save Address"
        defaultCountry="India"
      />
    </Stack>
  );
}
