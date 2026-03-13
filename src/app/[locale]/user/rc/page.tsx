/**
 * User RC Page
 *
 * Route: /user/rc
 * Thin shell — auth-gated by UserLayout, logic lives in RCWallet.
 */
import { RCWallet } from "@/features/user";

export default function UserRCPage() {
  return <RCWallet />;
}
