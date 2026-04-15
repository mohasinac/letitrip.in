"use client";

/**
 * StoreAddressesSection
 *
 * Manages store pickup addresses within the seller store settings.
 * Shows a list of existing addresses with edit/delete, and an "Add" button
 * that opens a SideDrawer with AddressForm.
 */

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Heading,
  Text,
  Badge,
  Button,
  Spinner,
  Grid,
  Row,
} from "@mohasinac/appkit/ui";
import { Alert } from "@mohasinac/appkit/ui";
import { Card, SideDrawer, AddressForm } from "@/components";
import { useMessage } from "@/hooks";
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

export function StoreAddressesSection() {
  const t = useTranslations("storeAddresses");
  const tActions = useTranslations("actions");
  const { showSuccess, showError } = useMessage();

  const { data: addresses, isLoading } = useStoreAddresses();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAddress, setEditingAddress] =
    useState<StoreAddressDocument | null>(null);

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

  const { mutate: deleteAddress } = useDeleteStoreAddress({
    onSuccess: () => showSuccess(SUCCESS_MESSAGES.ADDRESS.DELETED),
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

  const handleEdit = useCallback((addr: StoreAddressDocument) => {
    setEditingAddress(addr);
  }, []);

  const handleDelete = useCallback(
    (addressId: string) => {
      deleteAddress(addressId);
    },
    [deleteAddress],
  );

  return (
    <>
      <Card>
        <div className={spacing.stack}>
          <div className={`${flex.between} gap-4`}>
            <div>
              <Heading level={3}>{t("title")}</Heading>
              <Text variant="secondary" size="sm" className="mt-0.5">
                {t("subtitle")}
              </Text>
            </div>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setDrawerOpen(true)}
            >
              + {t("addAddress")}
            </Button>
          </div>

          {isLoading && (
            <div className={`${flex.center} py-8`}>
              <Spinner size="md" />
            </div>
          )}

          {!isLoading && (!addresses || addresses.length === 0) && (
            <Alert variant="info">{t("emptyState")}</Alert>
          )}

          {addresses && addresses.length > 0 && (
            <Grid gap="md" className="grid-cols-1 md:grid-cols-2">
              {addresses.map((addr) => (
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
                      <Row gap="sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => handleEdit(addr)}
                          className="text-sm"
                        >
                          {tActions("edit")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => handleDelete(addr.id)}
                          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          {tActions("delete")}
                        </Button>
                      </Row>
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
            </Grid>
          )}
        </div>
      </Card>

      {/* Create drawer */}
      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={t("addAddress")}
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
        title={t("editAddress")}
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
    </>
  );
}

