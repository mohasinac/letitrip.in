# Epic E037: Internationalization (i18n)

**Status**: ⏸️ Planned - Constants defined  
**Priority**: P3 - Low (Future Enhancement)  
**Target**: Future release

## Overview

Multi-language support for the platform, prioritizing Indian languages to serve the diverse linguistic needs of the Indian market. Enable users to browse and interact with the platform in their preferred language.

## Related Documentation

- **docs/12-multi-language-i18n.md** - i18n implementation plan

## Scope

- Multi-language UI with next-intl
- Language switcher component
- Translation files for supported languages
- RTL layout support (for Arabic if included)
- Locale-based routing
- Currency/date/number formatting

## User Roles Involved

- **Admin**: Manage translations, add languages
- **Seller**: Use platform in preferred language
- **User**: Browse/shop in preferred language
- **Guest**: Select language before browsing

---

## Implementation Status

### Current State

**Constants Defined**: `src/constants/footer.ts` contains language options (17 languages)

**Not Yet Implemented**:
- No i18n library installed (next-intl recommended)
- No translation files
- No language switcher UI
- No locale routing structure
- No RTL support

### Existing Language Constants

```typescript
// src/constants/footer.ts:51-68
export const LANGUAGES = [
  { code: 'en', name: 'EN', fullName: 'English' },
  { code: 'ja', name: '日本語', fullName: 'Japanese' },
  { code: 'ko', name: '한국어', fullName: 'Korean' },
  { code: 'zh-cn', name: '简体中文', fullName: 'Simplified Chinese' },
  // ... 13 more languages
];
```

---

## User Stories

### US-037-01: As a user, I want to select my language

**Story**: As a user visiting the platform, I want to select my preferred language so that I can browse and shop comfortably in my native language.

**Acceptance Criteria**:
- Language switcher visible in header/footer
- Selection persists across sessions (cookie/localStorage)
- URL updates with locale prefix (e.g., `/hi/products` for Hindi)
- All static UI text translates to selected language
- Language preference synced for logged-in users

**Priority**: P1 High

---

### US-037-02: As a developer, I want centralized translations

**Story**: As a developer adding new features, I want to manage translations in centralized JSON files so that adding new text is consistent and maintainable.

**Acceptance Criteria**:
- Translation files in `src/i18n/messages/[locale].json`
- TypeScript types for translation keys
- Fallback to English for missing translations
- Hot reload during development when translations change
- Translation helper function/hook available in all components

**Priority**: P1 High

---

### US-037-03: As an admin, I want to prioritize Indian languages

**Story**: As an admin managing the platform for the Indian market, I want to prioritize Indian regional languages so that we serve our primary user base effectively.

**Acceptance Criteria**:
- Priority languages: English, Hindi, Tamil, Telugu, Bengali, Marathi
- Language switcher shows Indian languages first
- Proper native script rendering (Devanagari, Tamil, Bengali scripts)
- Support for 10+ Indian languages

**Priority**: P1 High

---

### US-037-04: As an admin, I want to translate dynamic content

**Story**: As an admin, I want user-generated content (product names, descriptions) to be accessible in multiple languages so that users can discover products regardless of listing language.

**Acceptance Criteria**:
- Option to auto-translate product descriptions (Google Translate API)
- Translate button shown for non-matching language content
- Seller can provide multiple language versions of descriptions
- Reviews show original language with translate option

**Priority**: P2 Medium

---

## Features

### F037.1: Language Switcher

**Components**:
- `LanguageSwitcher.tsx` - Dropdown in header/footer
- Flag icons or native language names
- Keyboard accessible
- Mobile-friendly

**Functionality**:
- Updates locale in URL
- Sets cookie for persistence
- Triggers page re-render with new translations

---

### F037.2: Translation Management

**Structure**:
```
src/i18n/
├── config.ts                    # Locale config, supported languages
├── request.ts                   # next-intl request config
└── messages/
    ├── en.json                  # English (default)
    ├── hi.json                  # Hindi
    ├── ta.json                  # Tamil
    ├── te.json                  # Telugu
    ├── bn.json                  # Bengali
    ├── mr.json                  # Marathi
    └── ... (more languages)
```

**Translation Keys**:
```json
{
  "common": {
    "home": "Home",
    "products": "Products",
    "cart": "Cart",
    "search": "Search"
  },
  "product": {
    "addToCart": "Add to Cart",
    "price": "Price",
    "inStock": "In Stock"
  },
  "auction": {
    "currentBid": "Current Bid",
    "placeBid": "Place Bid"
  }
}
```

---

### F037.3: Locale-Based Routing

**Route Structure**:
```
src/app/
└── [locale]/
    ├── layout.tsx               # Wraps with NextIntlClientProvider
    ├── page.tsx                 # Homepage
    ├── products/
    │   └── [slug]/page.tsx
    ├── auctions/
    └── ...
```

**Middleware**:
- Detects user's preferred locale
- Redirects to appropriate `/[locale]/` route
- Only adds prefix for non-default locales

---

### F037.4: RTL Support (Optional)

**For Arabic** (if included in language list):
- Set `dir="rtl"` on `<html>` tag
- Mirror layout with Tailwind RTL classes
- Flip icons and directional UI elements

