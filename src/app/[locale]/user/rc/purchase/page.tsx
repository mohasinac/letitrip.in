/**
 * User RC Purchase Page
 *
 * Route: /user/rc/purchase
 * Thin shell — auth-gated by UserLayout, logic lives in RCPurchaseView.
 */
import { RCPurchaseView } from "@/features/user";

export default function UserRCPurchasePage() {
  return <RCPurchaseView />;
}
