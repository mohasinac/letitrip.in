/**
 * Product utility functions
 */

/**
 * Get product image URL with fallback support for both old and new formats
 * Supports:
 * - New format: product.images[0].url
 * - Old format: product.media.images[0].url
 * - Legacy format: product.image
 * 
 * @param product - Product object with images
 * @param index - Image index (default: 0 for main image)
 * @param fallback - Fallback URL if no image found
 * @returns Image URL string
 */
export function getProductImageUrl(
  product: any,
  index: number = 0,
  fallback: string = "/assets/placeholder.png"
): string {
  // Try new format: product.images[index].url
  if (product.images?.[index]?.url) {
    return product.images[index].url;
  }

  // Try old format: product.media.images[index].url
  if (product.media?.images?.[index]?.url) {
    return product.media.images[index].url;
  }

  // Try legacy single image format
  if (product.image) {
    return product.image;
  }

  // Return fallback
  return fallback;
}

/**
 * Get all product images with fallback support
 * @param product - Product object with images
 * @returns Array of image objects
 */
export function getProductImages(product: any): Array<{ url: string; alt?: string }> {
  // Try new format first
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images;
  }

  // Try old format
  if (product.media?.images && Array.isArray(product.media.images) && product.media.images.length > 0) {
    return product.media.images;
  }

  // Try legacy single image
  if (product.image) {
    return [{ url: product.image, alt: product.name }];
  }

  // Return empty array
  return [];
}

/**
 * Check if product has images
 * @param product - Product object
 * @returns boolean
 */
export function hasProductImages(product: any): boolean {
  return getProductImages(product).length > 0;
}
