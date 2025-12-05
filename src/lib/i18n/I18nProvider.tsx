/**
 * @fileoverview React Component
 * @module src/lib/i18n/I18nProvider
 * @description This file contains the I18nProvider component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import React, { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./config";

/**
 * I18nProviderProps interface
 * 
 * @interface
 * @description Defines the structure and contract for I18nProviderProps
 */
interface I18nProviderProps {
  /** Children */
  children: React.ReactNode;
}

/**
 * Function: I18n Provider
 */
/**
 * Performs i18n provider operation
 *
 * @param {I18nProviderProps} { children } - The { children }
 *
 * @returns {any} The i18nprovider result
 *
 * @example
 * I18nProvider({ children });
 */

/**
 * Performs i18n provider operation
 *
 * @param {I18nProviderProps} { children } - The { children }
 *
 * @returns {any} The i18nprovider result
 *
 * @example
 * I18nProvider({ children });
 */

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // Initialize i18next on mount
    if (!i18n.isInitialized) {
      i18n.init();
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
