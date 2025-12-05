/**
 * @fileoverview TypeScript Module
 * @module src/lib/i18n/useI18n
 * @description This file contains functionality related to useI18n
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * i18n Hook - useTranslation wrapper with TypeScript support
 *
 * Usage:
 * const { t } = useI18n();
 * <button>{t('common.save')}</button>
 * <h1>{t('auth.login.title')}</h1>
 */

import { useTranslation } from "react-i18next";

/**
 * Function: Use I18n
 */
/**
 * Custom React hook for i18n
 *
 * @returns {void} Function return value
 *
 * @example
 * const result = useI18n();
 */
/**
 * Custom React hook for i18n
 *
 * @returns {any} The usei18n result
 *
 * @example
 * useI18n();
 */

/**
 * Custom React hook for i18n
 *
 * @returns {any} The usei18n result
 *
 * @example
 * useI18n();
 */

export function useI18n() {
  const { t, i18n } = useTranslation();

  return {
    t,
    i18n,
    /** Language */
    language: i18n.language,
    /** Change Language */
    changeLanguage: i18n.changeLanguage,
  };
}

export { useTranslation };
