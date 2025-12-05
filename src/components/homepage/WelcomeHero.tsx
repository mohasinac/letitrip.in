/**
 * @fileoverview React Component
 * @module src/components/homepage/WelcomeHero
 * @description This file contains the WelcomeHero component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { COMPANY_NAME, COMPANY_ALT_TEXT } from "@/constants/navigation";

/**
 * Function: Welcome Hero
 */
/**
 * Performs welcome hero operation
 *
 * @returns {void} Function return value
 *
 * @example
 * const result = WelcomeHero();
 */
/**
 * Performs welcome hero operation
 *
 * @returns {any} The welcomehero result
 *
 * @example
 * WelcomeHero();
 */

/**
 * Performs welcome hero operation
 *
 * @returns {any} The welcomehero result
 *
 * @example
 * WelcomeHero();
 */

export function WelcomeHero() {
  return (
    <section className="text-center py-3 md:py-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
        Welcome to {COMPANY_NAME}
      </h1>
      <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-2">
        {COMPANY_ALT_TEXT} - Your Gateway to Authentic Collectibles
      </p>
    </section>
  );
}
