import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

export const revalidate = 300;

export default async function Page() {
  const locale = await getLocale();
  // Redirect to base categories listing until CategoriesIndexPageView supports segment sort/page
  redirect(`/${locale}/categories`);
}
