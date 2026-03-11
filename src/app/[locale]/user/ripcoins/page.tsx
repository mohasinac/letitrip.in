/**
 * User RipCoins Page
 *
 * Route: /user/ripcoins
 * Thin shell — auth-gated by UserLayout, logic lives in RipCoinsWallet.
 */
import { RipCoinsWallet } from "@/features/user";

export default function UserRipCoinsPage() {
  return <RipCoinsWallet />;
}
