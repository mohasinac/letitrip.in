import React, { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { AdminSublistingCategoriesView, ROUTES, Heading, Div } from "@mohasinac/appkit/client";

export const metadata = { title: "Sub-listing Categories — Admin" };

export default function Page() {
  return (
    <>
      <Div className="flex items-center justify-between px-4 pt-4 pb-2">
        <Heading level={1} className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Sub-listing Categories
        </Heading>
        <Link
          href={String(ROUTES.ADMIN.SUBLISTING_CATEGORIES_NEW)}
          className="rounded-lg bg-[var(--appkit-color-primary)] px-3.5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          + New Category
        </Link>
      </Div>
      <Suspense>
        <AdminSublistingCategoriesView />
      </Suspense>
    </>
  );
}
