---
applyTo: "src/**"
description: "Zero hardcoded strings, useTranslations vs UI_LABELS, i18n rules. Rules 3, 33."
---

# Strings & Internationalisation Rules

## RULE 3: Zero Hardcoded Strings

**JSX in client components → `useTranslations()` from `next-intl`.**  
**API routes & server non-JSX → `UI_LABELS` / `ERROR_MESSAGES` / `SUCCESS_MESSAGES` from `@/constants`.**

```typescript
// ❌ WRONG — hardcoded in JSX
<button>Save</button>

// ❌ WRONG — UI_LABELS in JSX
import { UI_LABELS } from '@/constants';
<button>{UI_LABELS.ACTIONS.SAVE}</button>

// ✅ RIGHT — useTranslations in a client component
import { useTranslations } from 'next-intl';
export function SaveButton() {
  const t = useTranslations('actions'); // INSIDE component function
  return <Button>{t('save')}</Button>;
}

// ✅ RIGHT — constants in API route
return successResponse(result, SUCCESS_MESSAGES.PRODUCT.CREATED);
```

Interpolation — use `t("key", { variable })`, NEVER string concat or `.replace()`:

```typescript
// ❌  t('greeting').replace('{name}', name)
// ✅  t('greeting', { name })
```

Placeholders: use `UI_PLACEHOLDERS.EMAIL`, `.PASSWORD`, `.SEARCH`, `.PHONE`.

## RULE 33: i18n — Mandatory Usage

### 33.1 Client Components: `useTranslations`

- Import from `next-intl`
- Call INSIDE component function body — never at module scope, never conditionally

### 33.2 Server Components & `generateMetadata`: `getTranslations`

```typescript
import { getTranslations } from 'next-intl/server';
export default async function Page() {
  const t = await getTranslations('products');
  return <Heading level={1}>{t('pageTitle')}</Heading>;
}
```

### 33.3 Navigation — ALWAYS `@/i18n/navigation`

```typescript
// ❌ WRONG
import { useRouter } from "next/navigation";
import Link from "next/link";

// ✅ RIGHT
import { Link, useRouter, usePathname, redirect } from "@/i18n/navigation";
```

### 33.4 Namespace Conventions

| Use-case             | Namespace                          |
| -------------------- | ---------------------------------- |
| Page-level copy      | `'productsPage'`, `'checkoutPage'` |
| Shared action labels | `'actions'`                        |
| Shared form labels   | `'form'`                           |
| Shared status labels | `'status'`                         |
| Navigation           | `'nav'`                            |

### 33.5 Adding New Keys

Add to BOTH `messages/en.json` AND `messages/hi.json` in the same change. Identical JSON structure.

### 33.6 Aria, Placeholders, Alt Text

All `aria-label`, `placeholder`, `title`, `alt` with user-visible text MUST go through `t()`.

### 33.7 Tests

```typescript
jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }) => React.createElement("a", { href }, children),
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
  redirect: jest.fn(),
}));
```

### 33.8 Non-JSX Server Utilities

Use `UI_LABELS`, `ERROR_MESSAGES`, `SUCCESS_MESSAGES` — not `getTranslations` — for API route responses, log messages, email templates.
