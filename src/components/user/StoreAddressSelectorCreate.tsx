"use client";

/**
 * StoreAddressSelectorCreate
 *
 * Address selector for store pickup addresses with an inline "Add new" trigger.
 * Fetches the seller's store addresses (not personal user addresses) and lets
 * the seller pick one or create a new store address on-the-fly.
 *
 * Used by: ProductForm (pickup address field)
 */

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useStoreAddressSelector, useMessage } from "@/hooks";
import { SideDrawer, Button, AddressForm, Label, Select } from "@/components";
import type { AddressFormData } from "@/hooks";
import { UI_PLACEHOLDERS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";

interface SavedAddress {
  id: string;
  label: string;
  city: string;
  fullName?: string;
  state?: string;
}

export interface StoreAddressSelectorCreateProps {
  /** Currently selected address ID */
  value: string;
  /** Called with the ID of the selected or newly-created address */
  onChange: (id: string) => void;
  disabled?: boolean;
  label?: string;
}

export function StoreAddressSelectorCreate({
  value,
  onChange,
  disabled = false,
  label,
}: StoreAddressSelectorCreateProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { showSuccess, showError } = useMessage();
  const tForm = useTranslations("form");
  const tActions = useTranslations("actions");
  const tStore = useTranslations("storeAddresses");

  const {
    addresses,
    isLoading,
    createAddress: mutate,
    isSaving,
  } = useStoreAddressSelector({
    onCreated: (id) => {
      showSuccess(SUCCESS_MESSAGES.ADDRESS.CREATED);
      setDrawerOpen(false);
      onChange(id);
    },
    onCreateError: () => showError(ERROR_MESSAGES.ADDRESS.CREATE_FAILED),
  });

  const handleAddressSubmit = useCallback(
    async (data: AddressFormData) => {
      await mutate(data);
    },
    [mutate],
  );

  const formatLabel = (addr: SavedAddress) => {
    const parts = [addr.label, addr.fullName, addr.city, addr.state].filter(
      Boolean,
    );
    return parts.join(" — ");
  };

  return (
    <>
      <div>
        {label && <Label className="mb-1.5">{label}</Label>}
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <Select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled || isLoading}
              aria-label={label ?? tForm("pickupAddress")}
              options={[
                { value: "", label: UI_PLACEHOLDERS.SELECT_ADDRESS },
                ...addresses.map((addr) => ({
                  value: addr.id,
                  label: formatLabel(addr),
                })),
              ]}
            />
          </div>

          {!disabled && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
            >
              + {tStore("addAddress")}
            </Button>
          )}
        </div>
      </div>

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={tStore("addAddress")}
        mode="create"
      >
        <AddressForm
          onSubmit={handleAddressSubmit}
          onCancel={() => setDrawerOpen(false)}
          isLoading={isSaving}
          submitLabel={tActions("save")}
        />
      </SideDrawer>
    </>
  );
}
