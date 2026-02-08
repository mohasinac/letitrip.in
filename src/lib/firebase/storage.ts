/**
 * Firebase Cloud Storage Helpers
 *
 * Utilities for uploading, downloading, and managing files in Firebase Storage.
 * Supports user profile photos, trip images, and document uploads.
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
  UploadResult,
  UploadTask,
  StorageReference,
} from "firebase/storage";
import { storage } from "./config";
import { DatabaseError } from "@/lib/errors";

/**
 * Storage folder structure
 */
export const STORAGE_PATHS = {
  USERS: "users",
  PRODUCTS: "products",
  ORDERS: "orders",
  PUBLIC: "public",
} as const;

/**
 * Upload file to storage
 */
export async function uploadFile(
  path: string,
  file: File,
  metadata?: { contentType?: string; customMetadata?: Record<string, string> },
): Promise<{ url: string; ref: StorageReference; uploadResult: UploadResult }> {
  try {
    const storageRef = ref(storage, path);

    const uploadMetadata = {
      contentType: metadata?.contentType || file.type,
      customMetadata: metadata?.customMetadata || {},
    };

    const uploadResult = await uploadBytes(storageRef, file, uploadMetadata);
    const url = await getDownloadURL(uploadResult.ref);

    return { url, ref: uploadResult.ref, uploadResult };
  } catch (error: any) {
    console.error("Upload error:", error);
    throw new DatabaseError(error.message || "Failed to upload file", {
      path,
      fileType: file.type,
      fileName: file.name,
    });
  }
}

/**
 * Upload file with progress tracking
 */
export function uploadFileWithProgress(
  path: string,
  file: File,
  onProgress?: (progress: number) => void,
  metadata?: { contentType?: string; customMetadata?: Record<string, string> },
): UploadTask {
  const storageRef = ref(storage, path);

  const uploadMetadata = {
    contentType: metadata?.contentType || file.type,
    customMetadata: metadata?.customMetadata || {},
  };

  const uploadTask = uploadBytesResumable(storageRef, file, uploadMetadata);

  uploadTask.on("state_changed", (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    onProgress?.(progress);
  });

  return uploadTask;
}

/**
 * Upload user profile photo
 */
export async function uploadProfilePhoto(
  userId: string,
  file: File,
): Promise<string> {
  const path = `${STORAGE_PATHS.USERS}/${userId}/profile.jpg`;
  const { url } = await uploadFile(path, file, {
    contentType: "image/jpeg",
    customMetadata: { userId, type: "profile" },
  });
  return url;
}

/**
 * Upload user document
 */
export async function uploadDocument(
  userId: string,
  file: File,
  folder: string = "documents",
): Promise<string> {
  const path = `${STORAGE_PATHS.USERS}/${userId}/${folder}/${Date.now()}_${file.name}`;
  const { url } = await uploadFile(path, file, {
    contentType: file.type,
    customMetadata: { userId, folder },
  });
  return url;
}

/**
 * Get download URL for existing file
 */
export async function getFileUrl(path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error: any) {
    console.error("Get URL error:", error);
    throw new DatabaseError(error.message || "Failed to get file URL", {
      path,
    });
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error: any) {
    console.error("Delete error:", error);
    throw new DatabaseError(error.message || "Failed to delete file", { path });
  }
}

/**
 * Delete user profile photo
 */
export async function deleteProfilePhoto(userId: string): Promise<void> {
  const path = `${STORAGE_PATHS.USERS}/${userId}/profile.jpg`;
  await deleteFile(path);
}

/**
 * List all files in a folder
 */
export async function listFiles(
  folderPath: string,
): Promise<StorageReference[]> {
  try {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);
    return result.items;
  } catch (error: any) {
    console.error("List files error:", error);
    throw new DatabaseError(error.message || "Failed to list files", {
      folderPath,
    });
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(path: string) {
  try {
    const storageRef = ref(storage, path);
    return await getMetadata(storageRef);
  } catch (error: any) {
    console.error("Get metadata error:", error);
    throw new DatabaseError(error.message || "Failed to get file metadata", {
      path,
    });
  }
}

/**
 * Update file metadata
 */
export async function updateFileMetadata(
  path: string,
  metadata: { contentType?: string; customMetadata?: Record<string, string> },
) {
  try {
    const storageRef = ref(storage, path);
    return await updateMetadata(storageRef, metadata);
  } catch (error: any) {
    console.error("Update metadata error:", error);
    throw new DatabaseError(error.message || "Failed to update file metadata", {
      path,
      metadata,
    });
  }
}

/**
 * Delete all files in a folder
 */
export async function deleteFolder(folderPath: string): Promise<void> {
  try {
    const files = await listFiles(folderPath);
    await Promise.all(files.map((file) => deleteObject(file)));
  } catch (error: any) {
    console.error("Delete folder error:", error);
    throw new DatabaseError(error.message || "Failed to delete folder", {
      folderPath,
    });
  }
}

/**

 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Validate file type
 */
export function validateFileType(
  file: File,
  allowedTypes: string[] = ["image/jpeg", "image/png", "image/webp"],
): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate image file
 */
export function validateImage(
  file: File,
  maxSizeMB: number = 10,
): { valid: boolean; error?: string } {
  if (
    !validateFileType(file, [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ])
  ) {
    return {
      valid: false,
      error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
    };
  }

  if (!validateFileSize(file, maxSizeMB)) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit.` };
  }

  return { valid: true };
}

/**
 * Validate document file
 */
export function validateDocument(
  file: File,
  maxSizeMB: number = 50,
): { valid: boolean; error?: string } {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  if (!validateFileType(file, allowedTypes)) {
    return {
      valid: false,
      error: "Invalid file type. Only PDF, DOC, DOCX, and TXT are allowed.",
    };
  }

  if (!validateFileSize(file, maxSizeMB)) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit.` };
  }

  return { valid: true };
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop();
  return `${timestamp}_${randomString}.${extension}`;
}
