/**
 * The business's statutory identity, resolved once.
 *
 * 🛑 ONE owner, and it is `appkit.config.js` → `business`. This module only
 * reads it and derives convenience shapes; it must never introduce a second
 * literal. The same discipline `seo.siteUrl` is under (Root Cause #81) applies
 * here for the same reason — before this existed the legal name, address,
 * GSTIN and support channels lived in five places that already disagreed.
 *
 * Every field that can be undecided is `string | null`. `null` renders as a
 * visible `[to be confirmed]` marker via `<PendingValue>` and NEVER as an
 * empty gap: these appear on pages whose purpose is legal disclosure, so a
 * missing value has to be obvious rather than silently absent.
 */

import appkitConfig from "@/lib/appkit-config";
import type {
  AppkitBusinessConfig,
  AppkitBusinessAddress,
} from "@mohasinac/appkit";

/**
 * 🛑 Fails loudly rather than defaulting.
 *
 * A `?? {}` here would make every downstream read `undefined` and every page
 * render as though nothing had been configured — the quiet-degradation shape
 * this codebase keeps paying for. The block is committed, so its absence means
 * someone deleted it, and that is worth a crash at boot rather than a site
 * that silently stops disclosing its legal identity.
 */
function resolveBusiness(): AppkitBusinessConfig {
  const business = appkitConfig.business;
  if (!business) {
    throw new Error(
      "appkit.config.js is missing its `business` block — the single owner of " +
        "the legal entity's identity (legal name, GSTIN, registered address, " +
        "grievance officer). Statutory pages cannot render without it.",
    );
  }
  return business;
}

export const BUSINESS = resolveBusiness();

/** `null` when the address is unset — callers render a PendingValue. */
export const BUSINESS_ADDRESS: AppkitBusinessAddress | null =
  BUSINESS.registeredAddress ?? null;

/**
 * The registered address as one line, for a footer or an invoice header.
 *
 * Returns `null` rather than an empty string when unset, so a caller cannot
 * accidentally render a bare comma-joined fragment — `[].join(", ")` is `""`,
 * which looks like a deliberate blank rather than missing data.
 */
export function formatBusinessAddress(
  address: AppkitBusinessAddress | null = BUSINESS_ADDRESS,
): string | null {
  if (!address) return null;
  return [
    address.line1,
    address.line2,
    address.city,
    `${address.state} ${address.postalCode}`.trim(),
    address.country,
  ]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(", ");
}

/**
 * Multi-line form, for a contact page or a grievance block where the address
 * should read as a postal address rather than a sentence.
 */
export function businessAddressLines(
  address: AppkitBusinessAddress | null = BUSINESS_ADDRESS,
): string[] {
  if (!address) return [];
  return [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postalCode}`.trim(),
    address.country,
  ].filter((part): part is string => Boolean(part && part.trim()));
}

/**
 * A `wa.me` link for the business WhatsApp number, or `null`.
 *
 * Strips every non-digit: the stored value may be written "+91 89196 65811"
 * for display, and `wa.me` accepts digits only — a space or a `+` in the path
 * yields a link that opens WhatsApp to nothing in particular.
 */
export function businessWhatsAppLink(): string | null {
  const raw = BUSINESS.support?.whatsapp;
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

/**
 * Every statutory field that is still undecided, as human-readable labels.
 *
 * 🛑 This is the PhonePe-registration checklist. A reviewer who sees
 * `[to be confirmed]` on the Contact or Grievance page will reject the
 * application, so this list must be empty before submitting. Surfaced by
 * `npm run audit env-alignment` rather than left for someone to notice.
 */
export function pendingBusinessFields(): string[] {
  const pending: string[] = [];
  const check = (label: string, value: string | null | undefined) => {
    if (!value) pending.push(label);
  };

  check("GSTIN", BUSINESS.gstin);
  check("Udyam registration number", BUSINESS.udyamNumber);
  check("Support email", BUSINESS.support?.email);
  check("Support phone", BUSINESS.support?.phone);
  check("Support WhatsApp number", BUSINESS.support?.whatsapp);
  check("Support hours", BUSINESS.support?.hours);
  check("Grievance officer name", BUSINESS.grievance?.name);
  check("Grievance officer designation", BUSINESS.grievance?.designation);
  check("Grievance officer email", BUSINESS.grievance?.email);
  check("Grievance officer phone", BUSINESS.grievance?.phone);
  check("Order processing time", BUSINESS.policy?.processingTime);
  check("Delivery estimate", BUSINESS.policy?.deliveryEstimate);
  check("Shipping charges", BUSINESS.policy?.shippingCharges);
  check("Cancellation window", BUSINESS.policy?.cancellationWindow);
  check("Return window", BUSINESS.policy?.returnWindow);
  check("Refund timeline", BUSINESS.policy?.refundTimeline);
  check("Bank account name", BUSINESS.bank?.accountName);
  check("Bank branch name", BUSINESS.bank?.branchName);
  check("Bank account number", BUSINESS.bank?.accountNumber);
  check("Bank IFSC", BUSINESS.bank?.ifsc);
  check("UPI VPA", BUSINESS.bank?.upiVpa);

  return pending;
}
