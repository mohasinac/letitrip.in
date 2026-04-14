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

export { Card, CardHeader, CardBody, CardFooter } from "@mohasinac/appkit/ui";
export { BaseListingCard } from "@mohasinac/appkit/ui";
export type {
  BaseListingCardRootProps,
  BaseListingCardHeroProps,
  BaseListingCardInfoProps,
  BaseListingCardCheckboxProps,
} from "@mohasinac/appkit/ui";
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
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  Avatar,
  AvatarGroup,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
} from "@mohasinac/appkit/ui";
export { ImageGallery } from "@mohasinac/appkit/ui";
export type { GalleryImage } from "@mohasinac/appkit/ui";
export { default as SideDrawer } from "./SideDrawer";
export { FlowDiagram } from "@mohasinac/appkit/ui";
export type { FlowStep, FlowDiagramProps } from "@mohasinac/appkit/ui";

// Phase 2: Shared UI Primitives (FilterFacetSection is in the filters barrel)
export { FilterDrawer } from "@mohasinac/appkit/ui";

// Phase 3: Shared UI Infrastructure
export { RoleBadge, EmptyState } from "@mohasinac/appkit/ui";

// Accessibility
export { SkipToMain } from "@mohasinac/appkit/ui";

// Generic dynamic select (react-select-like, portal-based)
export { DynamicSelect } from "@mohasinac/appkit/ui";
export type {
  DynamicSelectOption,
  AsyncPage,
  DynamicSelectProps,
} from "@mohasinac/appkit/ui";
