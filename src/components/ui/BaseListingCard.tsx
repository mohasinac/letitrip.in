"use client";

import type { ReactNode, MouseEvent } from "react";
import { THEME_CONSTANTS } from "@/constants";

const { dimensions } = THEME_CONSTANTS.card;

export interface BaseListingCardRootProps {
  className?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  variant?: "grid" | "list";
  onClick?: () => void;
  children?: ReactNode;
}

export interface BaseListingCardHeroProps {
  aspect?: string;
  variant?: "grid" | "list";
  className?: string;
  children?: ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export interface BaseListingCardInfoProps {
  variant?: "grid" | "list";
  className?: string;
  children?: ReactNode;
}

export interface BaseListingCardCheckboxProps {
  selected?: boolean;
  onSelect?: (e: MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  position?: string;
  className?: string;
}

function BaseListingCardRoot({
  className = "",
  isSelected,
  isDisabled,
  onClick,
  children,
}: BaseListingCardRootProps) {
  return (
    <div
      onClick={onClick}
        className={`relative rounded-xl border overflow-hidden transition-shadow ${dimensions.minW} ${dimensions.minH}
        ${isSelected ? "ring-2 ring-primary border-primary" : "border-gray-200 dark:border-gray-700"}
        ${isDisabled ? "opacity-60" : ""}
        ${onClick ? "cursor-pointer hover:shadow-md" : ""}
        ${className}`}
    >
      {children}
    </div>
  );
}

function BaseListingCardHero({
  aspect,
  className = "",
  children,
  onMouseEnter,
  onMouseLeave,
}: BaseListingCardHeroProps) {
  const aspectClass =
    aspect === "square"
      ? "aspect-square"
      : aspect
        ? `aspect-[${aspect}]`
        : "aspect-[4/3]";
  return (
    <div
        className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${aspectClass} ${dimensions.heroMinH} ${dimensions.heroMaxH} ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}

function BaseListingCardInfo({
  className = "",
  children,
}: BaseListingCardInfoProps) {
  return <div className={`p-3 flex flex-col ${className}`}>{children}</div>;
}

function BaseListingCardCheckbox({
  selected,
  onSelect,
  label,
  position = "top-2 left-2",
  className = "",
}: BaseListingCardCheckboxProps) {
  return (
    <button
      type="button"
      aria-label={label ?? (selected ? "Deselect" : "Select")}
      onClick={onSelect}
      className={`absolute ${position} z-10 h-5 w-5 rounded border-2 flex items-center justify-center
        ${selected ? "bg-primary border-primary" : "bg-white/90 border-gray-300"}
        ${className}`}
    >
      {selected && <span className="text-white text-xs leading-none">✓</span>}
    </button>
  );
}

export const BaseListingCard = Object.assign(BaseListingCardRoot, {
  Hero: BaseListingCardHero,
  Info: BaseListingCardInfo,
  Checkbox: BaseListingCardCheckbox,
});
