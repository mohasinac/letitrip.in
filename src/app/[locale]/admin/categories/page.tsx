import { AdminCategoriesView } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit/client";

export default function Page() {
  return (
    <AdminCategoriesView
      getRowHref={(row) => String(ROUTES.ADMIN.CATEGORIES_EDIT(row.id))}
    />
  );
}
