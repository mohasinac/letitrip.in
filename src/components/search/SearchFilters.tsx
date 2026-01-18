"use client";

import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { SearchFilters as LibrarySearchFilters } from "@letitrip/react-library";
import type { SearchFiltersProps as LibrarySearchFiltersProps } from "@letitrip/react-library";

export type { AdvancedSearchFilters } from "@letitrip/react-library";

export interface SearchFiltersProps
  extends Omit<LibrarySearchFiltersProps, "icons"> {}

/**
 * SearchFilters Component (Next.js Wrapper)
 *
 * Advanced filter panel for search results.
 * Integrates library SearchFilters with icons.
 */
export function SearchFilters(props: SearchFiltersProps) {
  return (
    <LibrarySearchFilters
      {...props}
      icons={{
        filter: <Filter className="h-5 w-5" />,
        chevronUp: <ChevronUp className="h-4 w-4" />,
        chevronDown: <ChevronDown className="h-4 w-4" />,
      }}
    />
  );
}
