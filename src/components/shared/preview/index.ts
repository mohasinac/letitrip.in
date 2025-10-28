// Shared preview components
export { IconPreview, getMuiIcon } from "./IconPreview";
export { ImagePreview } from "./ImagePreview";

// Types
export interface IconPreviewProps {
  iconName: string | null | undefined;
  size?: number;
  sx?: any;
}

export interface ImagePreviewProps {
  imageUrl: string | null | undefined;
  useCache?: boolean;
  cacheDuration?: number;
  sx?: any;
}
