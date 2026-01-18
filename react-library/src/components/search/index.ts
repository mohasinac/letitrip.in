/**
 * Search & Filter Components
 *
 * Reusable search, dropdown, and filter components
 */

export { CollapsibleFilter } from "./CollapsibleFilter";
export type {
  CollapsibleFilterProps,
  FilterSection,
  FilterStorageAdapter,
} from "./CollapsibleFilter";
export {
  ContentTypeFilter,
  getContentTypePlaceholder,
} from "./ContentTypeFilter";
export type {
  ContentType,
  ContentTypeFacets,
  ContentTypeFilterProps,
  ContentTypeIcons,
  ContentTypeOption,
} from "./ContentTypeFilter";
export { FilterBar } from "./FilterBar";
export type { FilterBarProps, FilterOption, QuickFilter } from "./FilterBar";
export { MobileFilterDrawer } from "./MobileFilterDrawer";
export type { MobileFilterDrawerProps } from "./MobileFilterDrawer";
export { SearchableDropdown } from "./SearchableDropdown";
export type {
  DropdownOption,
  SearchableDropdownProps,
} from "./SearchableDropdown";
export { SearchInput } from "./SearchInput";

export { SearchFilters } from "./SearchFilters";
export type {
  AdvancedSearchFilters,
  SearchFiltersProps,
} from "./SearchFilters";

export { SearchResults } from "./SearchResults";
export type { SearchResultItem, SearchResultsProps } from "./SearchResults";
