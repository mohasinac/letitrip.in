/**
 * Homepage Ad Slot Placeholders
 * 
 * Provides ad slot injection points for the marketplace homepage.
 * Can be replaced with actual AdSense/third-party provider configs.
 * 
 * For now, uses placeholder manual content to demonstrate the wiring.
 */

import { AdSlot } from "@mohasinac/appkit/client";
import { Div, Text } from "@mohasinac/appkit/ui";

/**
 * After Hero Section (section #0-1 transition)
 */
export function AfterHeroAdSlot() {
  return (
    <AdSlot
      id="homepage-hero-banner"
      manualContent={
        <Div className="w-full h-[90px] bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center">
          <Text className="text-xs text-slate-400 dark:text-slate-500">
            Sponsored placement available
          </Text>
        </Div>
      }
      className="my-6"
    />
  );
}

/**
 * After Featured Products Section (section #6 transition)
 */
export function AfterFeaturedProductsAdSlot() {
  return (
    <AdSlot
      id="homepage-mid-banner"
      manualContent={
        <Div className="w-full h-[90px] bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center">
          <Text className="text-xs text-slate-400 dark:text-slate-500">
            Sponsored placement available
          </Text>
        </Div>
      }
      className="my-6"
    />
  );
}

/**
 * After Reviews Section (section #12 transition)
 */
export function AfterReviewsAdSlot() {
  return (
    <AdSlot
      id="homepage-bottom-banner"
      manualContent={
        <Div className="w-full h-[90px] bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center">
          <Text className="text-xs text-slate-400 dark:text-slate-500">
            Sponsored placement available
          </Text>
        </Div>
      }
      className="my-6"
    />
  );
}

/**
 * After FAQ Section (section #15 transition)
 */
export function AfterFAQAdSlot() {
  return (
    <AdSlot
      id="homepage-bottom-banner"
      manualContent={
        <Div className="w-full h-[90px] bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center">
          <Text className="text-xs text-slate-400 dark:text-slate-500">
            Sponsored placement available
          </Text>
        </Div>
      }
      className="my-6"
    />
  );
}