---

## Priority Languages (India Focus)

Given India-focused platform, prioritize these 10 languages:

| Priority | Language   | Code | Native Name | Speakers (India) |
|----------|------------|------|-------------|------------------|
| 1        | English    | en   | English     | 125M+ (L2)       |
| 2        | Hindi      | hi   | हिन्दी      | 528M+ (L1+L2)    |
| 3        | Tamil      | ta   | தமிழ்       | 69M+             |
| 4        | Telugu     | te   | తెలుగు      | 82M+             |
| 5        | Bengali    | bn   | বাংলা       | 97M+             |
| 6        | Marathi    | mr   | मराठी       | 83M+             |
| 7        | Gujarati   | gu   | ગુજરાતી     | 56M+             |
| 8        | Kannada    | kn   | ಕನ್ನಡ       | 44M+             |
| 9        | Malayalam  | ml   | മലയാളം      | 38M+             |
| 10       | Punjabi    | pa   | ਪੰਜਾਬੀ     | 33M+             |

---

## Implementation Checklist

### Phase 1: Setup (Not Started)

- [ ] Install `next-intl` library
- [ ] Create `src/i18n/config.ts` with locale definitions
- [ ] Create `src/i18n/request.ts` for next-intl config
- [ ] Update middleware to handle locale routing
- [ ] Create `src/app/[locale]/layout.tsx` wrapper

### Phase 2: English Translations (Not Started)

- [ ] Create `en.json` with all UI strings
- [ ] Extract hardcoded strings from components
- [ ] Replace with `useTranslations()` hooks
- [ ] Test all pages render correctly

### Phase 3: Priority Languages (Not Started)

- [ ] Create translation files for Hindi, Tamil, Telugu
- [ ] Create files for Bengali, Marathi, Gujarati
- [ ] Create files for Kannada, Malayalam, Punjabi
- [ ] Professional translation review

### Phase 4: Language Switcher (Not Started)

- [ ] Create `LanguageSwitcher` component
- [ ] Add to header
- [ ] Add to footer
- [ ] Mobile responsive
- [ ] Persist selection in cookie

### Phase 5: Dynamic Content (Future)

- [ ] Add Google Translate API integration
- [ ] Translate button on product descriptions
- [ ] Multi-language support for seller content
- [ ] Review translation system

### Phase 6: RTL Support (Optional)

- [ ] Detect RTL languages
- [ ] Set `dir="rtl"` attribute
- [ ] Test layout with RTL
- [ ] Mirror icons and directional elements

---

## Translation Workflow

### Content Categories

**Static UI** (Priority 1):
- Navigation menus
- Button labels
- Form labels
- Error messages
- Common phrases

**Page Content** (Priority 2):
- Homepage sections
- Product listing pages
- Checkout flow
- Auth pages

**Admin/Seller** (Priority 3):
- Dashboard labels
- Management pages
- Settings

---

## Technical Specifications

### next-intl Configuration

```typescript
// src/i18n/config.ts
export const locales = ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';
```

### Usage in Components

```tsx
import { useTranslations } from 'next-intl';

function ProductButton() {
  const t = useTranslations('product');
  
  return (
    <button>{t('addToCart')}</button>
  );
}
```

### Server Components

```tsx
import { getTranslations } from 'next-intl/server';

export default async function ProductPage() {
  const t = await getTranslations('product');
  
  return <h1>{t('title')}</h1>;
}
```

---

## Business Rules

1. **Default Language**: English (en) is the default fallback
2. **Locale Detection**: Detect from URL > Cookie > Browser > Default
3. **Persistence**: Store language preference in cookie for 1 year
4. **Fallback**: Missing translations fall back to English
5. **Currency**: Always use ₹ (INR) regardless of language
6. **Dates**: Format based on locale (e.g., DD/MM/YYYY for India)

---

## Related Epics

- E002: Product Catalog (product descriptions translation)
- E003: Auction System (auction details translation)
- E027: Design System (language-aware typography)
- E036: Component Refactoring (translation-ready components)

---

## Test Documentation

- **Test Cases**: Translation switching, fallback, persistence
- **Accessibility**: Screen readers in different languages
- **Performance**: Translation loading time
- **SEO**: hreflang tags, sitemap with locales

### Test Coverage

- Unit tests for translation loading
- Integration tests for language switching
- E2E tests for user flows in different languages
- Visual regression tests for RTL layout
- Locale-based date/number formatting tests

---

## Dependencies

**External Libraries**:
- `next-intl` - Internationalization for Next.js App Router
- `@formatjs/intl-numberformat` (optional) - Number formatting
- `date-fns` with locale support - Date formatting

**Translation Services** (Optional):
- Google Translate API - Auto-translation for dynamic content
- Professional translation service - Quality translations

---

## Performance Considerations

- Lazy load translation files per locale
- Server-side translation for initial render
- Cache translations in browser storage
- Tree-shake unused translations in production
- Optimize bundle size with code splitting per locale

---

## SEO Considerations

- Add `<link rel="alternate" hreflang="x" />` tags
- Create sitemap with all locale URLs
- Consistent URL structure across locales
- Proper language meta tags
- Search engine can crawl all language versions
