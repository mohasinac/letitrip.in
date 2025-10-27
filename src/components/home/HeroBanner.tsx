"use client";

import Link from "next/link";
import { HERO_BANNER } from "@/constants/homepage";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
            {HERO_BANNER.title}
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 mb-4">
            {HERO_BANNER.subtitle}
          </p>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            {HERO_BANNER.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={HERO_BANNER.primaryButton.href}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              {HERO_BANNER.primaryButton.text}
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            {HERO_BANNER.secondaryButton && (
              <Link
                href={HERO_BANNER.secondaryButton.href}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
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
