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
import { useMessage } from "@/hooks";
import {
  AddressForm,
  Badge,
  Button,
  Card,
  ConfirmDeleteModal,
  EmptyState,
  Heading,
  ListingLayout,
  Row,
  SideDrawer,
  Spinner,
  Text,
} from "@/components";
import { THEME_CONSTANTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import type { StoreAddressDocument } from "@/db/schema";
import type { AddressFormData } from "@/hooks";
import {
  useStoreAddresses,
  useCreateStoreAddress,
  useUpdateStoreAddress,
  useDeleteStoreAddress,
} from "../hooks";

const { spacing, flex } = THEME_CONSTANTS;

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
      <ListingLayout
        headerSlot={
          <div>
            <Heading level={3}>{t("title")}</Heading>
            {total > 0 && (
              <Text variant="secondary" className="mt-1">
                {t("subtitleWithCount", { count: total })}
              </Text>
            )}
          </div>
        }
        actionsSlot={
          <Button variant="primary" onClick={() => setDrawerOpen(true)}>
            {t("add")}
          </Button>
        }
      >
        {error ? (
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
              <Card
                key={addr.id}
                variant="interactive"
                className={spacing.cardPadding}
              >
                <div className={spacing.stack}>
                  <div className={`${flex.betweenStart} gap-3`}>
                    <div>
                      <Heading level={4}>{addr.label}</Heading>
                      {addr.isDefault && (
                        <Badge variant="info" className="mt-1">
                          {t("defaultBadge")}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => setEditingAddress(addr)}
                        className="text-sm"
                      >
                        {tActions("edit")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => setDeleteId(addr.id)}
                        className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        {tActions("delete")}
                      </Button>
                    </div>
                  </div>

                  <div className={spacing.stackSmall}>
                    <Text size="sm" weight="medium">
                      {addr.fullName}
                    </Text>
                    <Text size="sm" variant="secondary">
                      {addr.phone}
                    </Text>
                    <Text size="sm" variant="secondary">
                      {addr.addressLine1}
                    </Text>
                    {addr.addressLine2 && (
                      <Text size="sm" variant="secondary">
                        {addr.addressLine2}
                      </Text>
                    )}
                    <Text size="sm" variant="secondary">
                      {addr.city}, {addr.state} {addr.postalCode}
                    </Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ListingLayout>

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
          submitLabel={tActions("save")}
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
            submitLabel={tActions("save")}
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
