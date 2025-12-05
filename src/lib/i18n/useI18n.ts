/**
 * i18n Hook - useTranslation wrapper with TypeScript support
 *
 * Usage:
 * const { t } = useI18n();
 * <button>{t('common.save')}</button>
 * <h1>{t('auth.login.title')}</h1>
 */

import { useTranslation } from "react-i18next";

export function useI18n() {
  const { t, i18n } = useTranslation();

  return {
    t,
    i18n,
    language: i18n.language,
    changeLanguage: i18n.changeLanguage,
  };
}

export { useTranslation };
