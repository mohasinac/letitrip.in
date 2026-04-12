// Generic admin UI primitives — domain-agnostic, usable across features
export { ImageUpload, MediaUploadField } from "@mohasinac/appkit/features/media";
export type {
  ImageUploadProps,
  MediaUploadFieldProps,
} from "@mohasinac/appkit/features/media";
export { DataTable } from "@mohasinac/appkit/ui";
export type { DataTableColumn } from "@mohasinac/appkit/ui";

// Shared Admin Infrastructure
export { AdminPageHeader } from "./AdminPageHeader";
export { AdminFilterBar } from "./AdminFilterBar";
export { DrawerFormFooter } from "./DrawerFormFooter";
