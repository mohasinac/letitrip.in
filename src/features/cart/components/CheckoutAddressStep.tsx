"use client";

import { useTranslations } from "next-intl";
import type { AddressDocument } from "@/db/schema";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { Heading, Text, Span, TextLink, Badge, Button } from "@/components";

const { themed, flex } = THEME_CONSTANTS;

interface CheckoutAddressStepProps {
  addresses: AddressDocument[];
  selectedAddressId: string | null;
  onSelect: (addressId: string) => void;
  /** Display name of the signed-in user for third-party detection. */
  currentUserDisplayName?: string | null;
  /** Called when the selected address belongs to someone else — triggers consent OTP flow. */
  onConsentRequired?: (addressId: string, recipientName: string) => void;
  /** Set of address IDs for which consent has already been verified this session. */
  consentVerifiedAddressIds?: Set<string>;
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
  currentUserDisplayName,
  onConsentRequired,
  consentVerifiedAddressIds,
}: CheckoutAddressStepProps) {
  const t = useTranslations("checkout");

  const handleSelect = (addr: AddressDocument) => {
    onSelect(addr.id);

    // If the address belongs to a third party and consent isn't yet verified,
    // bubble up to the parent so it can open the ConsentOtpModal.
    if (
      onConsentRequired &&
      isThirdParty(addr, currentUserDisplayName) &&
      !consentVerifiedAddressIds?.has(addr.id)
    ) {
      onConsentRequired(addr.id, addr.fullName);
    }
  };

  return (
    <div>
      <Heading level={2} className="text-lg mb-4">
        {t("selectAddress")}
      </Heading>

      {addresses.length === 0 ? (
        <div
          className={`p-6 rounded-xl border ${themed.bgSecondary} ${themed.border} text-center`}
        >
          <Text variant="secondary" className="mb-4">
            {t("noAddresses")}
          </Text>
          <TextLink
            href={ROUTES.USER.ADDRESSES_ADD}
            variant="inherit"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {t("addNewAddress")}
          </TextLink>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const isSelected = addr.id === selectedAddressId;
            const consentVerified = consentVerifiedAddressIds?.has(addr.id);

            return (
              <div key={addr.id} className="space-y-2">
                <Button
                  onClick={() => handleSelect(addr)}
                  variant="ghost"
                  className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                      : `${themed.border} ${themed.bgPrimary} hover:border-indigo-300`
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
                    {/* Radio indicator */}
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-full border-2 ${flex.center} flex-shrink-0 ${
                        isSelected ? "border-indigo-500" : themed.border
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      )}
                    </div>
                  </div>
                </Button>

                {/* Third-party consent banner — visible only when this address is selected */}
                {isSelected && isThirdParty(addr, currentUserDisplayName) && (
                  <div
                    className={`px-4 py-3 rounded-xl border ${
                      consentVerified
                        ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30"
                        : "border-amber-300 bg-amber-50 dark:bg-amber-950/30"
                    } flex items-center justify-between gap-3`}
                  >
                    <Text size="sm">
                      {consentVerified
                        ? t("thirdPartyVerified", {
                            recipientName: addr.fullName,
                          })
                        : t("thirdPartyDesc", { recipientName: addr.fullName })}
                    </Text>
                    {!consentVerified && onConsentRequired && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onConsentRequired(addr.id, addr.fullName)
                        }
                        className="shrink-0 text-amber-700 border-amber-400 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-600"
                      >
                        {t("thirdPartyVerifyBtn")}
                      </Button>
                    )}
                    {consentVerified && (
                      <span className="shrink-0 text-emerald-600 dark:text-emerald-400">
                        ✓
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add new address link */}
          <TextLink
            href={ROUTES.USER.ADDRESSES_ADD}
            variant="inherit"
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
            {t("addNewAddress")}
          </TextLink>
        </div>
      )}
    </div>
  );
}
