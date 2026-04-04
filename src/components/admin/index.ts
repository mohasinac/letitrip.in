// Generic admin UI primitives — domain-agnostic, usable across features
export { ImageUpload, MediaUploadField } from "@mohasinac/feat-media";
export type {
  ImageUploadProps,
  MediaUploadFieldProps,
} from "@mohasinac/feat-media";
export { DataTable } from "@mohasinac/ui";
export type { DataTableColumn } from "@mohasinac/ui";

// Shared Admin Infrastructure
export { AdminPageHeader } from "./AdminPageHeader";
export { AdminFilterBar } from "./AdminFilterBar";
export { DrawerFormFooter } from "./DrawerFormFooter";
