// Generic admin UI primitives — domain-agnostic, usable across features
export { AdminStatsCards } from "./AdminStatsCards";
export { RichTextEditor } from "./RichTextEditor";
export { GridEditor } from "./GridEditor";
export { ImageUpload } from "./ImageUpload";
export type { ImageUploadProps } from "./ImageUpload";
export { MediaUploadField } from "./MediaUploadField";
export type { MediaUploadFieldProps } from "./MediaUploadField";
export { DataTable } from "./DataTable";
export { CategoryTreeView } from "./CategoryTreeView";
export { default as BackgroundSettings } from "./BackgroundSettings";

// Shared Admin Infrastructure
export { AdminPageHeader } from "./AdminPageHeader";
export { AdminFilterBar } from "./AdminFilterBar";
export { DrawerFormFooter } from "./DrawerFormFooter";

// Admin Dashboard skeletons/generic cards (domain-agnostic)
export { RecentActivityCard, AdminDashboardSkeleton } from "./dashboard";

// Admin Media tools (used across domains)
export { MediaOperationForm, getMediaTableColumns } from "./media";
export type { MediaOperation } from "./media";
