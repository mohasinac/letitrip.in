import React from "react";
import type { UserAddress } from "../types";

interface AddressCardProps {
  address: UserAddress;
  onEdit?: (address: UserAddress) => void;
  onDelete?: (id: string) => void;
  labels?: { edit?: string; delete?: string; defaultBadge?: string };
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  labels = {},
}: AddressCardProps) {
  return (
    <div className="relative rounded-xl border border-neutral-200 bg-white p-4">
      {address.isDefault && (
        <span className="absolute right-3 top-3 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
          {labels.defaultBadge ?? "Default"}
        </span>
      )}
      {address.label && (
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {address.label}
        </p>
      )}
      <p className="text-sm text-neutral-900">{address.line1}</p>
      {address.line2 && (
        <p className="text-sm text-neutral-900">{address.line2}</p>
      )}
      <p className="text-sm text-neutral-900">
        {address.city}, {address.state} {address.postalCode}
      </p>
      <p className="text-sm text-neutral-900">{address.country}</p>
      {address.phone && (
        <p className="mt-1 text-sm text-neutral-500">{address.phone}</p>
      )}
      <div className="mt-3 flex gap-3">
        {onEdit && (
          <button
            onClick={() => onEdit(address)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {labels.edit ?? "Edit"}
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(address.id)}
            className="text-xs font-medium text-red-500 hover:underline"
          >
            {labels.delete ?? "Delete"}
          </button>
        )}
      </div>
    </div>
  );
}

interface AddressBookProps {
  addresses: UserAddress[];
  onEdit?: (address: UserAddress) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  emptyLabel?: string;
  addLabel?: string;
}

export function AddressBook({
  addresses,
  onEdit,
  onDelete,
  onAdd,
  emptyLabel = "No saved addresses",
  addLabel = "Add Address",
}: AddressBookProps) {
  return (
    <div className="space-y-4">
      {addresses.length === 0 && (
        <p className="text-sm text-neutral-500">{emptyLabel}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((addr) => (
          <AddressCard
            key={addr.id}
            address={addr}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          className="mt-2 rounded-lg border border-dashed border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-700"
        >
          + {addLabel}
        </button>
      )}
    </div>
  );
}
