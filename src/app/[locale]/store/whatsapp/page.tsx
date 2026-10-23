import { SellerWhatsAppSettingsView } from "@mohasinac/appkit/features/whatsapp-bot/components/SellerWhatsAppSettingsView";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { siteSettingsRepository } from "@mohasinac/appkit/features/admin/repository/site-settings.repository";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { safeRead } from "@mohasinac/appkit/errors/safe-read";
import { toggleWhatsAppSubscriptionAction } from "@/actions/whatsapp.actions";

/**
 * /store/whatsapp — the seller's WhatsApp order-updates subscription.
 *
 * 🛑 Everything the view needs is read HERE, server-side, and passed as props.
 * The monthly fee and the channel's enabled flag live in `siteSettings`, in the
 * same document as the platform's Meta access token — so a client hook reading
 * them would be a second reader of a document that must not reach a browser
 * (Root Cause #70). The view is deliberately presentational.
 *
 * Not a revival of the page removed in 910e68a4e: that one collected a WABA
 * id, a catalogue id and a System User access token per seller. This collects
 * nothing.
 */
export default async function Page() {
  const user = await getServerSessionUser();

  /*
   * safeRead, because this page sits under a session-reading layout and Next
   * still ATTEMPTS to prerender it — an unguarded throw during that attempt is
   * fatal to the build even though the HTML is discarded.
   */
  const store = await safeRead(
    () => (user?.uid ? storeRepository.findByOwnerId(user.uid) : Promise.resolve(null)),
    { route: "/store/whatsapp", key: "store", fallback: null },
  );
  const settings = await safeRead(() => siteSettingsRepository.findById("global"), {
    route: "/store/whatsapp",
    key: "site-settings",
    fallback: null,
  });

  const commissions = settings?.commissions as
    | { whatsappNotifyMonthlyFee?: number }
    | undefined;
  const channels = settings?.notificationChannels as
    | { whatsapp?: { enabled?: boolean } }
    | undefined;

  return (
    <SellerWhatsAppSettingsView
      subscribed={store?.whatsappNotifySubscribed === true}
      monthlyFee={commissions?.whatsappNotifyMonthlyFee ?? 199}
      channelEnabled={channels?.whatsapp?.enabled === true}
      onToggleSubscription={toggleWhatsAppSubscriptionAction}
    />
  );
}
