"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AddressBook,
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
  useToast,
  ROUTES,
} from "@mohasinac/appkit/client";

export function UserAddressesClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: addresses = [], isLoading } = useAddresses();

  const deleteAddress = useDeleteAddress({
    onSuccess: () => {
      showToast("Address deleted.", "success");
      setDeletingId(null);
    },
    onError: (err) => {
      showToast(err.message ?? "Failed to delete address.", "error");
      setDeletingId(null);
    },
  });

  const setDefault = useSetDefaultAddress({
    onSuccess: () => showToast("Default address updated.", "success"),
    onError: (err) => showToast(err.message ?? "Failed to update default address.", "error"),
  });

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteAddress.mutate({ id });
  };

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 dark:border-slate-700 animate-pulse p-4 space-y-2">
            <div className="h-4 bg-zinc-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-3 bg-zinc-200 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-3 bg-zinc-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">My Addresses</h1>
        <Link
          href={String(ROUTES.USER.ADDRESSES_ADD)}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
        >
          + Add Address
        </Link>
      </div>
      <AddressBook
        addresses={addresses as any[]}
        onEdit={(address) => router.push(String(ROUTES.USER.ADDRESSES_EDIT(address.id)))}
        onDelete={handleDelete}
        onAdd={() => router.push(String(ROUTES.USER.ADDRESSES_ADD))}
        emptyLabel="You have no saved addresses yet."
        addLabel="Add New Address"
      />
    </div>
  );
}
