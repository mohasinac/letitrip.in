"use client";

import { useState, useRef, useCallback } from "react";
import { storage, auth } from "@/lib/firebase/config";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { ERROR_MESSAGES } from "@/constants";

export interface UploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  onUploadStart?: () => void;
  onUploadSuccess?: (downloadURL: string) => Promise<void> | void;
  onUploadError?: (error: string) => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: string) => void;
}

export interface UploadState {
  uploading: boolean;
  saving: boolean;
  error: string | null;
  downloadURL: string | null;
}

/**
 * Hook for handling Firebase Storage uploads with automatic cleanup
 *
 * Features:
 * - Validates file before upload
 * - Uploads to Firebase Storage
 * - Calls onUploadSuccess to save metadata (e.g., to Firestore)
 * - Automatically deletes from storage if save fails
 * - Cleans up on component unmount if save incomplete
 *
 * @example
 * ```tsx
 * const { upload, state, cancel } = useStorageUpload({
 *   onUploadSuccess: async (url) => {
 *     await updateDoc(userRef, { photoURL: url });
 *   },
 *   onSaveSuccess: () => {
 *     console.log('Profile updated!');
 *   },
 * });
 *
 * // Upload file
 * await upload(file, 'users/123/profile/avatar.jpg');
 * ```
 */
export function useStorageUpload(options: UploadOptions = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
    onUploadStart,
    onUploadSuccess,
    onUploadError,
    onSaveSuccess,
    onSaveError,
  } = options;

  const [state, setState] = useState<UploadState>({
    uploading: false,
    saving: false,
    error: null,
    downloadURL: null,
  });

  // Track uploaded file reference for cleanup
  const uploadedFileRef = useRef<string | null>(null);
  const saveCompletedRef = useRef(false);

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `${ERROR_MESSAGES.UPLOAD.INVALID_TYPE}. Allowed: ${allowedTypes.join(", ")}`;
    }

    if (file.size > maxSize) {
      const sizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      return `${ERROR_MESSAGES.UPLOAD.FILE_TOO_LARGE} (${sizeMB}MB)`;
    }

    return null;
  };

  const cleanupUploadedFile = async (filePath: string) => {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      console.log("Cleaned up uploaded file:", filePath);
    } catch (err) {
      console.error(ERROR_MESSAGES.UPLOAD.CLEANUP_FAILED, err);
    }
  };

  const upload = useCallback(
    async (file: File, storagePath: string, oldFileURL?: string) => {
      // Reset state
      setState({
        uploading: false,
        saving: false,
        error: null,
        downloadURL: null,
      });
      saveCompletedRef.current = false;

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setState((prev) => ({ ...prev, error: validationError }));
        onUploadError?.(validationError);
        return;
      }

      // Check authentication
      const currentUser = auth.currentUser;
      if (!currentUser) {
        const error = ERROR_MESSAGES.UPLOAD.AUTH_REQUIRED;
        setState((prev) => ({ ...prev, error }));
        onUploadError?.(error);
        return;
      }

      // Start upload
      setState((prev) => ({ ...prev, uploading: true }));
      onUploadStart?.();

      try {
        // Delete old file if exists
        if (oldFileURL && oldFileURL.includes("firebase")) {
          try {
            const oldRef = ref(storage, oldFileURL);
            await deleteObject(oldRef);
            // Old file deleted successfully (silent)
          } catch (err: any) {
            // Silence 'object not found' errors - this is expected for first uploads
            if (err?.code !== "storage/object-not-found") {
              console.error(ERROR_MESSAGES.UPLOAD.DELETE_OLD_FILE_FAILED, err);
            }
          }
        }

        // Upload new file
        const storageRef = ref(storage, storagePath);
        const snapshot = await uploadBytes(storageRef, file, {
          contentType: file.type,
          customMetadata: {
            uploadedBy: currentUser.uid,
            uploadedAt: new Date().toISOString(),
          },
        });

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedFileRef.current = storagePath;

        setState((prev) => ({
          ...prev,
          uploading: false,
          downloading: true,
          downloadURL,
        }));

        // Call onUploadSuccess to save metadata (e.g., to Firestore)
        if (onUploadSuccess) {
          setState((prev) => ({ ...prev, saving: true }));

          try {
            await onUploadSuccess(downloadURL);

            // Save successful
            saveCompletedRef.current = true;
            uploadedFileRef.current = null;

            setState((prev) => ({
              ...prev,
              saving: false,
              error: null,
            }));

            onSaveSuccess?.();
          } catch (saveError) {
            // Save failed - cleanup uploaded file
            console.error(ERROR_MESSAGES.UPLOAD.SAVE_ROLLBACK, saveError);

            await cleanupUploadedFile(storagePath);
            uploadedFileRef.current = null;

            const errorMessage =
              saveError instanceof Error
                ? saveError.message
                : ERROR_MESSAGES.UPLOAD.SAVE_FAILED;

            setState((prev) => ({
              ...prev,
              saving: false,
              error: errorMessage,
              downloadURL: null,
            }));

            onSaveError?.(errorMessage);
          }
        } else {
          // No save callback, consider upload complete
          saveCompletedRef.current = true;
          uploadedFileRef.current = null;
          setState((prev) => ({ ...prev, uploading: false }));
        }
      } catch (uploadError) {
        console.error(ERROR_MESSAGES.UPLOAD.UPLOAD_ERROR, uploadError);

        const errorMessage =
          uploadError instanceof Error
            ? uploadError.message
            : ERROR_MESSAGES.UPLOAD.UPLOAD_FAILED;

        setState((prev) => ({
          ...prev,
          uploading: false,
          error: errorMessage,
        }));

        onUploadError?.(errorMessage);
      }
    },
    [
      allowedTypes,
      maxSize,
      onUploadStart,
      onUploadSuccess,
      onUploadError,
      onSaveSuccess,
      onSaveError,
    ],
  );

  const cancel = useCallback(async () => {
    if (uploadedFileRef.current && !saveCompletedRef.current) {
      await cleanupUploadedFile(uploadedFileRef.current);
      uploadedFileRef.current = null;
    }

    setState({
      uploading: false,
      saving: false,
      error: null,
      downloadURL: null,
    });
  }, []);

  // Cleanup on unmount if save incomplete
  const cleanup = useCallback(async () => {
    if (uploadedFileRef.current && !saveCompletedRef.current) {
      console.log("Component unmounting with incomplete save, cleaning up...");
      await cleanupUploadedFile(uploadedFileRef.current);
    }
  }, []);

  return {
    upload,
    cancel,
    cleanup,
    state,
    isUploading: state.uploading,
    isSaving: state.saving,
    isProcessing: state.uploading || state.saving,
    error: state.error,
    downloadURL: state.downloadURL,
  };
}
