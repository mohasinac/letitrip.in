import { AdminProductsView } from "@mohasinac/appkit";

export default function Page() {
  return (
    <AdminProductsView
      actionHref="/admin/products/new"
      getRowHref={(row) => `/admin/products/${row.id}/edit`}
    />
  );
}
