import { AdminBlogView } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit/client";

export default function Page() {
  return (
    <AdminBlogView
      actionHref={String(ROUTES.ADMIN.BLOG_NEW)}
      getRowHref={(row) => String(ROUTES.ADMIN.BLOG_EDIT(row.id))}
    />
  );
}
