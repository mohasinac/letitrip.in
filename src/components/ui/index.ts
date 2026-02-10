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
