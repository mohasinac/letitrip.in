"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heading, Text } from "@mohasinac/appkit";
import {
  AddressBook,
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
  useToast,
  ROUTES,
  Div,
  Button,
} from "@mohasinac/appkit/client";

export function UserAddressesClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  const handleDeleteRequest = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleDeleteConfirm = () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    setConfirmDeleteId(null);
    deleteAddress.mutate({ id: confirmDeleteId });
  };

  if (isLoading) {
    return (
      <Div className="grid sm:grid-cols-2 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Div key={i} className="rounded-xl border border-zinc-200 dark:border-slate-700 animate-pulse p-4 space-y-2">
            <Div className="h-4 bg-zinc-200 dark:bg-slate-700 rounded w-1/3" />
            <Div className="h-3 bg-zinc-200 dark:bg-slate-700 rounded w-3/4" />
            <Div className="h-3 bg-zinc-200 dark:bg-slate-700 rounded w-1/2" />
          </Div>
        ))}
      </Div>
    );
  }

  return (
    <Div className="space-y-6">
      <Div className="flex items-center justify-between">
        <Heading level={1} className="text-xl font-bold text-zinc-900 dark:text-zinc-100">My Addresses</Heading>
        <Link
          href={String(ROUTES.USER.ADDRESSES_ADD)}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
        >
          + Add Address
        </Link>
      </Div>

      {confirmDeleteId && (
        <Div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 space-y-3">
          <Text className="text-sm font-medium text-red-800 dark:text-red-200">
            Delete this address? This cannot be undone.
          </Text>
          <Div className="flex gap-3">
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={deleteAddress.isPending}
              className="rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors"
            >
              {deleteAddress.isPending ? "Deleting…" : "Delete"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDeleteId(null)}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Cancel
            </Button>
          </Div>
        </Div>
      )}

      <AddressBook
        addresses={addresses as any[]}
        onEdit={(address) => router.push(String(ROUTES.USER.ADDRESSES_EDIT(address.id)))}
        onDelete={handleDeleteRequest}
        onSetDefault={(addressId) => setDefault.mutate({ addressId })}
        onAdd={() => router.push(String(ROUTES.USER.ADDRESSES_ADD))}
        emptyLabel="You have no saved addresses yet."
        addLabel="Add New Address"
      />
    </Div>
  );
}
