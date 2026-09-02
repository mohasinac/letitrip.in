import {
  SellerShippingView,
  SellerShippingConfigsView,
  PageTabs,
  SHIPPING_TABS,
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

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
