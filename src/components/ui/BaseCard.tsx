"use client";

import React from "react";
import Link from "next/link";
import OptimizedImage from "@/components/common/OptimizedImage";

export interface Badge {
  text: string;
  color: "yellow" | "red" | "blue" | "green" | "gray" | "purple" | "orange";
}

export interface ActionButton {
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  label: string;
  active?: boolean;
  activeColor?: string;
}

export interface BaseCardProps {
  href: string;
  image?: string;
  imageAlt: string;
  imageFallback?: React.ReactNode;
  badges?: Badge[];
  actionButtons?: ActionButton[];
  children: React.ReactNode;
  className?: string;
  imageClassName?: string;
  imageOverlay?: React.ReactNode;
  priority?: boolean;
  aspectRatio?: "square" | "video" | "wide";
  onClick?: () => void;
}

const badgeColors = {
  yellow: "bg-yellow-500 text-white",
  red: "bg-red-500 text-white",
  blue: "bg-blue-500 text-white",
  green: "bg-green-500 text-white",
  gray: "bg-gray-500 text-white",
  purple: "bg-purple-500 text-white",
  orange: "bg-orange-500 text-white",
};

const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-[21/9]",
};

/**
 * BaseCard - Reusable card component for Products, Auctions, Shops, etc.
 */
export const BaseCard: React.FC<BaseCardProps> = ({
  href,
  image,
  imageAlt,
  imageFallback,
  badges = [],
  actionButtons = [],
  children,
  className = "",
  imageClassName = "",
  imageOverlay,
  priority = false,
  aspectRatio = "square",
  onClick,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`
        group block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden
        hover:shadow-lg hover:border-blue-500 transition-all duration-200
        ${className}
      `}
    >
      {/* Image Container */}
      <div
        className={`
          relative ${aspectRatioClasses[aspectRatio]} overflow-hidden bg-gray-100 dark:bg-gray-700
          ${imageClassName}
        `}
      >
        {image ? (
          <OptimizedImage
            src={image}
            alt={imageAlt}
            fill
            quality={85}
            objectFit="cover"
            className="group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
          />
        ) : (
          imageFallback && (
            <div className="flex items-center justify-center h-full text-gray-400">
              {imageFallback}
            </div>
          )
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {badges.map((badge, index) => (
              <span
                key={index}
                className={`${
                  badgeColors[badge.color]
                } text-xs font-semibold px-2 py-1 rounded`}
              >
                {badge.text}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {actionButtons.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            {actionButtons.map((button, index) => (
              <button
                key={index}
                onClick={button.onClick}
                className={`
                  p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors
                  ${
                    button.active
                      ? button.activeColor || "text-blue-500"
                      : "text-gray-600 dark:text-gray-400"
                  }
                `}
                aria-label={button.label}
              >
                {button.icon}
              </button>
            ))}
          </div>
        )}

        {/* Image Overlay (e.g., Add to Cart button) */}
        {imageOverlay && (
          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            {imageOverlay}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">{children}</div>
    </Link>
  );
};
