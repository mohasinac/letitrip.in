/**
 * UI Components Index
 *
 * Basic UI building blocks like buttons, cards, and badges.
 *
 * @example
 * ```tsx
 * import { Button, Card, Badge } from '@/components/ui';
 * ```
 */

export { default as Button } from "./Button";
export { default as Card, CardHeader, CardBody, CardFooter } from "./Card";
export { BaseListingCard } from "./BaseListingCard";
export { default as Badge } from "./Badge";
export { default as Spinner } from "./Spinner";
export { default as Divider } from "./Divider";
export { default as Tooltip } from "./Tooltip";
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
export { default as Progress, IndeterminateProgress } from "./Progress";
export { default as Pagination } from "./Pagination";
export {
  default as Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
} from "./Menu";
export {
  default as Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
} from "./Skeleton";
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
export { SortDropdown } from "./SortDropdown";
export { TablePagination } from "./TablePagination";

// Phase 3: Shared UI Infrastructure
export { SectionTabs } from "./SectionTabs";
export type { SectionTab } from "./SectionTabs";
export { StatusBadge } from "./StatusBadge";
export { RoleBadge } from "./RoleBadge";
export { EmptyState } from "./EmptyState";

// Phase 10: Generic Layout Primitives
export {
  StepperNav,
  StatsGrid,
  RatingDisplay,
  CountdownDisplay,
  PriceDisplay,
  TagInput,
} from "@mohasinac/appkit/ui";
export type {
  StepperNavProps,
  StatsGridProps,
  StatItem,
  RatingDisplayProps,
  CountdownDisplayProps,
  PriceDisplayProps,
  TagInputProps,
} from "@mohasinac/appkit/ui";
export { ItemRow } from "./ItemRow";
export type { ItemRowProps } from "./ItemRow";
export { SummaryCard } from "@mohasinac/appkit/ui";
export type { SummaryCardProps, SummaryLine } from "@mohasinac/appkit/ui";

// Horizontal scroll container with arrows, auto-scroll, and circular mode
export { HorizontalScroller } from "./HorizontalScroller";
export type {
  HorizontalScrollerProps,
  PerViewConfig,
} from "./HorizontalScroller";

// Listing page layout shell (filter sidebar + toolbar + bulk actions)
export { ListingLayout } from "./ListingLayout";
export type { ListingLayoutProps } from "./ListingLayout";

// Bulk action bar (appears when items are selected)
export { BulkActionBar } from "./BulkActionBar";
export type { BulkActionBarProps, BulkActionItem } from "./BulkActionBar";

// Phase 11: Camera capture
export { CameraCapture } from "./CameraCapture.client";
export type { CameraCaptureProps } from "./CameraCapture.client";

// Accessibility
export { SkipToMain } from "./SkipToMain";

// Grid / list view mode toggle
export { ViewToggle } from "./ViewToggle";
export type { ViewToggleProps, ViewMode } from "./ViewToggle";

// Generic dynamic select (react-select-like, portal-based)
export { DynamicSelect } from "./DynamicSelect";
export type {
  DynamicSelectOption,
  AsyncPage,
  DynamicSelectProps,
} from "./DynamicSelect";
