import { getTranslations } from "next-intl/server";
import { siteSettingsRepository } from "@/repositories";
import { FeaturedResultsSection as AppkitFeaturedResultsSection } from "@mohasinac/appkit/features/homepage";

/**
 * FeaturedResultsSection
 *
 * Server Component — fetches `siteSettings.featuredResults` at request time
 * and renders a grid of interactive before/after comparison cards.
 * Returns nothing when no results are configured.
 */
export async function FeaturedResultsSection() {
  const settings = await siteSettingsRepository
    .getSingleton()
    .catch(() => null);
  const results = settings?.featuredResults;

  if (!results?.length) return null;

  const t = await getTranslations("homepage");

  return (
    <AppkitFeaturedResultsSection
      title={t("realResultsTitle")}
      subtitle={t("realResultsSubtitle")}
      pillLabel={t("realResultsPill")}
      items={results.map((item, i) => ({
        id: `result-${i}`,
        beforeImage: item.beforeImage,
        afterImage: item.afterImage,
        caption: item.caption,
        sortOrder: i,
      }))}
    />
  );
}

