"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import {
  Button,
  Heading,
  HorizontalScroller,
  MediaImage,
  Section,
  Span,
  Text,
  TextLink,
  type PerViewConfig,
} from "@/components";

// ─── Props ──────────────────────────────────────────────────────────────────

export interface SectionCarouselProps<T = unknown> {
  /** Section heading */
  title: string;

  /** Optional subtitle below the heading */
  description?: string;

  /**
   * Heading visual variant.
   * - `"default"` — standard themed text
   * - `"gradient"` — primary→cobalt gradient clip text
   * - `"editorial"` — pill + font-display H2 + ── ✦ ── ornament
   */
  headingVariant?: "default" | "gradient" | "editorial";

  /**
   * Pill label shown above the heading when `headingVariant="editorial"`.
   * Required for editorial variant; ignored otherwise.
   */
  pillLabel?: string;

  /**
   * URL of an image to use as the section background.
   * A dark semi-transparent overlay is applied so the text remains readable.
   */
  backgroundImage?: string;

  /** Route for the "View More" button. Omit to hide the button. */
  viewMoreHref?: string;

  /**
   * Label for the "View More" button.
   * Falls back to the `actions.viewAll` translation key when omitted.
   */
  viewMoreLabel?: string;

  /** Items to render in the carousel. */
  items: T[];

  /** Renders a single item. Receives (item, index). */
  renderItem: (item: T, index: number) => React.ReactNode;

  /** Responsive items-per-view breakpoint config. Default: { base: 1, sm: 2, md: 3 } */
  perView?: PerViewConfig;

  /** Gap between cards in px. Default: 16 */
  gap?: number;

  /** Enable circular auto-scroll. Default: false */
  autoScroll?: boolean;

  /** Interval between auto-scroll steps in ms. Default: 3500 */
  autoScrollInterval?: number;

  /** Key extractor for the HorizontalScroller. */
  keyExtractor?: (item: T, index: number) => string;

  /**
   * Number of rows (for 2-row grid mode).
   * Auto-scroll is disabled in grid mode.
   * Default: 1
   */
  rows?: number;

  /** Additional classes on the outer `<Section>`. */
  className?: string;

  /** Show a loading skeleton instead of items. */
  isLoading?: boolean;

  /** Number of skeleton cards to show. Default: 4 */
  skeletonCount?: number;

  /**
   * Whether the heading and description text should be light-coloured
   * (for use on dark backgrounds or background images).
   * Defaults to `true` when `backgroundImage` is provided, `false` otherwise.
   */
  lightText?: boolean;

  /**
   * When `true`, adds a negative right margin to the scroller wrapper so the
   * last visible item peeks at the edge, hinting there's more content.
   * Default: false
   */
  showPeek?: boolean;
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function CarouselSkeleton({ count }: { count: number }) {
  return (
    <div className="flex gap-4 overflow-hidden px-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-none w-48 space-y-2">
          <div
            className={`aspect-square rounded-xl ${THEME_CONSTANTS.skeleton.image}`}
          />
          <div className={`${THEME_CONSTANTS.skeleton.text} w-3/4`} />
          <div className={`${THEME_CONSTANTS.skeleton.text} w-1/2`} />
        </div>
      ))}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export function SectionCarousel<T = unknown>({
  title,
  description,
  headingVariant = "default",
  pillLabel,
  backgroundImage,
  viewMoreHref,
  viewMoreLabel,
  items,
  renderItem,
  perView = { base: 1, sm: 2, md: 3 },
  gap = 16,
  autoScroll = false,
  autoScrollInterval = 3500,
  keyExtractor,
  rows = 1,
  className = "",
  isLoading = false,
  skeletonCount = 4,
  lightText,
  showPeek = false,
}: SectionCarouselProps<T>) {
  const tActions = useTranslations("actions");
  const hasBg = Boolean(backgroundImage);
  const useLightText = lightText ?? hasBg;

  const { themed, flex } = THEME_CONSTANTS;

  const headingClass = useLightText
    ? "text-white"
    : headingVariant === "gradient"
      ? "bg-gradient-to-r from-primary to-cobalt bg-clip-text text-transparent"
      : themed.textPrimary;

  const descVariant = useLightText ? "text-white/80" : themed.textSecondary;

  return (
    <Section
      className={[
        "relative overflow-hidden w-full",
        hasBg ? "" : themed.bgSecondary,
        "p-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Background image + overlay */}
      {hasBg && backgroundImage && (
        <>
          <div className="absolute inset-0 overflow-hidden">
            <MediaImage src={backgroundImage} alt="" size="hero" />
          </div>
          <div className="absolute inset-0 bg-black/55" />
        </>
      )}

      {/* Content — sits above the background */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-6`}>
          {/* Editorial pill */}
          {headingVariant === "editorial" && pillLabel && (
            <div className="mb-3">
              <Span
                className={
                  useLightText
                    ? "inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-1.5 text-xs font-medium tracking-[0.2em] uppercase text-white backdrop-blur-sm"
                    : THEME_CONSTANTS.sectionHeader.pill
                }
              >
                {pillLabel}
              </Span>
            </div>
          )}

          <Heading
            level={2}
            variant="none"
            className={[
              THEME_CONSTANTS.typography.h2,
              headingClass,
              headingVariant === "editorial" ? "font-display text-4xl" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {title}
          </Heading>

          {/* Editorial ornament */}
          {headingVariant === "editorial" && (
            <div
              className={`${THEME_CONSTANTS.sectionHeader.ornament} justify-center mt-2`}
            >
              <Span
                className={`h-px w-8 ${useLightText ? "bg-white/40" : "bg-zinc-300 dark:bg-slate-600"}`}
                aria-hidden="true"
              />
              <Span className="text-primary text-sm" aria-hidden="true">
                ✶
              </Span>
              <Span
                className={`h-px w-8 ${useLightText ? "bg-white/40" : "bg-zinc-300 dark:bg-slate-600"}`}
                aria-hidden="true"
              />
            </div>
          )}

          {description && (
            <Text
              className={`mt-2 ${THEME_CONSTANTS.typography.body} ${descVariant}`}
            >
              {description}
            </Text>
          )}
        </div>

        {/* Card carousel */}
        <div
          className={[
            "rounded-2xl border-2",
            useLightText ? "border-white/20" : themed.border,
            "p-4",
            useLightText ? "bg-white/10 backdrop-blur-sm" : themed.bgPrimary,
            showPeek ? "-mr-6 md:-mr-8 overflow-hidden" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {isLoading ? (
            <CarouselSkeleton count={skeletonCount} />
          ) : (
            <HorizontalScroller
              items={items}
              renderItem={renderItem}
              perView={perView}
              rows={rows}
              gap={gap}
              autoScroll={autoScroll}
              autoScrollInterval={autoScrollInterval}
              keyExtractor={keyExtractor}
              showArrows
              arrowSize="lg"
              showScrollbar
              showFadeEdges={false}
              snapToItems
            />
          )}
        </div>

        {/* View More button */}
        {viewMoreHref && (
          <div className={`${flex.center} mt-6`}>
            <TextLink href={viewMoreHref}>
              <Button
                variant="outline"
                size="lg"
                className={[
                  "min-w-[200px] sm:min-w-[280px]",
                  useLightText
                    ? "bg-transparent border-white/60 text-white hover:bg-white/10"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {viewMoreLabel ?? tActions("viewAll")}
              </Button>
            </TextLink>
          </div>
        )}
      </div>
    </Section>
  );
}
