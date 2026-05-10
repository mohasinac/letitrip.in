import { AdminCouponsView } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit/client";

export default function Page() {
  return (
    <AdminCouponsView
      actionHref={String(ROUTES.ADMIN.COUPONS_NEW)}
      getRowHref={(row) => String(ROUTES.ADMIN.COUPONS_EDIT(row.id))}
    />
  );
}
