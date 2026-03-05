"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import {
  Button,
  Heading,
  HorizontalScroller,
  MediaImage,
  Section,
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
}: SectionCarouselProps<T>) {
  const tActions = useTranslations("actions");
  const hasBg = Boolean(backgroundImage);
  const useLightText = lightText ?? hasBg;

  const { themed, spacing, flex } = THEME_CONSTANTS;

  const headingVariant = useLightText ? "text-white" : themed.textPrimary;
  const descVariant = useLightText
    ? "text-white/80"
    : themed.textSecondary;

  return (
    <Section
      className={[
        "relative overflow-hidden w-full",
        hasBg ? "" : themed.bgSecondary,
        spacing.padding.xl,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Background image + overlay */}
      {hasBg && backgroundImage && (
        <>
          <MediaImage
            src={backgroundImage}
            alt=""
            size="hero"
          />
          <div className="absolute inset-0 bg-black/55" />
        </>
      )}

      {/* Content — sits above the background */}
      <div className="relative z-10 w-full max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-6 ${spacing.stack}`}>
          <Heading
            level={2}
            className={`${THEME_CONSTANTS.typography.h2} ${headingVariant}`}
          >
            {title}
          </Heading>
          {description && (
            <Text className={`${THEME_CONSTANTS.typography.body} ${descVariant}`}>
              {description}
            </Text>
          )}
        </div>

        {/* Card carousel */}
        <div
          className={[
            "rounded-2xl border-2",
            hasBg ? "border-white/20" : themed.border,
            "p-4",
            hasBg
              ? "bg-white/10 backdrop-blur-sm"
              : themed.bgPrimary,
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
                    ? "border-white/60 text-white hover:bg-white/10"
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
