# Multi-Language / Internationalization (i18n)

## Current State

> **Status**: ⏸️ Constants defined, not implemented
> **Priority**: 🟢 Low - Future Enhancement

### Existing Code

**Language Options** (`src/constants/footer.ts:51-68`):

```typescript
export const LANGUAGES = [
  { code: "en", name: "EN", fullName: "English" },
  { code: "ja", name: "日本語", fullName: "Japanese" },
  { code: "ko", name: "한국어", fullName: "Korean" },
  { code: "zh-cn", name: "简体中文", fullName: "Simplified Chinese" },
  { code: "zh-tw", name: "繁體中文", fullName: "Traditional Chinese" },
  { code: "de", name: "Deutsch", fullName: "German" },
  { code: "it", name: "Italiano", fullName: "Italian" },
  { code: "es", name: "Español", fullName: "Spanish" },
  { code: "fr", name: "Français", fullName: "French" },
  { code: "pl", name: "Polski", fullName: "Polish" },
  { code: "ar", name: "العربية", fullName: "Arabic" },
  { code: "ms", name: "Bahasa Melayu", fullName: "Malay" },
  { code: "th", name: "ภาษาไทย", fullName: "Thai" },
  { code: "tr", name: "Türkçe", fullName: "Turkish" },
  { code: "pt", name: "Português", fullName: "Portuguese" },
  { code: "id", name: "Bahasa Indonesia", fullName: "Indonesian" },
  { code: "ru", name: "Русский", fullName: "Russian" },
];
```

### Missing Components

1. **i18n Library** - No `next-intl` or similar library installed
2. **Translation Files** - No JSON translation files
3. **Language Switcher** - No UI for switching languages
4. **Locale Routing** - No `/[locale]/` route structure
5. **RTL Support** - Arabic language needs RTL layout

---

## Recommended Approach

Use **next-intl** for Next.js App Router compatibility.

---

## Implementation Checklist

### 1. Install Dependencies

```bash
npm install next-intl
```

### 2. Create i18n Configuration

**File**: `src/i18n/config.ts`

```typescript
export const locales = [
  "en",
  "hi",
  "ta",
  "te",
  "bn",
  "mr",
  "gu",
  "kn",
  "ml",
  "pa",
] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

// Prioritize Indian languages for India-focused platform
export const SUPPORTED_LOCALES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
];
```

### 3. Create Translation Files

**Directory**: `src/i18n/messages/`

**File**: `src/i18n/messages/en.json`

```json
{
  "common": {
    "home": "Home",
    "products": "Products",
    "auctions": "Auctions",
    "cart": "Cart",
    "login": "Login",
    "signup": "Sign Up",
    "search": "Search",
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Retry"
  },
  "product": {
    "addToCart": "Add to Cart",
    "buyNow": "Buy Now",
    "outOfStock": "Out of Stock",
    "inStock": "In Stock",
    "price": "Price",
    "quantity": "Quantity",
    "description": "Description",
    "specifications": "Specifications",
    "reviews": "Reviews"
  },
  "auction": {
    "currentBid": "Current Bid",
    "placeBid": "Place Bid",
    "bidAmount": "Bid Amount",
    "timeLeft": "Time Left",
    "ended": "Auction Ended",
    "winner": "Winner",
    "startingPrice": "Starting Price",
    "minimumBid": "Minimum Bid"
  },
  "auth": {
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot Password?",
    "rememberMe": "Remember Me",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?"
  },
  "footer": {
    "aboutUs": "About Us",
    "contactUs": "Contact Us",
    "termsOfService": "Terms of Service",
    "privacyPolicy": "Privacy Policy",
    "faq": "FAQ"
  }
}
```

**File**: `src/i18n/messages/hi.json` (Hindi example)

```json
{
  "common": {
    "home": "होम",
    "products": "उत्पाद",
    "auctions": "नीलामी",
    "cart": "कार्ट",
    "login": "लॉगिन",
    "signup": "साइन अप",
    "search": "खोजें",
    "loading": "लोड हो रहा है...",
    "error": "कुछ गलत हो गया",
    "retry": "पुनः प्रयास करें"
  }
}
```

### 4. Configure next-intl

**File**: `src/i18n/request.ts`

```typescript
import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale } from "./config";

export default getRequestConfig(async ({ locale }) => {
  const validLocale = locales.includes(locale as any) ? locale : defaultLocale;

  return {
    messages: (await import(`./messages/${validLocale}.json`)).default,
  };
});
```

### 5. Create Middleware

**File**: `src/middleware.ts` (update existing)

```typescript
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed", // Only add prefix for non-default locales
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

### 6. Update App Layout

**File**: `src/app/[locale]/layout.tsx`

```typescript
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
```

### 7. Create Language Switcher

**File**: `src/components/common/LanguageSwitcher.tsx`

Features:

- Dropdown with language options
- Flag icons (optional)
- Native language names
- Persist selection in cookie/localStorage
- Update URL with new locale

### 8. Update Components to Use Translations

Replace hardcoded strings:

```typescript
// Before
<button>Add to Cart</button>;

// After
import { useTranslations } from "next-intl";

function ProductButton() {
  const t = useTranslations("product");
  return <button>{t("addToCart")}</button>;
}
```

### 9. Handle Dynamic Content

For user-generated content (product descriptions, reviews):

- Store in original language
- Consider Google Translate API for auto-translation
- Or display original with translate button

### 10. RTL Support (for Arabic)

**File**: `src/app/[locale]/layout.tsx`

```typescript
const rtlLocales = ["ar"];
const dir = rtlLocales.includes(locale) ? "rtl" : "ltr";

return (
  <html lang={locale} dir={dir}>
    ...
  </html>
);
```

---

## Priority Languages (India Focus)

Given this is an India-focused platform, prioritize:

1. **English** (default) - Widely understood
2. **Hindi** - Most spoken
3. **Tamil** - South India
4. **Telugu** - South India
5. **Bengali** - East India
6. **Marathi** - West India
7. **Gujarati** - West India
8. **Kannada** - South India
9. **Malayalam** - South India
10. **Punjabi** - North India

---

## Translation Workflow

### Phase 1: Core UI

- Navigation
- Buttons
- Form labels
- Error messages
- Common phrases

### Phase 2: Pages

- Home page
- Product pages
- Checkout flow
- Auth pages

### Phase 3: Admin/Seller

- Dashboard
- Product management
- Order management

---

## File Structure

```
src/
├── i18n/
│   ├── config.ts
│   ├── request.ts
│   └── messages/
│       ├── en.json
│       ├── hi.json
│       ├── ta.json
│       └── ...
├── app/
│   └── [locale]/
│       ├── layout.tsx
│       ├── page.tsx
│       └── ...
└── components/
    └── common/
        └── LanguageSwitcher.tsx
```

---

## Testing Checklist

- [ ] Language switcher changes locale
- [ ] URL updates with locale prefix
- [ ] All static text translates
- [ ] Date/number formatting follows locale
- [ ] Currency displays correctly (₹ for all)
- [ ] RTL layout works for Arabic
- [ ] Fallback to English for missing translations
- [ ] SEO: hreflang tags added
- [ ] Language persists across sessions
- [ ] Mobile language switcher works
