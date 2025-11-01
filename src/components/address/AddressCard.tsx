"use client";

import React from "react";
import { Address } from "@/types/address";
import { MapPin, Phone, Edit, Trash2, Check } from "lucide-react";

interface AddressCardProps {
  address: Address;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  selectable = false,
  selected = false,
  onSelect,
}: AddressCardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all ${
        selected
          ? "border-blue-500 shadow-lg"
          : "border-gray-200 dark:border-gray-700"
      } ${selectable ? "cursor-pointer hover:border-blue-400" : ""}`}
      onClick={selectable ? onSelect : undefined}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full capitalize">
              {address.type}
            </span>
            {address.isDefault && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                Default
              </span>
            )}
          </div>

          {selectable && selected && (
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {address.fullName}
        </h3>

        {/* Address */}
        <div className="space-y-2 text-gray-600 dark:text-gray-400">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
            <p className="text-sm">
              {address.addressLine1}
              {address.addressLine2 && `, ${address.addressLine2}`}
              <br />
              {address.city}, {address.state} - {address.pincode}
              <br />
              {address.country}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{address.phone}</p>
          </div>
        </div>

        {/* Actions */}
        {!selectable && (onEdit || onDelete || onSetDefault) && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {!address.isDefault && onSetDefault && (
              <button
                onClick={onSetDefault}
                className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                Set as Default
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Edit address"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Delete address"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
