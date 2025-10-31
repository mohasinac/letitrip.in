"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  CloudUpload,
  Camera,
  Link,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import ImageCropper, { type ImageCropperRef } from "./ImageCropper";

interface ImageUploaderProps {
  value: string | null | undefined;
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  slug?: string | null | undefined;
  targetWidth?: number;
  targetHeight?: number;
  onFileReady?: (file: File) => void; // Callback when file is ready to upload
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`image-tabpanel-${index}`}
      aria-labelledby={`image-tab-${index}`}
      {...other}
    >
      {value === index && <div className="pt-4">{children}</div>}
    </div>
  );
}

export default function ImageUploader({
  value,
  onChange,
  onError,
  slug,
  targetWidth = 400,
  targetHeight = 400,
  onFileReady,
}: ImageUploaderProps) {
  const [tabValue, setTabValue] = useState(0);
  const [urlInput, setUrlInput] = useState(value || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cameraPermission, setCameraPermission] = useState<
    "granted" | "denied" | "prompt" | null
  >(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<ImageCropperRef>(null);

  // New state for local preview with cropper
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  // Check camera permission on mount
  useEffect(() => {
    checkCameraPermission();
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const checkCameraPermission = async () => {
    try {
      if (
        typeof window !== "undefined" &&
        navigator.permissions &&
        navigator.permissions.query
      ) {
        const result = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });
        setCameraPermission(result.state as "granted" | "denied" | "prompt");
      }
    } catch (error) {
      console.debug("Camera permission check not supported");
    }
  };

  const requestCameraPermission = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately (we just needed to check permission)
      stream.getTracks().forEach((track) => track.stop());
      setCameraPermission("granted");
      setShowPermissionDialog(false);
      // Now trigger the file input
      setTimeout(() => {
        cameraInputRef.current?.click();
      }, 100);
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        setCameraPermission("denied");
        handleError(
          "Camera permission denied. You can still use file upload or provide a URL instead."
        );
      } else if (error.name === "NotFoundError") {
        handleError("No camera device found on this device.");
      } else {
        handleError(
          "Unable to access camera. Please check your browser settings."
        );
      }
      setShowPermissionDialog(false);
    }
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    onError?.(errorMsg);
    setTimeout(() => setError(null), 5000);
  };

  // Handle URL input
  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      handleError("Please enter a valid URL");
      return;
    }

    try {
      new URL(urlInput);
      onChange(urlInput);
      setError(null);
    } catch {
      handleError("Please enter a valid URL");
    }
  };

  // Handle file upload - Now creates preview instead of immediate upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      handleError("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      handleError("Image size must be less than 5MB");
      return;
    }

    // Create local preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setOriginalFile(file);
    setError(null);
  };

  // Method to get cropped image file for form submission
  const getCroppedImageFile = async (): Promise<File | null> => {
    if (!cropperRef.current || !originalFile) return null;

    try {
      const croppedBlob = await cropperRef.current.getCroppedImage();
      const fileName =
        originalFile.name.replace(/\.[^/.]+$/, "") + "-cropped.jpg";
      return new File([croppedBlob], fileName, { type: "image/jpeg" });
    } catch (error) {
      console.error("Failed to get cropped image:", error);
      return null;
    }
  };

  // Notify parent when file is ready (for form submission)
  useEffect(() => {
    if (previewUrl && originalFile && onFileReady) {
      // When there's a preview, pass a callback to get the cropped file
      const fileGetter = async () => {
        return await getCroppedImageFile();
      };
      // Call parent callback with file getter function
      onFileReady(fileGetter as any);
    }
  }, [previewUrl, originalFile, onFileReady]);

  // Public method to upload the cropped image (can be called by parent)
  const uploadCroppedImage = async (): Promise<string | null> => {
    const croppedFile = await getCroppedImageFile();
    if (croppedFile) {
      await uploadImageToFirebase(croppedFile);
      return value || null; // Return the uploaded URL
    }
    return null;
  };

  // Store uploadCroppedImage in a ref for parent access
  React.useEffect(() => {
    if (onFileReady && previewUrl) {
      (window as any).__uploadCroppedImage = uploadCroppedImage;
    }
  }, [previewUrl, originalFile]);

  // Upload image to Firebase Storage via API
  const uploadImageToFirebase = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "categories");

      // Append slug if provided, for slug-based filename
      if (slug) {
        formData.append("slug", slug);
      }

      // Use the apiClient to upload, which will handle auth
      const response = await apiClient.upload<{ url: string }>(
        "/storage/upload",
        formData
      );

      if (response.url) {
        onChange(response.url);
        setUploadProgress(100);

        // Clear preview after successful upload
        if (previewUrl && previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setOriginalFile(null);

        setTimeout(() => setUploadProgress(0), 1500);
      } else {
        handleError("Failed to get image URL from server");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      handleError(
        err.response?.data?.error ||
          err.message ||
          "Failed to upload image to Firebase"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle camera input change
  const handleCameraInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  // Handle camera button click
  const handleCameraClick = async () => {
    if (cameraPermission === "granted") {
      cameraInputRef.current?.click();
    } else if (cameraPermission === "denied") {
      handleError(
        "Camera access denied. Please enable camera permissions in your browser settings."
      );
    } else {
      // Permission is prompt or unknown, show dialog
      setShowPermissionDialog(true);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Image Upload
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start justify-between">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              ×
            </button>
          </div>
        )}

        {loading && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center gap-3">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 18}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 18 * (1 - uploadProgress / 100)
                  }`}
                  className="text-blue-600 dark:text-blue-400 transition-all duration-300"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {uploadProgress > 0
                ? `Uploading... ${uploadProgress}%`
                : "Processing..."}
            </span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
          <nav className="flex -mb-px">
            <button
              onClick={() => setTabValue(0)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
                tabValue === 0
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              id="image-tab-0"
              aria-controls="image-tabpanel-0"
            >
              <Link className="w-4 h-4" />
              URL
            </button>
            <button
              onClick={() => setTabValue(1)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
                tabValue === 1
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              id="image-tab-1"
              aria-controls="image-tabpanel-1"
            >
              <CloudUpload className="w-4 h-4" />
              Upload
            </button>
            <button
              onClick={() => setTabValue(2)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
                tabValue === 2
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              id="image-tab-2"
              aria-controls="image-tabpanel-2"
            >
              <Camera className="w-4 h-4" />
              Camera
            </button>
          </nav>
        </div>

        {/* URL Tab */}
        <TabPanel value={tabValue} index={0}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleUrlSubmit();
                }
              }}
              disabled={loading}
            />
            <button
              onClick={handleUrlSubmit}
              disabled={loading || !urlInput.trim()}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              Use URL
            </button>
          </div>
        </TabPanel>

        {/* File Upload Tab */}
        <TabPanel value={tabValue} index={1}>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CloudUpload className="w-5 h-5" />
              Choose Image
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
            </p>
          </div>
        </TabPanel>

        {/* Camera Tab */}
        <TabPanel value={tabValue} index={2}>
          <div className="space-y-4">
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraInputChange}
              className="hidden"
            />
            <button
              onClick={handleCameraClick}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Take Photo
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Best on mobile devices. On desktop, you can select an image file
              from your device.
            </p>
            {cameraPermission === "denied" && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Camera access is denied. Try using the Upload or URL options
                  instead.
                </p>
              </div>
            )}
          </div>
        </TabPanel>

        {/* Permission Dialog */}
        {showPermissionDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Camera Permission Required
              </h3>
              <div className="space-y-4 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  This app needs permission to access your camera to take
                  photos. You can:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>Allow camera access to take photos</li>
                  <li>Use the Upload tab to select images from your device</li>
                  <li>Use the URL tab to provide an image URL</li>
                </ul>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowPermissionDialog(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={requestCameraPermission}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Allow Camera
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview/Cropper */}
        {previewUrl && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <ImageCropper
              ref={cropperRef}
              imageUrl={previewUrl}
              targetWidth={targetWidth}
              targetHeight={targetHeight}
            />
            <p className="mt-2 text-xs text-center text-blue-600 dark:text-blue-400">
              Adjust the image above. It will be uploaded when you save the
              form.
            </p>
          </div>
        )}

        {/* Current Saved Image Display */}
        {value && !previewUrl && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Current Image:
            </p>
            <img
              src={value}
              alt="Current"
              onError={() => setError("Failed to load image")}
              className="w-full max-h-[200px] object-cover rounded-lg border border-gray-200 dark:border-gray-700"
            />
          </div>
        )}
      </div>
    </div>
  );
}
