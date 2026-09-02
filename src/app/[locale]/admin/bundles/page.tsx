import { AdminBundlesView } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit";

export const metadata = { title: "Bundles — Admin" };

export default function Page() {
  return (
    <AdminBundlesView
      editHrefTemplate={String(ROUTES.ADMIN.BUNDLES_EDIT("{id}"))}
      newHref={String(ROUTES.ADMIN.BUNDLES_NEW)}
    />
  );
}
