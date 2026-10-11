import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";

// W8 C2 — folded into /store/payouts as a tab. See the note in payout-methods.
export default function Page() {
  redirect(`${String(ROUTES.STORE.PAYOUTS)}?tab=settings`);
}
