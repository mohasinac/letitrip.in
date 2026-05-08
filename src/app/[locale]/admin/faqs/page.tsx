import { AdminFaqsView } from "@mohasinac/appkit";

export default function Page() {
  return (
    <AdminFaqsView
      actionHref="/admin/faqs/new"
      getRowHref={(row) => `/admin/faqs/${row.id}/edit`}
    />
  );
}
