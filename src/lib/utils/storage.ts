/**
 * Storage URL utilities for caching and image retrieval
 */

/**
 * Convert a Firebase Storage path to a cached API URL
 *
 * @param path - The file path in storage (e.g., "uploads/image-uuid.jpg")
 * @param cacheDuration - Optional cache duration in seconds (default: 86400 = 24 hours)
 * @returns The API endpoint URL with cache parameters
 *
 * @example
 * // Get image with default 24-hour cache
 * const url = getStorageImageUrl("uploads/abc123.jpg");
 *
 * // Get image with 1-hour cache
 * const url = getStorageImageUrl("uploads/abc123.jpg", 3600);
 */
export function getStorageImageUrl(
  path: string,
  cacheDuration: number = 86400,
): string {
  if (!path) return "";

  // If it's already a full URL, return as-is
  if (path.startsWith("http")) {
    return path;
  }

  // Encode path to handle special characters
  const encodedPath = encodeURIComponent(path);

  // Return API endpoint with cache parameter
  return `/api/storage/get?path=${encodedPath}&cache=${Math.max(0, Math.min(cacheDuration, 2592000))}`;
}

/**
 * Get a Firebase Storage public URL (for direct access without caching)
 *
 * @param path - The file path in storage
 * @param bucket - Optional Firebase bucket name (defaults to environment variable)
 * @returns The direct Firebase Storage URL
 */
export function getStoragePublicUrl(path: string, bucket?: string): string {
  if (!path) return "";

  const bucketName = bucket || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    console.warn("Firebase storage bucket not configured");
    return "";
  }

  return `https://storage.googleapis.com/${bucketName}/${path}`;
}

/**
 * Build a complete image URL from a storage path
 * Automatically selects between cached API endpoint or direct URL based on context
 *
 * @param path - The file path in storage
 * @param useCache - Whether to use the cached API endpoint (default: true)
 * @param cacheDuration - Cache duration in seconds (ignored if useCache is false)
 * @returns The image URL
 */
export function getImageUrl(
  path: string,
  useCache: boolean = true,
  cacheDuration: number = 86400,
): string {
  if (!path) return "";

  if (useCache) {
    return getStorageImageUrl(path, cacheDuration);
  } else {
    return getStoragePublicUrl(path);
  }
}
