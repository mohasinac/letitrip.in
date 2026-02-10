"use client";

import { Card, Badge, Button } from "@/components";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";

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
  const { spacing, themed } = THEME_CONSTANTS;

  return (
    <Card
      variant="interactive"
      className={`${spacing.cardPadding} ${className}`}
    >
      <div className={spacing.stack}>
        {/* Header: Label + Default Badge */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{address.label}</h3>
            {address.isDefault && (
              <Badge variant="info" className="mt-1">
                Default
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
              {UI_LABELS.ACTIONS.EDIT}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              {UI_LABELS.ACTIONS.DELETE}
            </Button>
          </div>
        </div>

        {/* Address Details */}
        <div
          className={`${themed.textSecondary} text-sm ${spacing.stackSmall}`}
        >
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {address.fullName}
          </p>
          <p>{address.phone}</p>
          <p>{address.addressLine1}</p>
          {address.addressLine2 && <p>{address.addressLine2}</p>}
          <p>
            {address.city}, {address.state} {address.postalCode}
          </p>
          <p>{address.country}</p>
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
              Set as Default
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
