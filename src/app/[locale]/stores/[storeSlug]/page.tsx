import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@/constants";
import { resolveLocale } from "@/i18n/resolve-locale";

interface Props {
  params: Promise<{ locale: string; storeSlug: string }>;
}

/** Redirect root store URL → products sub-page */
export default async function StoreIndexPage({ params }: Props) {
  const { locale: rawLocale, storeSlug } = await params;
  const locale = resolveLocale(rawLocale);
  redirect({ href: ROUTES.PUBLIC.STORE_PRODUCTS(storeSlug), locale });
}
