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
export { default as NotificationBell } from "./NotificationBell";
