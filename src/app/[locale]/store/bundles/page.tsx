import { SellerBundlesView } from "@mohasinac/appkit/client";
import { ROUTES } from "@mohasinac/appkit/client";

export const metadata = { title: "Bundles — Store" };

export default function Page() {
  return (
    <SellerBundlesView
      getEditHref={(row) => String(ROUTES.STORE.BUNDLES_EDIT(row.id))}
      newHref={String(ROUTES.STORE.BUNDLES_NEW)}
    />
  );
}
