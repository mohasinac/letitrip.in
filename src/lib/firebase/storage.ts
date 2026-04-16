/**
 * letitrip Firebase Storage helpers — thin adapter.
 *
 * Binds the letitrip Firebase storage instance to the generic helpers from appkit.
 * Import from this file for convenience, or use createStorageHelpers directly.
 */
import { storage } from "./config";
import {
  createStorageHelpers,
  STORAGE_PATHS,
  validateFileSize,
  validateFileType,
  validateImage,
} from "@mohasinac/appkit/providers/storage-firebase/client";

const helpers = createStorageHelpers(storage);

export { STORAGE_PATHS, validateFileSize, validateFileType, validateImage };
export const {
  uploadFile,
  uploadFileWithProgress,
  uploadProfilePhoto,
  uploadDocument,
  getFileUrl,
  deleteFile,
  deleteProfilePhoto,
  listFiles,
  getFileMetadata,
  updateFileMetadata,
  deleteFolder,
} = helpers;
