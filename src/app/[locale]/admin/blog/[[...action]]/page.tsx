import { AdminBlogView } from "@mohasinac/appkit";

export default function Page() {
  return (
    <AdminBlogView
      actionHref="/admin/blog/new"
      getRowHref={(row) => `/admin/blog/${row.id}/edit`}
    />
  );
}
