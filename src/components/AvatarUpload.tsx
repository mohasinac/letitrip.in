"use client";

import { useState, useRef, useEffect } from "react";
import { useStorageUpload } from "@/hooks";
import {
  Button,
  Alert,
  ImageCropModal,
  AvatarDisplay,
  Progress,
  useToast,
  Text,
} from "@/components";
import type { ImageCropData } from "@/components";
import {
  THEME_CONSTANTS,
  UI_LABELS,
  UI_HELP_TEXT,
  SUCCESS_MESSAGES,
} from "@/constants";

interface AvatarUploadProps {
  currentPhotoURL?: string | null;
  currentCropData?: ImageCropData | null;
  userId: string;
  onUploadSuccess?: (
    photoURL: string,
    cropData: ImageCropData,
  ) => Promise<void> | void;
  onUploadError?: (error: string) => void;
  /** Called after a successful save so the parent can refresh user data */
  onSaveComplete?: () => void;
  /** Called when pending (unsaved) state changes so the parent can track dirty state */
  onPendingStateChange?: (hasPending: boolean) => void;
}

export function AvatarUpload({
  currentPhotoURL,
  currentCropData,
  userId,
  onUploadSuccess,
  onUploadError,
  onSaveComplete,
  onPendingStateChange,
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentPhotoURL || null,
  );
  const [cropData, setCropData] = useState<ImageCropData | null>(
    currentCropData || null,
  );
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Pending state: crop is done, waiting for user to click Save Avatar
  const [pendingCropData, setPendingCropData] = useState<ImageCropData | null>(
    null,
  );
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const { upload, cancel, cleanup, state, isProcessing } = useStorageUpload({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    onUploadSuccess: async (downloadURL) => {
      setUploadProgress(70);
      // Call the parent's onUploadSuccess with URL and crop data
      if (onUploadSuccess && pendingCropData) {
        await onUploadSuccess(downloadURL, pendingCropData);
      }
      setUploadProgress(100);
      setPreviewUrl(downloadURL);
      setCropData(pendingCropData);

      // Clear pending state
      setPendingCropData(null);
      setPendingUploadFile(null);

      // Show success toast
      showToast(SUCCESS_MESSAGES.UPLOAD.AVATAR_UPLOADED, "success");

      // Notify parent to refresh user data
      onSaveComplete?.();

      // Reset progress after a brief moment
      setTimeout(() => setUploadProgress(0), 1000);
    },
    onUploadError: (error) => {
      onUploadError?.(error);
      setUploadProgress(0);
      // Revert to current saved state (don't clear pending so user can retry)
    },
    onSaveError: (error) => {
      onUploadError?.(error);
      setUploadProgress(0);
      setPreviewUrl(currentPhotoURL || null);
      setCropData(currentCropData || null);
    },
  });

  // Cleanup on unmount if upload incomplete
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Notify parent when pending state changes
  useEffect(() => {
    const hasPending = pendingCropData !== null && pendingUploadFile !== null;
    onPendingStateChange?.(hasPending);
  }, [pendingCropData, pendingUploadFile, onPendingStateChange]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create temporary preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImageUrl(reader.result as string);
      setPendingFile(file);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  // When user finishes cropping in the modal, store pending state (no upload yet)
  const handleCropSave = (newCropData: ImageCropData) => {
    if (!pendingFile) return;

    // Store pending crop data and file — show preview, wait for explicit Save
    setPendingCropData(newCropData);
    setPendingUploadFile(pendingFile);

    // Cleanup modal state
    setTempImageUrl(null);
    setPendingFile(null);
    setShowCropModal(false);
  };

  // User explicitly clicks "Save Avatar" — now upload + save
  const handleConfirmSave = async () => {
    if (!pendingUploadFile || !pendingCropData) return;

    setUploadProgress(10);

    const fileExtension = pendingUploadFile.name.split(".").pop();
    const fileName = `avatar.${fileExtension}`;
    const storagePath = `users/${userId}/profile/${fileName}`;

    setUploadProgress(30);
    await upload(pendingUploadFile, storagePath, currentPhotoURL || undefined);
  };

  // User cancels the pending avatar change
  const handleCancelPending = () => {
    setPendingCropData(null);
    setPendingUploadFile(null);
    setUploadProgress(0);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setTempImageUrl(null);
    setPendingFile(null);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = async () => {
    if (currentPhotoURL) {
      try {
        await onUploadSuccess?.("", {
          url: "",
          position: { x: 50, y: 50 },
          zoom: 1,
        });
        setPreviewUrl(null);
        setCropData(null);
        setPendingCropData(null);
        setPendingUploadFile(null);
        onSaveComplete?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to remove photo";
        onUploadError?.(errorMessage);
      }
    } else {
      setPreviewUrl(null);
      setCropData(null);
      setPendingCropData(null);
      setPendingUploadFile(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasPendingChange =
    pendingCropData !== null && pendingUploadFile !== null;
  const isBusy = isProcessing || uploadProgress > 0;

  return (
    <>
      <div className={THEME_CONSTANTS.spacing.stack}>
        <div className="flex items-start gap-6">
          {/* Avatar Preview — show pending crop if available */}
          <div className="flex-shrink-0">
            <AvatarDisplay
              cropData={hasPendingChange ? pendingCropData : cropData}
              size="2xl"
              className={`border-4 ${hasPendingChange ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800" : THEME_CONSTANTS.themed.border}`}
            />
          </div>

          {/* Upload Controls */}
          <div className="flex-1 space-y-3">
            <div>
              <Text variant="secondary" className="text-sm mb-2">
                {UI_HELP_TEXT.AVATAR_UPLOAD}
              </Text>
              <Text variant="secondary" className="text-xs">
                {UI_HELP_TEXT.AVATAR_FORMATS}
              </Text>
            </div>

            {/* Progress Bar — visible during upload/save */}
            {isBusy && (
              <div className="space-y-1">
                <Progress
                  value={uploadProgress}
                  variant={uploadProgress >= 100 ? "success" : "primary"}
                  size="sm"
                  showValue
                  label={
                    state.uploading
                      ? UI_LABELS.AVATAR.UPLOADING
                      : state.saving
                        ? UI_LABELS.AVATAR.SAVING
                        : undefined
                  }
                />
              </div>
            )}

            {/* Pending change notice + Save/Cancel buttons */}
            {hasPendingChange && !isBusy && (
              <div className="space-y-2">
                <Text
                  variant="secondary"
                  className="text-xs text-blue-600 dark:text-blue-400"
                >
                  {UI_LABELS.AVATAR.READY_TO_SAVE}
                </Text>
                <div className="flex gap-3">
                  <Button
                    onClick={handleConfirmSave}
                    variant="primary"
                    size="sm"
                  >
                    {UI_LABELS.AVATAR.SAVE_AVATAR}
                  </Button>
                  <Button
                    onClick={handleCancelPending}
                    variant="secondary"
                    size="sm"
                  >
                    {UI_LABELS.AVATAR.CANCEL_CHANGE}
                  </Button>
                </div>
              </div>
            )}

            {/* Default controls — choose / remove image */}
            {!hasPendingChange && !isBusy && (
              <div className="flex gap-3">
                <Button
                  onClick={handleButtonClick}
                  disabled={isProcessing}
                  variant="primary"
                  size="sm"
                >
                  {previewUrl
                    ? UI_LABELS.AVATAR.CHANGE_PHOTO
                    : UI_LABELS.AVATAR.CHOOSE_IMAGE}
                </Button>

                {previewUrl && (
                  <Button
                    onClick={handleRemovePhoto}
                    disabled={isProcessing}
                    variant="secondary"
                    size="sm"
                  >
                    {UI_LABELS.AVATAR.REMOVE_PHOTO}
                  </Button>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
              aria-label={UI_LABELS.AVATAR.CHANGE_PHOTO}
            />
          </div>
        </div>

        {state.error && (
          <Alert variant="error" onClose={() => cancel()}>
            {state.error}
          </Alert>
        )}
      </div>

      {/* Image Crop Modal */}
      {showCropModal && tempImageUrl && (
        <ImageCropModal
          isOpen={showCropModal}
          imageUrl={tempImageUrl}
          initialCropData={cropData || undefined}
          onSave={handleCropSave}
          onClose={handleCropCancel}
        />
      )}
    </>
  );
}
