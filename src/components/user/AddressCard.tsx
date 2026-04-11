"use client";

import { Button } from "@mohasinac/appkit/ui";
import {
  AddressCard as AppkitAddressCard,
  type UserAddress as AppkitUserAddress,
} from "@mohasinac/appkit/features/account";

import { useTranslations } from "next-intl";

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault?: () => void;
  className?: string;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  className = "",
}: AddressCardProps) {
  const tActions = useTranslations("actions");
  const tAddr = useTranslations("addresses");

  const mappedAddress: AppkitUserAddress = {
    id: address.id,
    label: address.label,
    line1: address.addressLine1,
    line2: address.addressLine2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
    phone: address.phone,
  };

  return (
    <div className={className}>
      <AppkitAddressCard
        address={mappedAddress}
        onEdit={() => onEdit()}
        onDelete={() => onDelete()}
        labels={{
          edit: tActions("edit"),
          delete: tActions("delete"),
          defaultBadge: tAddr("default"),
        }}
      />
      {!address.isDefault && onSetDefault && (
        <div className="pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onSetDefault}
            className="w-full"
          >
            {tAddr("setDefault")}
          </Button>
        </div>
      )}
    </div>
  );
}
