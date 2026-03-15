import React from "react";
import type { HomepageSection } from "../types";

interface HeroSectionProps {
  section: HomepageSection;
  onCtaClick?: () => void;
}

export function HeroSection({ section, onCtaClick }: HeroSectionProps) {
  const { content } = section;
  return (
    <section
      className="relative flex min-h-[60vh] items-center overflow-hidden bg-neutral-900"
      style={
        content?.imageUrl
          ? {
              backgroundImage: `url(${content.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 text-center text-white sm:px-6 lg:px-8">
        {content?.title && (
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {content.title}
          </h1>
        )}
        {content?.subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
            {content.subtitle}
          </p>
        )}
        {content?.ctaLabel && (
          <button
            onClick={onCtaClick}
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
          >
            {content.ctaLabel}
          </button>
        )}
      </div>
    </section>
  );
}
