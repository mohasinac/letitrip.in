"use client";

import { useRouter } from "@/i18n/navigation";
import { AddressForm, useAddress, useUpdateAddress, useToast, ROUTES, Div } from "@mohasinac/appkit/client";
import { Heading, Text } from "@mohasinac/appkit";

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
      <Div className="max-w-lg space-y-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <Div key={i} className="h-10 bg-zinc-200 dark:bg-slate-700 rounded-lg" />
        ))}
      </Div>
    );
  }

  if (!address) {
    return (
      <Text className="text-sm text-zinc-500 dark:text-zinc-400">Address not found.</Text>
    );
  }

  return (
    <Div className="max-w-lg space-y-4">
      <Heading level={1} className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Edit Address</Heading>
      <AddressForm
        initialData={address}
        onSubmit={async (data) => { await update.mutateAsync(data); }}
        onCancel={() => router.push(String(ROUTES.USER.ADDRESSES))}
        isLoading={update.isPending}
        submitLabel="Update Address"
        defaultCountry="India"
      />
    </Div>
  );
}
