"use client";

import { useRouter } from "@/i18n/navigation";
import { AddressForm, useAddress, useUpdateAddress, useToast, ROUTES, Div } from "@mohasinac/appkit/client";
import { Heading, Stack, Text } from "@mohasinac/appkit/client";
interface Props {
  addressId: string;
}

export function EditAddressClient({ addressId }: Props) {
  const router = useRouter();
  const { showToast } = useToast();

  const { data: address, isLoading } = useAddress(addressId);

  const update = useUpdateAddress(addressId, {
    onSuccess: () => {
      showToast("Address updated successfully!", "success");
      router.push(String(ROUTES.USER.ADDRESSES));
    },
    onError: (err) => {
      showToast(err.message ?? "Failed to update address.", "error");
    },
  });

  if (isLoading) {
    return (
      <Stack className="max-w-lg animate-pulse" gap="md">
        {Array.from({ length: 6 }).map((_, i) => (
          <Div key={i} className="h-10" surface="subtle" rounded="lg" />
        ))}
      </Stack>
    );
  }

  if (!address) {
    return (
      <Text size="sm" color="muted">Address not found.</Text>
    );
  }

  return (
    <Stack className="max-w-lg" gap="md">
      <Heading level={1} size="xl" weight="bold" color="primary">Edit Address</Heading>
      <AddressForm
        initialData={address}
        onSubmit={async (data) => { await update.mutateAsync(data); }}
        onCancel={() => router.push(String(ROUTES.USER.ADDRESSES))}
        isLoading={update.isPending}
        submitLabel="Update Address"
        defaultCountry="India"
      />
    </Stack>
  );
}
