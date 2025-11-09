/**
 * Upload Manager Utility
 *
 * Handles failed uploads, retry logic, and upload persistence
 */

export interface FailedUpload {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  error: string;
  timestamp: number;
  retryCount: number;
  context?: {
    resourceType?: string;
    resourceId?: string;
    fieldName?: string;
  };
}

const STORAGE_KEY = "failed_uploads";
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds

/**
 * Save failed upload to localStorage
 */
export function saveFailedUpload(upload: FailedUpload): void {
  try {
    const failed = getFailedUploads();
    failed.push(upload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(failed));
  } catch (error) {
    console.error("Failed to save upload:", error);
  }
}

/**
 * Get all failed uploads from localStorage
 */
export function getFailedUploads(): FailedUpload[] {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error("Failed to load uploads:", error);
    return [];
  }
}

/**
 * Remove failed upload from localStorage
 */
export function removeFailedUpload(id: string): void {
  try {
    const failed = getFailedUploads();
    const updated = failed.filter((u) => u.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to remove upload:", error);
  }
}

/**
 * Clear all failed uploads
 */
export function clearFailedUploads(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear uploads:", error);
  }
}

/**
 * Get failed uploads for a specific resource
 */
export function getFailedUploadsForResource(
  resourceType: string,
  resourceId: string,
): FailedUpload[] {
  const failed = getFailedUploads();
  return failed.filter(
    (u) =>
      u.context?.resourceType === resourceType &&
      u.context?.resourceId === resourceId,
  );
}

/**
 * Check if upload should be retried
 */
export function shouldRetry(upload: FailedUpload): boolean {
  return upload.retryCount < MAX_RETRY_COUNT;
}

/**
 * Get retry delay based on attempt count (exponential backoff)
 */
export function getRetryDelay(retryCount: number): number {
  return RETRY_DELAY_MS * Math.pow(2, retryCount);
}

/**
 * Retry upload with exponential backoff
 */
export async function retryUploadWithDelay(
  uploadFn: () => Promise<string>,
  retryCount: number,
): Promise<string> {
  if (retryCount >= MAX_RETRY_COUNT) {
    throw new Error("Maximum retry attempts reached");
  }

  const delay = getRetryDelay(retryCount);
  await new Promise((resolve) => setTimeout(resolve, delay));

  try {
    return await uploadFn();
  } catch (error) {
    // If retry fails, try again with increased count
    return retryUploadWithDelay(uploadFn, retryCount + 1);
  }
}

/**
 * Clean up old failed uploads (older than 7 days)
 */
export function cleanupOldFailedUploads(): void {
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const failed = getFailedUploads();
  const now = Date.now();

  const recent = failed.filter((u) => now - u.timestamp < SEVEN_DAYS_MS);

  if (recent.length !== failed.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  }
}

/**
 * Get upload statistics
 */
export function getUploadStats(): {
  total: number;
  canRetry: number;
  maxedOut: number;
  byResourceType: Record<string, number>;
} {
  const failed = getFailedUploads();

  const stats = {
    total: failed.length,
    canRetry: failed.filter(shouldRetry).length,
    maxedOut: failed.filter((u) => !shouldRetry(u)).length,
    byResourceType: {} as Record<string, number>,
  };

  failed.forEach((upload) => {
    const resourceType = upload.context?.resourceType || "unknown";
    stats.byResourceType[resourceType] =
      (stats.byResourceType[resourceType] || 0) + 1;
  });

  return stats;
}

/**
 * Initialize upload manager (run on app start)
 */
export function initUploadManager(): void {
  // Clean up old failed uploads
  cleanupOldFailedUploads();

  // Set up periodic cleanup (every hour)
  if (typeof window !== "undefined") {
    setInterval(cleanupOldFailedUploads, 60 * 60 * 1000);
  }
}

/**
 * Create upload context for saving failed uploads
 */
export function createUploadContext(
  resourceType: string,
  resourceId: string,
  fieldName?: string,
): FailedUpload["context"] {
  return {
    resourceType,
    resourceId,
    fieldName,
  };
}
