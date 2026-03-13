import { getTranslations } from "next-intl/server";
import { siteSettingsRepository } from "@/repositories";
import { THEME_CONSTANTS } from "@/constants";
import { Heading, Section, Text } from "@/components";
import { BeforeAfterCard } from "./BeforeAfterCard";

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
    <Section className="py-16 md:py-20 px-4">
      {/* ── Section header (editorial variant) ── */}
      <div className="mb-12 text-center">
        {/* Pill badge */}
        <span className={THEME_CONSTANTS.sectionHeader.pill}>
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-primary-500"
            aria-hidden="true"
          />
          {t("realResultsPill")}
        </span>

        {/* Heading */}
        <Heading
          level={2}
          className="font-display mt-3 text-4xl text-zinc-900 dark:text-white"
        >
          {t("realResultsTitle")}
        </Heading>

        {/* ── ✦ ── ornament (LX-3) */}
        <div
          className="mt-3 flex items-center justify-center gap-2 text-zinc-400 dark:text-zinc-500"
          aria-hidden="true"
        >
          <span className="h-px w-6 bg-current" />
          <span className="text-xs">✦</span>
          <span className="h-px w-6 bg-current" />
        </div>

        {/* Subtitle */}
        <Text className="mx-auto mt-4 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          {t("realResultsSubtitle")}
        </Text>
      </div>

      {/* ── Card grid ── */}
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {results.map((item, i) => (
          <BeforeAfterCard
            key={`result-${i}`}
            beforeImage={item.beforeImage}
            afterImage={item.afterImage}
            caption={item.caption}
          />
        ))}
      </div>
    </Section>
  );
}
