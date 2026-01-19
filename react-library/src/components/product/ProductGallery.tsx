/**
 * ProductGallery - Wrapper for MediaGallery
 *
 * @deprecated Use MediaGallery from @letitrip/react-library/media instead
 */

import type { MediaGalleryProps } from "../media/MediaGallery";
import { MediaGallery } from "../media/MediaGallery";

export interface GalleryMedia {
  url: string;
  type: "image" | "video";
  alt?: string;
}

export interface ProductGalleryProps
  extends Omit<MediaGalleryProps, "resourceName"> {
  productName: string;
}

export function ProductGallery({ productName, ...props }: ProductGalleryProps) {
  return <MediaGallery resourceName={productName} {...props} />;
}
