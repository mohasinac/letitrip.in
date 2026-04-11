/**
 * UI Components Index
 *
 * Letitrip-specific UI wrappers only.
 * Shared primitives must be imported directly from @mohasinac/appkit/ui.
 *
 * @example
 * ```tsx
 * import { Card, SideDrawer } from "@/components";
 * ```
 */

export { default as Card, CardHeader, CardBody, CardFooter } from "./Card";
export { BaseListingCard } from "./BaseListingCard";
export {
  Button,
  Badge,
  Spinner,
  Divider,
  Tooltip,
  Pagination,
  Progress,
  IndeterminateProgress,
  StatusBadge,
  ViewToggle,
  ItemRow,
  HorizontalScroller,
  ListingLayout,
  BulkActionBar,
  SortDropdown,
  TablePagination,
  Skeleton,
} from "@mohasinac/appkit/ui";
export type {
  ViewMode,
  ItemRowProps,
  HorizontalScrollerProps,
  PerViewConfig,
  ListingLayoutProps,
  BulkActionBarProps,
  BulkActionItem,
  SortOption,
  SortDropdownProps,
  TablePaginationProps,
} from "@mohasinac/appkit/ui";
export { default as Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";
export {
  default as Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
} from "./Dropdown";
export { default as Accordion, AccordionItem } from "./Accordion";
export { default as Avatar, AvatarGroup } from "./Avatar";
export {
  default as Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
} from "./Menu";
export { default as ImageGallery } from "./ImageGallery";
export type { GalleryImage } from "./ImageGallery";
export { default as SideDrawer } from "./SideDrawer";
export { FlowDiagram } from "./FlowDiagram";
export type { FlowStep, FlowDiagramProps } from "./FlowDiagram";

// Phase 2: Shared UI Primitives
export { FilterFacetSection } from "./FilterFacetSection";
export { FilterDrawer } from "./FilterDrawer";
export { ActiveFilterChips } from "./ActiveFilterChips";
export type { ActiveFilter } from "./ActiveFilterChips";

// Phase 3: Shared UI Infrastructure
export { SectionTabs } from "./SectionTabs";
export type { SectionTab } from "./SectionTabs";
export { RoleBadge } from "./RoleBadge";
export { EmptyState } from "./EmptyState";

// Accessibility
export { SkipToMain } from "./SkipToMain";

// Generic dynamic select (react-select-like, portal-based)
export { DynamicSelect } from "./DynamicSelect";
export type {
  DynamicSelectOption,
  AsyncPage,
  DynamicSelectProps,
} from "./DynamicSelect";
