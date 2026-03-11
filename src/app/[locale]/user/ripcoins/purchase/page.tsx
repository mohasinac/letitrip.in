/**
 * User RipCoins Purchase Page
 *
 * Route: /user/ripcoins/purchase
 * Thin shell — auth-gated by UserLayout, logic lives in RipCoinsPurchaseView.
 */
import { RipCoinsPurchaseView } from "@/features/user";

export default function UserRipCoinsPurchasePage() {
  return <RipCoinsPurchaseView />;
}
