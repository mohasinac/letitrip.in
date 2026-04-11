"use client";

import { useTranslations } from "next-intl";
import type { AddressDocument } from "@/db/schema";
import { THEME_CONSTANTS } from "@/constants";
import { CheckoutAddressStep as AppkitCheckoutAddressStep } from "@mohasinac/appkit/features/cart";
import { Heading, Text, Button, Span, Badge } from "@mohasinac/appkit/ui";

const { themed, flex } = THEME_CONSTANTS;

interface CheckoutAddressStepProps {
  addresses: AddressDocument[];
  selectedAddressId: string | null;
  onSelect: (addressId: string) => void;
  /** Called when the user wants to add a new address inline. */
  onAddNew: () => void;
  /** Display name of the signed-in user for third-party detection. */
  currentUserDisplayName?: string | null;
}

/** Normalises a name for rough comparison (lowercase, trim, collapse spaces). */
function normaliseName(s: string | null | undefined): string {
  return (s ?? "").toLowerCase().trim().replace(/\s+/g, " ");
}

/** Returns true when the address recipient appears to differ from the signed-in user. */
function isThirdParty(
  addr: AddressDocument,
  currentName: string | null | undefined,
): boolean {
  if (!currentName) return false;
  return normaliseName(addr.fullName) !== normaliseName(currentName);
}

export function CheckoutAddressStep({
  addresses,
  selectedAddressId,
  onSelect,
  onAddNew,
  currentUserDisplayName,
}: CheckoutAddressStepProps) {
  const t = useTranslations("checkout");

  const handleSelect = (addr: AddressDocument) => {
    onSelect(addr.id);
  };

  return (
    <AppkitCheckoutAddressStep
      labels={{ title: t("selectAddress") }}
      addresses={addresses}
      selectedAddressId={selectedAddressId}
      getAddressId={(addr) => addr.id}
      onSelectAddress={(_, addr) => handleSelect(addr)}
      renderEmptyState={() => (
        <div
          className={`p-6 rounded-xl border ${themed.bgSecondary} ${themed.border} text-center`}
        >
          <Text variant="secondary" className="mb-4">
            {t("noAddresses")}
          </Text>
          <Button
            onClick={onAddNew}
            className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {t("addNewAddress")}
          </Button>
        </div>
      )}
      renderAddressCard={(addr, { isSelected, select }) => (
        <div className="space-y-2">
          <Button
            onClick={select}
            variant="ghost"
            className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
              isSelected
                ? "border-primary bg-primary/5 dark:bg-primary/10"
                : `${themed.border} ${themed.bgPrimary} hover:border-primary/30`
            }`}
          >
            <div className={`${flex.betweenStart} gap-3`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Span weight="semibold" size="sm">
                    {addr.label}
                  </Span>
                  {addr.isDefault && (
                    <Badge variant="info" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                <Text size="sm">{addr.fullName}</Text>
                <Text size="sm" variant="secondary">
                  {addr.addressLine1}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}
                  {addr.landmark && ` (${addr.landmark})`}
                </Text>
                <Text size="sm" variant="secondary">
                  {addr.city}, {addr.state} — {addr.postalCode}
                </Text>
                <Text size="sm" variant="secondary">
                  {addr.phone}
                </Text>
              </div>
              <div
                className={`mt-0.5 w-5 h-5 rounded-full border-2 ${flex.center} flex-shrink-0 ${
                  isSelected ? "border-primary" : themed.border
                }`}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
            </div>
          </Button>

          {isSelected && isThirdParty(addr, currentUserDisplayName) && (
            <div className="px-4 py-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30">
              <Text size="sm">
                {t("thirdPartyDesc", { recipientName: addr.fullName })}
              </Text>
            </div>
          )}
        </div>
      )}
      renderAddNew={() => (
        <Button
          onClick={onAddNew}
          variant="ghost"
          className={`mt-3 flex items-center gap-2 w-full p-4 rounded-xl border-2 border-dashed ${themed.border} ${themed.textSecondary} hover:border-primary hover:text-primary transition-colors text-sm font-medium`}
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
          {t("addNewAddress")}
        </Button>
      )}
    />
  );
}
