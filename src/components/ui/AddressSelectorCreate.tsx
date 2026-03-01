"use client";

/**
 * AddressSelectorCreate Component
 * Path: src/components/ui/AddressSelectorCreate.tsx
 *
 * Address selector with an inline "Add new address" trigger.
 * Fetches the user's saved addresses and populates a dropdown.
 * Opens a SideDrawer with AddressForm when the user wants to add a new
 * address on-the-fly — without leaving the form they are filling in.
 *
 * Used by: ProductForm (pickup address), CheckoutPage (shipping address)
 *
 * @example
 * ```tsx
 * <AddressSelectorCreate
 *   label="Pickup Address"
 *   value={product.pickupAddressId ?? ""}
 *   onChange={(id) => update({ pickupAddressId: id })}
 * />
 * ```
 */

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAddressSelector, useMessage } from "@/hooks";
import { SideDrawer, Button, AddressForm, Label } from "@/components";
import type { AddressFormData } from "@/hooks";
import {
  UI_PLACEHOLDERS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  THEME_CONSTANTS,
} from "@/constants";

const { input } = THEME_CONSTANTS;

interface SavedAddress {
  id: string;
  label: string;
  city: string;
  fullName?: string;
  state?: string;
}

export interface AddressSelectorCreateProps {
  /** Currently selected address ID */
  value: string;
  /** Called with the ID of the selected or newly-created address */
  onChange: (id: string) => void;
  disabled?: boolean;
  label?: string;
}

export function AddressSelectorCreate({
  value,
  onChange,
  disabled = false,
  label,
}: AddressSelectorCreateProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { showSuccess, showError } = useMessage();
  const tForm = useTranslations("form");
  const tActions = useTranslations("actions");

  const {
    addresses,
    isLoading,
    createAddress: mutate,
    isSaving,
  } = useAddressSelector({
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

  /** Format an address option label for the dropdown */
  const formatLabel = (addr: SavedAddress) => {
    const parts = [addr.label, addr.fullName, addr.city, addr.state].filter(
      Boolean,
    );
    return parts.join(" — ");
  };

  return (
    <>
      <div>
        {label && <Label className="mb-1">{label}</Label>}
        <div className="flex gap-2 items-center">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || isLoading}
            className={`flex-1 ${input.base}`}
            aria-label={label ?? tForm("pickupAddress")}
          >
            <option value="">{UI_PLACEHOLDERS.SELECT_ADDRESS}</option>
            {addresses.map((addr) => (
              <option key={addr.id} value={addr.id}>
                {formatLabel(addr)}
              </option>
            ))}
          </select>

          {!disabled && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
            >
              + {tActions("addAddress")}
            </Button>
          )}
        </div>
      </div>

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={tActions("addAddress")}
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
