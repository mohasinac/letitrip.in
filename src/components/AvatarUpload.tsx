/**
 * AvatarUpload — Profile avatar upload component.
 *
 * SCOPE: Use ONLY for user / seller / brand profile avatar uploads.
 * Features crop, zoom, and circular-preview UX specific to avatars.
 *
 * UPLOAD PATH: useMediaUpload → POST /api/media/upload (Firebase Admin SDK).
 * Complies with Rule 11 — no Firebase Storage client SDK in frontend.
 *
 * For ALL other image fields (products, blog, categories, carousel),
 * use <ImageUpload> (src/components/admin/ImageUpload.tsx) instead.
 */
"use client";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { useMediaUpload } from "@/hooks";
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
import { THEME_CONSTANTS, UI_HELP_TEXT, SUCCESS_MESSAGES } from "@/constants";

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
  const t = useTranslations("avatar");
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const {
    mutateAsync: uploadMedia,
    isPending: isUploading,
    error: uploadApiError,
    reset: resetUpload,
  } = useMediaUpload();

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

  // User explicitly clicks "Save Avatar" — build FormData, POST to /api/media/upload
  const handleConfirmSave = async () => {
    if (!pendingUploadFile || !pendingCropData) return;

    const formData = new FormData();
    formData.append("file", pendingUploadFile);
    formData.append(
      "metadata",
      JSON.stringify({
        cropX: 0,
        cropY: 0,
        cropWidth: 400,
        cropHeight: 400,
        zoom: pendingCropData.zoom ?? 1,
        focalX: (pendingCropData.position?.x ?? 50) / 100,
        focalY: (pendingCropData.position?.y ?? 50) / 100,
        aspectRatio: "1:1",
        objectFit: "cover",
        displayMode: "avatar",
        originalWidth: 400,
        originalHeight: 400,
        mimeType: pendingUploadFile.type,
        fileSize: pendingUploadFile.size,
        alt: `${userId} profile avatar`,
        seoContext: {
          domain: "user",
          slug: userId,
          mediaType: "avatar",
          index: 1,
        },
      }),
    );

    try {
      const result = await uploadMedia(formData);
      const downloadURL = result.url;

      if (onUploadSuccess && pendingCropData) {
        await onUploadSuccess(downloadURL, pendingCropData);
      }

      setPreviewUrl(downloadURL);
      setCropData(pendingCropData);
      setPendingCropData(null);
      setPendingUploadFile(null);

      showToast(SUCCESS_MESSAGES.UPLOAD.AVATAR_UPLOADED, "success");
      onSaveComplete?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      onUploadError?.(errorMessage);
    }
  };

  // User cancels the pending avatar change
  const handleCancelPending = () => {
    setPendingCropData(null);
    setPendingUploadFile(null);
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
  const isBusy = isUploading;

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

            {/* Progress Bar — visible during upload */}
            {isBusy && (
              <div className="space-y-1">
                <Progress
                  value={50}
                  variant="primary"
                  size="sm"
                  label={t("uploading")}
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
                  {t("readyToSave")}
                </Text>
                <div className="flex gap-3">
                  <Button
                    onClick={handleConfirmSave}
                    variant="primary"
                    size="sm"
                  >
                    {t("saveAvatar")}
                  </Button>
                  <Button
                    onClick={handleCancelPending}
                    variant="secondary"
                    size="sm"
                  >
                    {t("cancelChange")}
                  </Button>
                </div>
              </div>
            )}

            {/* Default controls — choose / remove image */}
            {!hasPendingChange && !isBusy && (
              <div className="flex gap-3">
                <Button
                  onClick={handleButtonClick}
                  disabled={isUploading}
                  variant="primary"
                  size="sm"
                >
                  {previewUrl ? t("changePhoto") : t("chooseImage")}
                </Button>

                {previewUrl && (
                  <Button
                    onClick={handleRemovePhoto}
                    disabled={isUploading}
                    variant="secondary"
                    size="sm"
                  >
                    {t("removePhoto")}
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
              aria-label={t("changePhoto")}
            />
          </div>
        </div>

        {uploadApiError && (
          <Alert variant="error" onClose={() => resetUpload()}>
            {uploadApiError.message}
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
