"use client";

/**
 * useUrlTable — locale-aware adapter for @mohasinac/appkit/react useUrlTable.
 *
 * Injects the next-intl locale-prefixed router and pathname so that
 * `router.replace()` preserves the current locale prefix in the URL.
 * All logic lives in appkit; this file is a thin wiring layer.
 */

import { useRouter, usePathname } from "@/i18n/navigation";
import {
  useUrlTable as useAppkitUrlTable,
  type UseUrlTableOptions,
} from "@mohasinac/appkit/react";

export type { UseUrlTableOptions };

export function useUrlTable(options?: UseUrlTableOptions) {
  const router = useRouter();
  const pathname = usePathname();

  // Backward-compatible injection: older published appkit types may not
  // expose router/pathname overrides even though runtime supports them.
  return useAppkitUrlTable({
    ...options,
    router,
    pathname,
  } as UseUrlTableOptions);
}

