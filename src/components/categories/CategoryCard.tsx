/**
 * CategoryCard
 *
 * tile variant (default): portrait card with gradient background, icon, bottom name overlay.
 * pill variant: compact rounded-full button for filter rows.
 * card variant: legacy full card with image, used for admin/selectable contexts.
 */

"use client";

import { Star, Tag, Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CategoryItem } from "@mohasinac/feat-categories";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { Card, Heading, MediaImage, Span, Text, TextLink } from "@/components";

const { themed, flex } = THEME_CONSTANTS;

interface CategoryCardProps {
  category: CategoryItem;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  className?: string;
  /** tile: portrait card (default). pill: compact rounded-full. card: legacy landscape. */
  variant?: "tile" | "pill" | "card";
}

export function CategoryCard({
  category,
  selectable = false,
  selected = false,
  onSelect,
  className = "",
  variant = "tile",
}: CategoryCardProps) {
  const t = useTranslations("categories");
  const { name, slug, display, metrics, isFeatured, isBrand } = category;
  const productCount = metrics?.productCount ?? 0;
  const href = `${ROUTES.PUBLIC.CATEGORIES}/${slug}`;

  /* ── Pill variant ─────────────────────────────────────── */
  if (variant === "pill") {
    return (
      <TextLink
        href={href}
        className={`inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-primary-500/10 hover:text-primary-700 dark:hover:text-primary-400 transition-all duration-200 ${className}`}
      >
        {display?.icon && (
          <Span className="text-base leading-none">{display.icon}</Span>
        )}
        {name}
      </TextLink>
    );
  }

  /* ── Tile variant (default) ───────────────────────────── */
  if (variant === "tile") {
    const bgGradient = display?.color
      ? `background: ${display.color}`
      : undefined;

    return (
      <TextLink
        href={href}
        className={`block group focus:outline-none ${className}`}
        onClick={
          selectable
            ? (e) => {
                e.preventDefault();
                onSelect?.(category.id, !selected);
              }
            : undefined
        }
      >
        <div
          className={`relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer ${
            selected ? "ring-2 ring-primary-500" : ""
          }`}
          style={{
            background:
              display?.color ??
              "linear-gradient(135deg,#65c408 0%,#3570fc 100%)",
          }}
        >
          {/* Cover image */}
          {display?.coverImage && (
            <div className="absolute inset-0">
              <MediaImage
                src={display.coverImage}
                alt={name}
                size="card"
                className="group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          {/* Large icon */}
          {!display?.coverImage && display?.icon && (
            <div className={`${flex.center} w-full h-full pt-8`}>
              <Span className="text-7xl leading-none group-hover:scale-110 transition-transform duration-300">
                {display.icon}
              </Span>
            </div>
          )}

          {/* Gradient hover fill overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-cobalt-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Bottom overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-3 pb-3 pt-10">
            <Heading
              level={3}
              className="font-display text-lg text-white leading-snug line-clamp-1"
            >
              {name}
            </Heading>
            <div className={`${THEME_CONSTANTS.flex.between} mt-1`}>
              {/* Animated underline */}
              <div className="bg-primary-400 h-0.5 w-0 rounded-full transition-all duration-300 group-hover:w-8" />
              {/* Product count chip */}
              <Span className="bg-black/50 backdrop-blur text-white text-[10px] font-medium rounded-full px-2 py-0.5">
                {productCount}
              </Span>
            </div>
          </div>

          {/* Featured star */}
          {isFeatured && (
            <div
              className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-yellow-400 ${flex.center} shadow`}
            >
              <Star
                className="w-4 h-4 text-yellow-900 fill-yellow-900"
                aria-hidden="true"
              />
            </div>
          )}

          {/* Checkbox — tile variant */}
          {selectable && (
            <div
              className="absolute top-2 left-2 z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect?.(category.id, !selected);
              }}
            >
              <div
                className={`w-6 h-6 rounded-md shadow-md ${flex.center} relative border-2 transition-colors cursor-pointer ${
                  selected
                    ? "bg-primary border-primary"
                    : "bg-white/95 dark:bg-slate-800/95 border-zinc-500 dark:border-slate-400 hover:border-primary"
                }`}
                aria-label={selected ? `Deselect ${name}` : `Select ${name}`}
              >
                {selected && (
                  <svg
                    className="absolute inset-0 m-auto w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          )}
        </div>
      </TextLink>
    );
  }

  /* ── Card variant (legacy / admin) ───────────────────── */
  return (
    <TextLink
      href={href}
      className={`block group/card focus:outline-none ${className}`}
    >
      <Card
        className={`h-full overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200${
          selected ? " ring-2 ring-primary-500" : ""
        }`}
      >
        {/* ── Image area ── */}
        <div className="group/img relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-slate-800 flex-shrink-0">
          {display?.coverImage ? (
            <MediaImage
              src={display.coverImage}
              alt={name}
              size="card"
              className="group-hover/img:scale-105 transition-transform duration-300"
            />
          ) : display?.icon ? (
            <div
              className={`${flex.center} w-full h-full`}
              style={{
                background:
                  display.color ?? "linear-gradient(135deg,#6366f1,#a855f7)",
              }}
            >
              <Span className="text-5xl leading-none">{display.icon}</Span>
            </div>
          ) : (
            <div
              className={`${flex.center} w-full h-full bg-gradient-to-br from-primary-500 to-cobalt-600`}
            >
              <Span className="text-4xl font-bold text-white/90 select-none">
                {name.charAt(0).toUpperCase()}
              </Span>
            </div>
          )}

          {/* Checkbox — card variant top left */}
          {selectable && (
            <div
              className="absolute top-2 left-2 z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect?.(category.id, !selected);
              }}
            >
              <div
                className={`w-6 h-6 rounded-md shadow-md ${flex.center} relative border-2 transition-colors cursor-pointer ${
                  selected
                    ? "bg-primary border-primary"
                    : "bg-white/95 dark:bg-slate-800/95 border-zinc-500 dark:border-slate-400 hover:border-primary"
                }`}
                aria-label={selected ? `Deselect ${name}` : `Select ${name}`}
              >
                {selected && (
                  <svg
                    className="absolute inset-0 m-auto w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          )}

          {/* Featured star — top right */}
          {isFeatured && (
            <div
              className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-yellow-400 ${flex.center} shadow`}
            >
              <Star
                className="w-4 h-4 text-yellow-900 fill-yellow-900"
                aria-hidden="true"
              />
            </div>
          )}

          {/* Type badge — bottom left */}
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <Span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                isBrand
                  ? "bg-amber-600/90 text-white"
                  : "bg-gradient-to-br from-primary-500 to-primary-600 text-white"
              }`}
            >
              {isBrand ? (
                <Tag className="w-3 h-3 flex-shrink-0" />
              ) : (
                <Bookmark className="w-3 h-3 flex-shrink-0" />
              )}
              {isBrand ? t("brandBadge") : t("categoryBadge")}
            </Span>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex flex-col flex-1 p-4 gap-1">
          <Heading
            level={3}
            className={`text-base font-semibold ${themed.textPrimary} line-clamp-1 group-hover/img:text-primary-600 dark:group-hover/img:text-primary-400 transition-colors`}
          >
            {name}
          </Heading>

          <Text size="sm" variant="secondary" className="flex-1">
            {t("productsCount", { count: productCount })}
          </Text>

          {/* Amber "View" label */}
          <div className={`${flex.end} mt-2`}>
            <Span
              aria-hidden="true"
              className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-amber-500 text-white group-hover/img:bg-amber-600 transition-colors"
            >
              {t("view")}
            </Span>
          </div>
        </div>
      </Card>
    </TextLink>
  );
}
