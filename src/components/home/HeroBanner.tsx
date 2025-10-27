"use client";

import Link from "next/link";
import { HERO_BANNER } from "@/constants/homepage";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-theme-background shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-theme-accent/30 to-theme-secondary/20"></div>
      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-7xl font-black bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-accent bg-clip-text text-transparent mb-8 drop-shadow-2xl">
            {HERO_BANNER.title}
          </h1>
          <p className="text-2xl lg:text-3xl text-theme-text font-bold mb-6 drop-shadow-lg">
            {HERO_BANNER.subtitle}
          </p>
          <p className="text-xl text-theme-muted font-semibold mb-10 max-w-2xl mx-auto drop-shadow-md">
            {HERO_BANNER.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href={HERO_BANNER.primaryButton.href}
              className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-theme-primary hover:bg-theme-secondary transition-all duration-300 shadow-2xl hover:shadow-3xl hover-glow-theme-strong rounded-xl border-4 border-theme-primary"
            >
              {HERO_BANNER.primaryButton.text}
              <svg
                className="w-6 h-6 ml-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            {HERO_BANNER.secondaryButton && (
              <Link
                href={HERO_BANNER.secondaryButton.href}
                className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-theme-primary bg-white border-4 border-theme-primary hover:bg-gray-100 hover:border-theme-secondary transition-all duration-300 shadow-2xl hover:shadow-3xl rounded-xl"
              >
                {HERO_BANNER.secondaryButton.text}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
