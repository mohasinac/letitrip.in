import { Row, Stack, Text } from "@mohasinac/appkit/ui";
import {
  PAYMENT_ICONS,
  SHIPPING_CARRIERS,
  VisaIcon,
  MastercardIcon,
  CashIcon,
  EmiIcon,
  NetBankingIcon,
  RazorpayIcon,
  VercelIcon,
  NextJsIcon,
  FirebaseIcon,
} from "@/constants";
import { BrandBadgeImage } from "./BrandBadgeImage";

/*
 * 🛑 NO `dark:invert` HERE. IT CANCELLED THE THEME AND HID EVERY BADGE.
 *
 * Every icon in these two rows is an inline SVG with `fill="currentColor"`
 * (see @/constants/brand-icons) — so its colour ALREADY inverts with the theme.
 * Measured on production before this fix:
 *
 *   light:  filter none,      currentColor rgb(24,24,27)    on footer rgb(250,250,250)  ✓ visible
 *   dark:   filter invert(1), currentColor rgb(250,250,250) on footer rgb(2,6,23)       ✗ invisible
 *
 * i.e. the token flipped the ink to near-white for dark mode and `dark:invert`
 * flipped it straight back to near-black, on a near-black footer. Both the
 * "We Accept" and "Powered By" rows rendered as empty space with faint outlines.
 *
 * `dark:invert` is the right treatment for a FIXED-COLOUR asset — a raster logo
 * that cannot follow currentColor — and the wrong one for a currentColor SVG,
 * where it exactly cancels the theme. This file's own sibling makes that split
 * explicit: multi-colour marks like UPI go through <BrandBadgeImage>, and those
 * are the ones an invert would be for. The single-path marks below are
 * currentColor by design and must be left alone.
 *
 * 🛑 …and for a MULTI-COLOUR mark it is wrong in a third way: inverting
 * Shiprocket's `#18F040` green yields magenta. Those get `plate` instead —
 * see BrandBadgeImage.
 *
 * ── Every badge here is a CLAIM, so each was measured ────────────────────
 *
 * Read off `siteSettings/global` on 2026-10-21, not inferred from the seed
 * (the seed defaults `razorpayEnabled: false`, and production is `true`):
 *
 *   razorpayEnabled   true    → cards, net banking and EMI are reachable
 *   upiManualEnabled  true    → UPI
 *   codEnabled        true    → cash on delivery
 *   emi.enabled       true    → min order ₹10,000, tenures 2–6 months
 *   phonepeEnabled    FALSE   → PhonePe was in "Powered By" and is now removed
 *   shipping.provider manual  → see the carrier row's own note
 *
 * 🛑 PhonePe's removal is the point of that list. It had been advertised in
 * the footer while switched off in production — the badge cost nothing to
 * leave in place and told every visitor something untrue. Re-add it only
 * alongside `phonepeEnabled: true`, and note that `providers.config.ts`
 * registers exactly ONE gateway: with both flags on, Razorpay wins and
 * PhonePe is silently ignored, so "both are on" is not a reason either.
 */
const ICON_CLS = "h-5 w-5 opacity-80";
const TECH_ICON_CLS = "h-4 w-4 opacity-70";

export function FooterBadgesSlot() {
  return (
    <Stack gap="sm" className="w-full">
      <Stack gap="xs">
        <Text size="xs" weight="medium" color="muted">
          We Accept
        </Text>
        <Row gap="sm" align="center" wrap>
          <VisaIcon className={ICON_CLS} />
          <MastercardIcon className={ICON_CLS} />
          {/*
            RuPay and UPI are multi-colour marks — image, not currentColor.
            Different box widths because `objectFit="contain"` letterboxes:
            the RuPay artwork is 300×232 (~1.3:1) and the UPI one 99×35mm
            (~2.8:1), so one `w-12` for both would render RuPay at about half
            its box and leave a visible gap in the row.
          */}
          <BrandBadgeImage src={PAYMENT_ICONS.rupay} alt="RuPay" className="h-5 w-7" />
          <BrandBadgeImage src={PAYMENT_ICONS.upi} alt="UPI" className="h-5 w-12" />
          <NetBankingIcon className={ICON_CLS} />
          <EmiIcon className={ICON_CLS} />
          <CashIcon className={ICON_CLS} />
        </Row>
      </Stack>

      {/*
        Carriers, derived from SHIPPING_CARRIERS so this row and
        `getCarrierIcon` (which matches a seller's free-text carrier name on an
        order) can never list different sets.

        🛑 This row is about who CARRIES the parcel, which is a different
        question from `siteSettings.shipping.provider` — that selects who BOOKS
        the label, and is `manual` today, meaning the seller books it and types
        the tracking number in. The handoff still goes to these carriers, so
        the badges are true under either setting. Do not re-caption this row
        as an integration claim: Shiprocket's shipment-creation, AWB, label and
        cancel paths are explicitly UNVERIFIED (see providers.config.ts), and
        only auth and rate quoting have been exercised against the live API.
      */}
      <Stack gap="xs">
        <Text size="xs" weight="medium" color="muted">
          We Ship With
        </Text>
        <Row gap="sm" align="center" wrap>
          {SHIPPING_CARRIERS.map((carrier) => (
            <BrandBadgeImage
              key={carrier.icon}
              src={carrier.icon}
              alt={carrier.label}
              plate
              className="h-7 w-20"
            />
          ))}
        </Row>
      </Stack>

      <Stack gap="xs">
        <Text size="xs" weight="medium" color="muted">
          Powered By
        </Text>
        <Row gap="sm" align="center" wrap>
          {/* The gateway belongs here, not in "We Accept" — a buyer accepts a
              card, not a processor. It had an icon and no call site. */}
          <RazorpayIcon className={TECH_ICON_CLS} />
          <NextJsIcon className={TECH_ICON_CLS} />
          <FirebaseIcon className={TECH_ICON_CLS} />
          <VercelIcon className={TECH_ICON_CLS} />
        </Row>
      </Stack>
    </Stack>
  );
}
