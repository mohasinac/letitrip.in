"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { Heading, Stack, Text } from "@mohasinac/appkit";
import {
  AddressBook,
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
  useToast,
  ROUTES,
  Div,
  Row,
  Input,
  Button,
} from "@mohasinac/appkit/client";

const __P = {
  p4: "p-4",
} as const;

export function UserAddressesClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const [_deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [labelFilter, setLabelFilter] = useState<string>("");

  const { data: rawAddresses = [], isLoading } = useAddresses();

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

  const labels = useMemo(() => {
    const set = new Set<string>();
    for (const a of (rawAddresses as any[]) ?? []) if (a?.label) set.add(a.label);
    return Array.from(set).sort();
  }, [rawAddresses]);

  const addresses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ((rawAddresses as any[]) ?? []).filter((a) => {
      if (labelFilter && a?.label !== labelFilter) return false;
      if (!q) return true;
      return [a?.fullName, a?.addressLine1, a?.city, a?.state, a?.postalCode]
        .filter(Boolean)
        .some((v: string) => v.toLowerCase().includes(q));
    });
  }, [rawAddresses, search, labelFilter]);

  if (isLoading) {
    return (
      <Div className="grid sm:grid-cols-2 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Div key={i} className={`animate-pulse ${__P.p4} space-y-2`} rounded="xl" border="default">
            <Div className="h-4 w-1/3" surface="subtle" rounded="default" />
            <Div className="h-3 w-3/4" surface="subtle" rounded="default" />
            <Div className="h-3 w-1/2" surface="subtle" rounded="default" />
          </Div>
        ))}
      </Div>
    );
  }

  return (
    <Stack gap="lg">
      <Row align="center" justify="between">
        <Heading level={1} size="xl" weight="bold" color="primary">My Addresses</Heading>
        <Link
          href={String(ROUTES.USER.ADDRESSES_ADD)}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
        >
          + Add Address
        </Link>
      </Row>

      <Row gap="md" align="end" wrap>
        <Div className="flex-1 min-w-[200px]">
          <Input
            id="address-search"
            label="Search"
            placeholder="Name, street, city, state, pincode…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Div>
        {labels.length > 0 && (
          <Div className="min-w-[160px]">
            <Text className="text-[var(--appkit-color-text-muted)] mb-1" size="xs" weight="medium">Label</Text>
            {/* eslint-disable-next-line lir/no-raw-html-elements -- inline filter; small surface */}
            <select
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value)}
              className="w-full rounded-md border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-3 py-2 text-sm text-[var(--appkit-color-text)]"
              aria-label="Filter by label"
            >
              <option value="">All labels</option>
              {labels.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </Div>
        )}
      </Row>

      {confirmDeleteId && (
        <Div className={`border border-error/20 bg-error-surface ${__P.p4} space-y-3`} rounded="xl">
          <Text className="text-error" size="sm" weight="medium">
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
    </Stack>
  );
}
