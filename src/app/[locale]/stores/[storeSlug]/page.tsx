import { redirect } from "@/i18n/navigation";
import { getStoreForDetail, getSiteSettingsSafe, getDefaultStoreTabPath } from "@mohasinac/appkit/server";

type Props = {
  params: Promise<{ locale: string; storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { locale, storeSlug } = await params;
  const [store, settings] = await Promise.all([
    getStoreForDetail(storeSlug),
    getSiteSettingsSafe(),
  ]);
  const path = await getDefaultStoreTabPath(storeSlug, store?.id, settings);
  redirect(`/${locale}${path}`);
}
