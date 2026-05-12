"use client";
/* eslint-disable lir/no-raw-html-elements, lir/no-raw-media-elements -- LR1-22: legacy raw HTML — migration tracked in crud-tracker.md Tier LR (row LR1-22) */

import { useRouter } from "next/navigation";
import { AddressForm, useAddress, useUpdateAddress, useToast, ROUTES } from "@mohasinac/appkit/client";

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
      <div className="max-w-lg space-y-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 bg-zinc-200 dark:bg-slate-700 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!address) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Address not found.</p>
    );
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Edit Address</h1>
      <AddressForm
        initialData={address}
        onSubmit={async (data) => { await update.mutateAsync(data); }}
        onCancel={() => router.push(String(ROUTES.USER.ADDRESSES))}
        isLoading={update.isPending}
        submitLabel="Update Address"
        defaultCountry="India"
      />
    </div>
  );
}
