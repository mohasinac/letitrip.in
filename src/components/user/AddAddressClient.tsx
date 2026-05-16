"use client";

import { useRouter } from "next/navigation";
import { AddressForm, useCreateAddress, useToast, ROUTES, Div } from "@mohasinac/appkit/client";
import { Heading } from "@mohasinac/appkit";

export function AddAddressClient() {
  const router = useRouter();
  const { showToast } = useToast();

  const create = useCreateAddress({
    onSuccess: () => {
      showToast("Address saved successfully!", "success");
      router.push(String(ROUTES.USER.ADDRESSES));
    },
    onError: (err) => {
      showToast(err.message ?? "Failed to save address.", "error");
    },
  });

  return (
    <Div className="max-w-lg space-y-4">
      <Heading level={1} className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Add New Address</Heading>
      <AddressForm
        onSubmit={async (data) => { await create.mutateAsync(data); }}
        onCancel={() => router.push(String(ROUTES.USER.ADDRESSES))}
        isLoading={create.isPending}
        submitLabel="Save Address"
        defaultCountry="India"
      />
    </Div>
  );
}
