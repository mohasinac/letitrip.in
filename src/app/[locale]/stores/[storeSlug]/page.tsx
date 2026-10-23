import { redirect } from "@/i18n/navigation";
import { getStoreForDetail, getSiteSettingsSafe, getDefaultStoreTabPath } from "@mohasinac/appkit/server";

type Props = {
  params: Promise<{ locale: string; storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { storeSlug } = await params;
  const [store, settings] = await Promise.all([
    getStoreForDetail(storeSlug),
    getSiteSettingsSafe(),
  ]);
  /*
   * A store that has written an introduction lands on it; one that has not
   * keeps the old behaviour of landing on its richest listing tab. Without the
   * gate every stocked storefront opened as a filtered product grid, which
   * reads as a search result rather than a shop.
   *
   * `storeDescription` is the field the About tab renders, so it is the
   * honest test for "there is something to land on" — trimmed, because an
   * all-whitespace description is not content.
   */
  const hasAboutContent = Boolean(store?.storeDescription?.trim());
  const path = await getDefaultStoreTabPath(storeSlug, store?.id, settings, hasAboutContent);
  /*
   * UNPREFIXED — `redirect` is the next-intl wrapper, which applies the locale
   * itself (none, under `localePrefix: "never"`). Prefixing here as well made
   * every storefront 307 twice before rendering.
   */
  redirect(path);
}
