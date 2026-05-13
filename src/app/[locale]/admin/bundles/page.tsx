import { AdminBundlesView } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit/client";

export default function Page() {
  return (
    <AdminBundlesView
      getEditHref={(row) => String(ROUTES.ADMIN.BUNDLES_EDIT(row.id))}
      newHref={String(ROUTES.ADMIN.BUNDLES_NEW)}
    />
  );
}
