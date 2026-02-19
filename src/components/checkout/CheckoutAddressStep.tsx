"use client";

import Link from "next/link";
import type { AddressDocument } from "@/db/schema";
import { UI_LABELS, ROUTES, THEME_CONSTANTS } from "@/constants";

const { themed, borderRadius } = THEME_CONSTANTS;

interface CheckoutAddressStepProps {
  addresses: AddressDocument[];
  selectedAddressId: string | null;
  onSelect: (addressId: string) => void;
}

export function CheckoutAddressStep({
  addresses,
  selectedAddressId,
  onSelect,
}: CheckoutAddressStepProps) {
  return (
    <div>
      <h2 className={`text-lg font-semibold mb-4 ${themed.textPrimary}`}>
        {UI_LABELS.CHECKOUT.SELECT_ADDRESS}
      </h2>

      {addresses.length === 0 ? (
        <div
          className={`p-6 rounded-xl border ${themed.bgSecondary} ${themed.border} text-center`}
        >
          <p className={`mb-4 ${themed.textSecondary}`}>
            {UI_LABELS.CHECKOUT.NO_ADDRESSES}
          </p>
          <Link
            href={ROUTES.USER.ADDRESSES_ADD}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {UI_LABELS.CHECKOUT.ADD_ADDRESS}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const isSelected = addr.id === selectedAddressId;
            return (
              <button
                key={addr.id}
                onClick={() => onSelect(addr.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                    : `${themed.border} ${themed.bgPrimary} hover:border-indigo-300`
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`font-semibold text-sm ${themed.textPrimary}`}
                      >
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-xs px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${themed.textPrimary}`}>
                      {addr.fullName}
                    </p>
                    <p className={`text-sm ${themed.textSecondary}`}>
                      {addr.addressLine1}
                      {addr.addressLine2 && `, ${addr.addressLine2}`}
                      {addr.landmark && ` (${addr.landmark})`}
                    </p>
                    <p className={`text-sm ${themed.textSecondary}`}>
                      {addr.city}, {addr.state} — {addr.postalCode}
                    </p>
                    <p className={`text-sm ${themed.textSecondary}`}>
                      {addr.phone}
                    </p>
                  </div>
                  {/* Radio indicator */}
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "border-indigo-500" : themed.border
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Add new address link */}
          <Link
            href={ROUTES.USER.ADDRESSES_ADD}
            className={`flex items-center gap-2 w-full p-4 rounded-xl border-2 border-dashed ${themed.border} ${themed.textSecondary} hover:border-indigo-400 hover:text-indigo-600 transition-colors text-sm font-medium`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {UI_LABELS.CHECKOUT.ADD_ADDRESS}
          </Link>
        </div>
      )}
    </div>
  );
}
