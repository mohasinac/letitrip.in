"use client";

/**
 * SellerAddressesView
 *
 * Full-page store pickup/business address management using ListingLayout shell.
 * Uses store address hooks (subcollection under stores) — NOT user addresses.
 * Create/edit via inline SideDrawer.
 */

import { useState, useCallback } from "react";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMessage } from "@mohasinac/appkit/react";
import {
  Heading,
  Row,
  Text,
  Spinner,
  Button,
  ListingLayout,
} from "@mohasinac/appkit/ui";
import { SellerAddressesView as AppkitSellerAddressesView } from "@mohasinac/appkit/features/seller";
import {
  AddressCard,
  AddressForm,
  ConfirmDeleteModal,
  EmptyState,
  SideDrawer,
} from "@/components";
import { THEME_CONSTANTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import type { StoreAddressDocument } from "@/db/schema";
import type { AddressFormData, AddressCardAddress } from "@mohasinac/appkit/features/account";
import {
  useStoreAddresses,
  useCreateStoreAddress,
  useUpdateStoreAddress,
  useDeleteStoreAddress,
} from "../hooks";

const { spacing } = THEME_CONSTANTS;

export function SellerAddressesView() {
  const t = useTranslations("sellerAddresses");
  const tActions = useTranslations("actions");
  const tLoading = useTranslations("loading");
  const { showSuccess, showError } = useMessage();

  const { data: addresses, isLoading, error } = useStoreAddresses();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAddress, setEditingAddress] =
    useState<StoreAddressDocument | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { mutate: createAddress, isPending: isCreating } =
    useCreateStoreAddress({
      onSuccess: () => {
        showSuccess(SUCCESS_MESSAGES.ADDRESS.CREATED);
        setDrawerOpen(false);
      },
      onError: () => showError(ERROR_MESSAGES.ADDRESS.CREATE_FAILED),
    });

  const { mutate: updateAddress, isPending: isUpdating } =
    useUpdateStoreAddress({
      onSuccess: () => {
        showSuccess(SUCCESS_MESSAGES.ADDRESS.UPDATED);
        setEditingAddress(null);
      },
      onError: () => showError(ERROR_MESSAGES.ADDRESS.UPDATE_FAILED),
    });

  const { mutate: deleteAddress, isPending: isDeleting } =
    useDeleteStoreAddress({
      onSuccess: () => {
        showSuccess(SUCCESS_MESSAGES.ADDRESS.DELETED);
        setDeleteId(null);
      },
      onError: () => showError(ERROR_MESSAGES.ADDRESS.DELETE_FAILED),
    });

  const handleCreate = useCallback(
    (data: AddressFormData) => {
      createAddress({ ...data, isDefault: data.isDefault ?? false });
    },
    [createAddress],
  );

  const handleUpdate = useCallback(
    (data: AddressFormData) => {
      if (!editingAddress) return;
      updateAddress({
        addressId: editingAddress.id,
        data: { ...data, isDefault: data.isDefault ?? false },
      });
    },
    [editingAddress, updateAddress],
  );

  const confirmDelete = useCallback(() => {
    if (deleteId) deleteAddress(deleteId);
  }, [deleteId, deleteAddress]);

  if (isLoading) {
    return (
      <Row justify="center" gap="none" className="min-h-screen">
        <Spinner size="lg" label={tLoading("default")} />
      </Row>
    );
  }

  const total = addresses?.length ?? 0;

  return (
    <>
      <AppkitSellerAddressesView
        labels={{ title: t("title") }}
        isLoading={isLoading}
        renderHeader={() => (
          <div className="flex items-center justify-between gap-4">
            <div>
              <Heading level={3}>{t("title")}</Heading>
              {total > 0 && (
                <Text variant="secondary" className="mt-1">
                  {t("subtitleWithCount", { count: total })}
                </Text>
              )}
            </div>
            <Button variant="primary" onClick={() => setDrawerOpen(true)}>
              {t("add")}
            </Button>
          </div>
        )}
        renderAddressList={() =>
          error ? (
            <EmptyState title={tLoading("failed")} description={t("empty")} />
          ) : total === 0 ? (
            <EmptyState
              icon={<MapPin className="w-16 h-16" />}
              title={t("empty")}
              description={t("emptySubtitle")}
              actionLabel={t("addFirst")}
              onAction={() => setDrawerOpen(true)}
            />
          ) : (
            <div className={THEME_CONSTANTS.grid.addressCards}>
              {addresses!.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr as unknown as AddressCardAddress}
                  onEdit={() => setEditingAddress(addr)}
                  onDelete={() => setDeleteId(addr.id)}
                />
              ))}
            </div>
          )
        }
      />

      {/* Create drawer */}
      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={t("add")}
        mode="create"
      >
        <AddressForm
          onSubmit={handleCreate}
          onCancel={() => setDrawerOpen(false)}
          isLoading={isCreating}
          labels={{ save: tActions("save")}}
        />
      </SideDrawer>

      {/* Edit drawer */}
      <SideDrawer
        isOpen={!!editingAddress}
        onClose={() => setEditingAddress(null)}
        title={t("editTitle")}
        mode="edit"
      >
        {editingAddress && (
          <AddressForm
            initialData={{
              label: editingAddress.label,
              fullName: editingAddress.fullName,
              phone: editingAddress.phone,
              addressLine1: editingAddress.addressLine1,
              addressLine2: editingAddress.addressLine2,
              city: editingAddress.city,
              state: editingAddress.state,
              postalCode: editingAddress.postalCode,
              country: editingAddress.country,
              isDefault: editingAddress.isDefault,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditingAddress(null)}
            isLoading={isUpdating}
            labels={{ save: tActions("save")}}
          />
        )}
      </SideDrawer>

      {/* Delete confirmation */}
      {deleteId && (
        <ConfirmDeleteModal
          isOpen={true}
          onClose={() => setDeleteId(null)}
          onConfirm={confirmDelete}
          title={t("deleteConfirmTitle")}
          message={t("deleteConfirmMessage")}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}

