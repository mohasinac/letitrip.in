import { Link } from "@/i18n/navigation";
import { AdminSublistingCategoriesView, Heading } from "@mohasinac/appkit/client";

import { ROUTES, Row } from "@mohasinac/appkit";
export const metadata = { title: "Sub-listing Categories — Admin" };

export default function Page() {
  return (
    <>
      <Row paddingY="t-md" paddingX="x-md" className="pb-[0.5rem]" align="center" justify="between">
        <Heading level={1} size="lg" weight="semibold" color="primary">
          Sub-listing Categories
        </Heading>
        <Link
          href={String(ROUTES.ADMIN.SUBLISTING_CATEGORIES_NEW)}
          className="rounded-lg bg-[var(--appkit-color-primary)] px-[var(--appkit-space-3-5)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)] font-medium text-white hover:opacity-90 transition-opacity"
        >
          + New Category
        </Link>
      </Row>
      <AdminSublistingCategoriesView />
    </>
  );
}
