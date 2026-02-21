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
import { useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { SideDrawer, Button, AddressForm } from "@/components";
import type { AddressFormData } from "@/hooks";
import {
  API_ENDPOINTS,
  UI_LABELS,
  UI_PLACEHOLDERS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  THEME_CONSTANTS,
} from "@/constants";

const { typography, input } = THEME_CONSTANTS;

interface SavedAddress {
  id: string;
  label: string;
  city: string;
  fullName?: string;
  state?: string;
}

interface AddressesApiResponse {
  success?: boolean;
  data?: SavedAddress[];
  items?: SavedAddress[];
}

interface CreateAddressApiResponse {
  success: boolean;
  data?: SavedAddress;
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

  const {
    data: raw,
    isLoading,
    refetch,
  } = useApiQuery<AddressesApiResponse>({
    queryKey: ["user-addresses"],
    queryFn: () => apiClient.get(API_ENDPOINTS.ADDRESSES.LIST),
  });

  const addresses: SavedAddress[] = raw?.data ?? raw?.items ?? [];

  const { mutate, isLoading: isSaving } = useApiMutation<
    CreateAddressApiResponse,
    AddressFormData
  >({
    mutationFn: (data) => apiClient.post(API_ENDPOINTS.ADDRESSES.CREATE, data),
    onSuccess: (res) => {
      showSuccess(SUCCESS_MESSAGES.ADDRESS.CREATED);
      setDrawerOpen(false);
      refetch();
      if (res.data?.id) onChange(res.data.id);
    },
    onError: () => showError(ERROR_MESSAGES.ADDRESS.CREATE_FAILED),
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
        {label && (
          <label className={`block ${typography.label} mb-1`}>{label}</label>
        )}
        <div className="flex gap-2 items-center">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || isLoading}
            className={`flex-1 ${input.base}`}
            aria-label={label ?? UI_LABELS.FORM.PICKUP_ADDRESS}
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
              + {UI_LABELS.ACTIONS.ADD_ADDRESS}
            </Button>
          )}
        </div>
      </div>

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={UI_LABELS.ACTIONS.ADD_ADDRESS}
        mode="create"
      >
        <AddressForm
          onSubmit={handleAddressSubmit}
          onCancel={() => setDrawerOpen(false)}
          isLoading={isSaving}
          submitLabel={UI_LABELS.ACTIONS.SAVE}
        />
      </SideDrawer>
    </>
  );
}
