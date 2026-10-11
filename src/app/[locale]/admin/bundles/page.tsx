import { AdminBundlesView } from "@mohasinac/appkit/features/admin/components/AdminBundlesView";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";

export const metadata = { title: "Bundles — Admin" };

export default function Page() {
  return (
    <AdminBundlesView
      editHrefTemplate={String(ROUTES.ADMIN.BUNDLES_EDIT("{id}"))}
      newHref={String(ROUTES.ADMIN.BUNDLES_NEW)}
    />
  );
}
