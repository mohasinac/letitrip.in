import {
  SellerShippingView,
  SellerShippingConfigsView,
  PageTabs,
  SHIPPING_TABS,
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender. It also hosts tabs,
 * and `useTabParam` reaches `useSearchParams()`, which throws during prerender
 * without a boundary (Root Cause #17). Carried over from the concurrent
 * build-fix work rather than dropped with the rest of that file's version.
 */
export const dynamic = "force-dynamic";


/** Shipping defaults, plus the named presets built on top of them. */
export default function Page() {
  return (
    <PageTabs
      tabs={SHIPPING_TABS}
      panels={{
        rates: <SellerShippingView apiBase={API_ROUTES.STORE.SHIPPING} />,
        configs: <SellerShippingConfigsView />,
      }}
    />
  );
}
