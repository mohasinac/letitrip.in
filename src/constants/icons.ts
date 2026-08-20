/**
 * Static brand icon paths — public/icons/{social,payment,tech,shipping}/.
 *
 * Single source of truth for every downloaded/authored brand icon file path
 * so no component hardcodes a raw "/icons/..." string. Payment/tech icons
 * are official brand marks (Simple Icons / Wikimedia / vendor sites); "cash"
 * has no brand and is hand-authored.
 */

export const PAYMENT_ICONS = {
  visa: "/icons/payment/visa.svg",
  mastercard: "/icons/payment/mastercard.svg",
  upi: "/icons/payment/upi.svg",
  cash: "/icons/payment/cash.svg",
} as const;

export const TECH_ICONS = {
  razorpay: "/icons/tech/razorpay.svg",
  vercel: "/icons/tech/vercel.svg",
  nextjs: "/icons/tech/nextjs.svg",
  firebase: "/icons/tech/firebase.svg",
} as const;

export const SOCIAL_ICONS = {
  whatsapp: "/icons/social/whatsapp.svg",
  github: "/icons/social/github.svg",
} as const;

interface CarrierIconEntry {
  match: string;
  icon: string;
  label: string;
}

/** Ordered by match specificity — "india post" before a bare substring collision isn't a concern here, but keep longer tokens first. */
const SHIPPING_CARRIER_ICONS: CarrierIconEntry[] = [
  { match: "shiprocket", icon: "/icons/shipping/shiprocket.svg", label: "Shiprocket" },
  { match: "delhivery", icon: "/icons/shipping/delhivery.svg", label: "Delhivery" },
  { match: "dtdc", icon: "/icons/shipping/dtdc.png", label: "DTDC" },
  { match: "india post", icon: "/icons/shipping/india-post.svg", label: "India Post" },
  { match: "indiapost", icon: "/icons/shipping/india-post.svg", label: "India Post" },
  { match: "ekart", icon: "/icons/shipping/ekart.svg", label: "Ekart" },
];

/** Case-insensitive substring match against a free-text carrier name (carrier has no fixed enum — see CLAUDE.md). Returns null when no known carrier matches. */
export function getCarrierIcon(carrierName?: string | null): { icon: string; label: string } | null {
  if (!carrierName) return null;
  const lower = carrierName.toLowerCase();
  const found = SHIPPING_CARRIER_ICONS.find((c) => lower.includes(c.match));
  return found ? { icon: found.icon, label: found.label } : null;
}
