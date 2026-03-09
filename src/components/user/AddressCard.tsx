"use client";

import { Card, Badge, Button, Heading, Text } from "@/components";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";

/**
 * AddressCard Component
 *
 * Display card for an address in list view.
 * Uses THEME_CONSTANTS.card.interactive from Phase 2.
 *
 * @example
 * ```tsx
 * <AddressCard
 *   address={address}
 *   onEdit={() => router.push(`/user/addresses/edit/${address.id}`)}
 *   onDelete={() => handleDelete(address.id)}
 *   onSetDefault={() => handleSetDefault(address.id)}
 * />
 * ```
 */

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
  const { spacing, themed, flex } = THEME_CONSTANTS;
  const tActions = useTranslations("actions");
  const tAddr = useTranslations("addresses");

  return (
    <Card
      variant="interactive"
      className={`${spacing.cardPadding} ${className}`}
    >
      <div className={spacing.stack}>
        {/* Header: Label + Default Badge */}
        <div className={`${flex.betweenStart} gap-3`}>
          <div>
            <Heading level={3}>{address.label}</Heading>
            {address.isDefault && (
              <Badge variant="info" className="mt-1">
                {tAddr("default")}
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-sm"
            >
              {tActions("edit")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              {tActions("delete")}
            </Button>
          </div>
        </div>

        {/* Address Details */}
        <div className={spacing.stackSmall}>
          <Text size="sm" weight="medium">
            {address.fullName}
          </Text>
          <Text size="sm" variant="secondary">
            {address.phone}
          </Text>
          <Text size="sm" variant="secondary">
            {address.addressLine1}
          </Text>
          {address.addressLine2 && (
            <Text size="sm" variant="secondary">
              {address.addressLine2}
            </Text>
          )}
          <Text size="sm" variant="secondary">
            {address.city}, {address.state} {address.postalCode}
          </Text>
          <Text size="sm" variant="secondary">
            {address.country}
          </Text>
        </div>

        {/* Set Default Button */}
        {!address.isDefault && onSetDefault && (
          <div className={`pt-3 border-t ${themed.border}`}>
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
    </Card>
  );
}
