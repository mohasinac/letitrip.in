// Generic admin UI primitives — domain-agnostic, usable across features
export { ImageUpload, MediaUploadField } from "./media-upload.client";
export type {
  ImageUploadProps,
  MediaUploadFieldProps,
} from "./media-upload.client";
export { DataTable } from "@mohasinac/appkit/ui";
export type { DataTableColumn } from "@mohasinac/appkit/ui";

// Shared Admin Infrastructure
export { AdminPageHeader } from "./AdminPageHeader";
export { AdminFilterBar } from "./AdminFilterBar";
export { DrawerFormFooter } from "./DrawerFormFooter";
