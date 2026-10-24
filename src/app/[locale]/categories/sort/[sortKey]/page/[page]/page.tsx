import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit";

export const revalidate = 300;

export default async function Page() {
  /*
   * Redirect to the base categories listing until CategoriesIndexPageView
   * supports segment sort/page.
   *
   * UNPREFIXED — `redirect` is the next-intl wrapper from `@/i18n/navigation`,
   * which applies the locale itself, so interpolating `/${locale}` produced
   * `/en/categories` and a second 307 to strip it. `getLocale()` was only ever
   * read to build that prefix, so the import goes with it.
   */
  redirect(String(ROUTES.PUBLIC.CATEGORIES));
}
