import { AdminCouponsView } from "@mohasinac/appkit";

export default function Page() {
  return (
    <AdminCouponsView
      actionHref="/admin/coupons/new"
      getRowHref={(row) => `/admin/coupons/${row.id}/edit`}
    />
  );
}
