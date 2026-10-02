import { Row, Stack, Text } from "@mohasinac/appkit/ui";
import {
  PAYMENT_ICONS,
  VisaIcon,
  MastercardIcon,
  CashIcon,
  PhonePeIcon,
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
          <BrandBadgeImage src={PAYMENT_ICONS.upi} alt="UPI" className="h-5 w-12" />
          <CashIcon className={ICON_CLS} />
        </Row>
      </Stack>
      <Stack gap="xs">
        <Text size="xs" weight="medium" color="muted">
          Powered By
        </Text>
        <Row gap="sm" align="center" wrap>
          <PhonePeIcon className={TECH_ICON_CLS} />
          <NextJsIcon className={TECH_ICON_CLS} />
          <FirebaseIcon className={TECH_ICON_CLS} />
          <VercelIcon className={TECH_ICON_CLS} />
        </Row>
      </Stack>
    </Stack>
  );
}
