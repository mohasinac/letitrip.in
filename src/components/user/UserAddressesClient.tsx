"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { Heading, Stack, Text, Badge } from "@mohasinac/appkit/client";
import { AddressCard, useAddresses, useDeleteAddress, useSetDefaultAddress, useToast, ROUTES, Div, Grid, Row, Input, Button, FieldSelect, SideDrawer, Textarea, useApiMutation } from "@mohasinac/appkit/client";
import type { AddressCardAddress } from "@mohasinac/appkit/client";
import { requestAddressUnban } from "@/lib/api/user-client";

interface AddressWithBan extends AddressCardAddress {
  banStatus?: "banned" | "unban_requested" | "suspicious";
  unbanRequestNote?: string;
}

const __P = {
  p4: "p-[var(--appkit-space-4)]",
} as const;

export function UserAddressesClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const [_deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [labelFilter, setLabelFilter] = useState<string>("");
  const [unbanAddressId, setUnbanAddressId] = useState<string | null>(null);
  const [unbanNote, setUnbanNote] = useState("");

  const { data: rawAddresses = [], isLoading, refetch } = useAddresses();

  const deleteAddress = useDeleteAddress({
    onSuccess: () => {
      showToast("Address deleted.", "success");
      setDeletingId(null);
    },
    onError: (err) => {
      showToast((err as Error).message ?? "Failed to delete address.", "error");
      setDeletingId(null);
    },
  });

  const setDefault = useSetDefaultAddress({
    onSuccess: () => showToast("Default address updated.", "success"),
    onError: (err) => showToast((err as Error).message ?? "Failed to update default address.", "error"),
  });

  const requestUnban = useApiMutation<void, Error, { id: string; note: string }>({
    mutationFn: async ({ id, note }) => {
      const res = await requestAddressUnban(id, note);
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? "Failed to submit unban request.");
      }
    },
    successMessage: "Unban request submitted. Our team will review it shortly.",
    onSuccess: () => {
      setUnbanAddressId(null);
      setUnbanNote("");
      void refetch();
    },
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
    for (const a of (rawAddresses as unknown as AddressWithBan[]) ?? []) if (a?.label) set.add(a.label);
    return Array.from(set).sort();
  }, [rawAddresses]);

  const addresses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ((rawAddresses as unknown as AddressWithBan[]) ?? []).filter((a) => {
      if (labelFilter && a?.label !== labelFilter) return false;
      if (!q) return true;
      return [a?.fullName, a?.addressLine1, a?.city, a?.state, a?.postalCode]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q));
    });
  }, [rawAddresses, search, labelFilter]);

  if (isLoading) {
    return (
      <Grid cols="cardsWide" gap="md">
        {Array.from({ length: 3 }).map((_, i) => (
          <Stack key={i} className={`animate-pulse ${__P.p4}`} gap="sm" rounded="xl" border="default">
            <Div className="h-4 w-1/3" surface="subtle" rounded="default" />
            <Div className="h-3 w-3/4" surface="subtle" rounded="default" />
            <Div className="h-3 w-1/2" surface="subtle" rounded="default" />
          </Stack>
        ))}
      </Grid>
    );
  }

  return (
    <Stack gap="lg">
      <Row align="center" justify="between">
        <Heading level={1} size="xl" weight="bold" color="primary">My Addresses</Heading>
        <Link
          href={String(ROUTES.USER.ADDRESSES_NEW)}
          className="rounded-xl bg-primary px-[var(--appkit-space-4)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)] font-semibold text-white hover:bg-primary-600"
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
            <FieldSelect
              name="labelFilter"
              aria-label="Filter by label"
              value={labelFilter}
              onChange={setLabelFilter}
              options={[
                { value: "", label: "All labels" },
                ...labels.map((l) => ({ value: l, label: l })),
              ]}
            />
          </Div>
        )}
      </Row>

      {confirmDeleteId && (
        <Stack className={`border border-error/20 ${__P.p4}`} surface="danger-surface" gap="3" rounded="xl">
          <Text className="text-error" size="sm" weight="medium">
            Delete this address? This cannot be undone.
          </Text>
          <Row gap="3">
            <Button rounded="lg"
              type="button"
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={deleteAddress.isPending}
              paddingX="md" paddingY="sm" textSize="sm" weight="semibold"
              className="disabled:opacity-60 transition-colors"
            >
              {deleteAddress.isPending ? "Deleting…" : "Delete"}
            </Button>
            <Button rounded="lg"
              type="button"
              variant="outline"
              onClick={() => setConfirmDeleteId(null)}
              className="px-[var(--appkit-space-4)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)] font-medium transition-colors"
            >
              Cancel
            </Button>
          </Row>
        </Stack>
      )}

      {addresses.length === 0 && (
        <Text className="text-[var(--appkit-color-text-muted)]" size="sm">
          You have no saved addresses yet.
        </Text>
      )}

      <Grid cols="cardsWide" gap="md">
        {addresses.map((addr) => {
          const isBanned = addr.banStatus === "banned";
          const isUnbanPending = addr.banStatus === "unban_requested";
          const isBanRestricted = isBanned || isUnbanPending;
          return (
            <Stack key={addr.id} gap="xs">
              {isBanned && (
                <Row gap="xs" align="center">
                  <Badge variant="danger" size="sm">Address Banned</Badge>
                </Row>
              )}
              {isUnbanPending && (
                <Row gap="xs" align="center">
                  <Badge variant="warning" size="sm">Review Pending</Badge>
                </Row>
              )}
              <AddressCard
                address={addr as AddressCardAddress}
                onEdit={isBanRestricted ? undefined : (a) => router.push(String(ROUTES.USER.ADDRESSES_EDIT(a.id)))}
                onDelete={isBanRestricted ? undefined : handleDeleteRequest}
                onSetDefault={isBanRestricted ? undefined : (id) => setDefault.mutate({ addressId: id })}
              />
              {isBanned && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => { setUnbanAddressId(addr.id); setUnbanNote(""); }}
                  className="text-[length:var(--appkit-text-xs)]"
                >
                  Request Unban
                </Button>
              )}
            </Stack>
          );
        })}
      </Grid>

      <Button rounded="lg"
        onClick={() => router.push(String(ROUTES.USER.ADDRESSES_NEW))}
        variant="outline"
        paddingX="md" paddingY="md" textSize="sm" weight="medium"
        className="mt-2 border border-dashed border-neutral-300 dark:border-[var(--appkit-color-border)] text-[var(--appkit-color-text-muted)] dark:text-[var(--appkit-color-text-muted)] transition hover:border-neutral-400 dark:hover:border-[var(--appkit-color-border-subtle)] hover:text-neutral-700 dark:hover:text-[var(--appkit-color-text)]"
      >
        + Add Address
      </Button>

      <SideDrawer
        isOpen={!!unbanAddressId}
        onClose={() => { setUnbanAddressId(null); setUnbanNote(""); }}
        title="Request Address Unban"
        mode="edit"
        footer={
          /* Bare buttons — the SideDrawer footer slot supplies the ActionRow. */
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { setUnbanAddressId(null); setUnbanNote(""); }}
              disabled={requestUnban.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={requestUnban.isPending || !unbanNote.trim()}
              onClick={() => {
                if (!unbanAddressId || !unbanNote.trim()) return;
                requestUnban.mutate({ id: unbanAddressId, note: unbanNote });
              }}
            >
              {requestUnban.isPending ? "Submitting…" : "Submit Request"}
            </Button>
          </>
        }
      >
        <Stack gap="md">
          <Text size="sm" color="muted">
            Explain why this address should be unbanned. Our support team will review your request within 1–3 business days.
          </Text>
          <Textarea
            id="unban-note"
            label="Reason for unban request"
            value={unbanNote}
            onChange={(e) => setUnbanNote(e.target.value)}
            placeholder="e.g. This is my home address and I made an innocent mistake…"
            rows={5}
          />
        </Stack>
      </SideDrawer>
    </Stack>
  );
}
