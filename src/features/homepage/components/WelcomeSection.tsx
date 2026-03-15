"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useHomepageSections } from "@/hooks";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { Button, Heading, Section, Span, Text } from "@/components";
import type { WelcomeSectionConfig } from "@/db/schema";

// ─── Trust chip keys (order matters for display) ────────────────────────────
const TRUST_CHIP_KEYS = [
  "welcomeTrustDelivery",
  "welcomeTrustPayment",
  "welcomeTrustRating",
  "welcomeTrustReturns",
] as const;

const TRUST_CHIP_EMOJIS: Record<(typeof TRUST_CHIP_KEYS)[number], string> = {
  welcomeTrustDelivery: "🚀",
  welcomeTrustPayment: "🔒",
  welcomeTrustRating: "⭐",
  welcomeTrustReturns: "↩️",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function WelcomeSection() {
  const t = useTranslations("homepage");
  const router = useRouter();
  const { data, isLoading } = useHomepageSections("type=welcome&enabled=true");

  if (isLoading) {
    return (
      <Section className="relative overflow-hidden py-16 md:py-24 px-4">
        <div className="animate-pulse max-w-4xl mx-auto text-center">
          <div className="h-6 bg-zinc-200 dark:bg-slate-700 rounded-full w-52 mx-auto mb-6" />
          <div className="h-20 bg-zinc-200 dark:bg-slate-700 rounded-lg mb-4 max-w-2xl mx-auto" />
          <div className="h-6 bg-zinc-200 dark:bg-slate-700 rounded-lg mb-8 max-w-lg mx-auto" />
          <div className="flex justify-center gap-4">
            <div className="h-12 bg-zinc-200 dark:bg-slate-700 rounded-xl w-36" />
            <div className="h-12 bg-zinc-200 dark:bg-slate-700 rounded-xl w-36" />
          </div>
        </div>
      </Section>
    );
  }

  const config = data?.[0]?.config as WelcomeSectionConfig | undefined;
  const h1 = config?.h1 ?? t("heroTitle");
  const subtitle = config?.subtitle ?? t("heroSubtitle");
  const showCTA = config?.showCTA ?? true;
  const ctaText = config?.ctaText ?? t("shopNow");
  const ctaLink = config?.ctaLink ?? ROUTES.PUBLIC.PRODUCTS;

  return (
    <Section className="relative overflow-hidden py-16 md:py-24 px-4">
      {/* Decorative rings (LX-2 — Beyblade flavour) */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full border border-dashed border-primary/10 animate-spin [animation-duration:60s]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 w-[32rem] h-[32rem] rounded-full border border-dashed border-cobalt/10 animate-spin [animation-duration:80s] [animation-direction:reverse]"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-12 items-center">
          {/* Left: text content */}
          <div className="text-center lg:text-left">
            {/* Pill badge */}
            <div className="stagger-1">
              <Span className={THEME_CONSTANTS.sectionHeader.pill}>
                <Span
                  className="w-1.5 h-1.5 rounded-full bg-primary-500 inline-block"
                  aria-hidden="true"
                />
                {t("welcomePill")}
                <Span
                  className="w-1.5 h-1.5 rounded-full bg-primary-500 inline-block"
                  aria-hidden="true"
                />
              </Span>
            </div>

            {/* H1 */}
            <Heading
              level={1}
              variant="none"
              className="stagger-2 mt-4 font-display text-5xl md:text-7xl lg:text-8xl bg-gradient-to-r from-primary via-cobalt to-secondary dark:from-secondary dark:via-cobalt dark:to-primary bg-clip-text text-transparent leading-tight"
            >
              {h1}
            </Heading>

            {/* Subtitle */}
            <Text className="stagger-3 mt-4 text-xl text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed mx-auto lg:mx-0">
              {subtitle}
            </Text>

            {/* Dual CTA */}
            {showCTA && (
              <div className="stagger-4 mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push(ctaLink)}
                >
                  {ctaText}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push(ROUTES.PUBLIC.PRODUCTS)}
                >
                  {t("welcomeSecondaryCta")}
                </Button>
              </div>
            )}

            {/* Trust chips */}
            <div className="stagger-5 mt-6 flex flex-wrap gap-2 justify-center lg:justify-start">
              {TRUST_CHIP_KEYS.map((key) => (
                <Span
                  key={key}
                  className="bg-zinc-100 dark:bg-slate-800 rounded-full px-3 py-1 text-xs text-zinc-600 dark:text-zinc-400"
                >
                  {TRUST_CHIP_EMOJIS[key]} {t(key)}
                </Span>
              ))}
            </div>
          </div>

          {/* Right: gradient placeholder (desktop only) */}
          <div className="hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-primary/10 via-cobalt/10 to-secondary/10 border border-zinc-200 dark:border-slate-700">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cobalt/5" />
              <div
                className={`absolute inset-0 ${THEME_CONSTANTS.flex.center}`}
              >
                <Span className="font-display text-8xl text-primary/20 select-none">
                  LIR
                </Span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
