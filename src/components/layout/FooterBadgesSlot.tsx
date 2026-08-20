import { Row, Stack, Text } from "@mohasinac/appkit/ui";
import {
  PAYMENT_ICONS,
  VisaIcon,
  MastercardIcon,
  CashIcon,
  RazorpayIcon,
  VercelIcon,
  NextJsIcon,
  FirebaseIcon,
} from "@/constants";
import { BrandBadgeImage } from "./BrandBadgeImage";

const ICON_CLS = "h-5 w-5 opacity-80 dark:invert";
const TECH_ICON_CLS = "h-4 w-4 opacity-70 dark:invert";

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
          <RazorpayIcon className={TECH_ICON_CLS} />
          <NextJsIcon className={TECH_ICON_CLS} />
          <FirebaseIcon className={TECH_ICON_CLS} />
          <VercelIcon className={TECH_ICON_CLS} />
        </Row>
      </Stack>
    </Stack>
  );
}
