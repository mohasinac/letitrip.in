"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  PhotoCamera as PhotoCameraIcon,
  Link as LinkIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
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
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
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
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Image Upload
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {loading && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                mb: 2,
                p: 2,
                backgroundColor: "action.hover",
                borderRadius: 1,
              }}
            >
              <CircularProgress
                variant="determinate"
                value={uploadProgress}
                size={40}
              />
              <Typography variant="body2">
                {uploadProgress > 0
                  ? `Uploading... ${uploadProgress}%`
                  : "Processing..."}
              </Typography>
            </Box>
          )}

          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            aria-label="image upload options"
            sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
          >
            <Tab
              label="URL"
              id="image-tab-0"
              aria-controls="image-tabpanel-0"
              icon={<LinkIcon sx={{ mr: 1 }} />}
              iconPosition="start"
            />
            <Tab
              label="Upload"
              id="image-tab-1"
              aria-controls="image-tabpanel-1"
              icon={<CloudUploadIcon sx={{ mr: 1 }} />}
              iconPosition="start"
            />
            <Tab
              label="Camera"
              id="image-tab-2"
              aria-controls="image-tabpanel-2"
              icon={<PhotoCameraIcon sx={{ mr: 1 }} />}
              iconPosition="start"
            />
          </Tabs>

          {/* URL Tab */}
          <TabPanel value={tabValue} index={0}>
            <Stack spacing={2}>
              <TextField
                label="Image URL"
                placeholder="https://example.com/image.jpg"
                fullWidth
                size="small"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleUrlSubmit();
                  }
                }}
                disabled={loading}
              />
              <Button
                variant="contained"
                onClick={handleUrlSubmit}
                disabled={loading || !urlInput.trim()}
                fullWidth
              >
                Use URL
              </Button>
            </Stack>
          </TabPanel>

          {/* File Upload Tab */}
          <TabPanel value={tabValue} index={1}>
            <Stack spacing={2}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                style={{ display: "none" }}
              />
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                fullWidth
              >
                Choose Image
              </Button>
              <Typography variant="caption" color="text.secondary">
                Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
              </Typography>
            </Stack>
          </TabPanel>

          {/* Camera Tab */}
          <TabPanel value={tabValue} index={2}>
            <Stack spacing={2}>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                onChange={handleCameraInputChange}
                style={{ display: "none" }}
              />
              <Button
                variant="contained"
                startIcon={<PhotoCameraIcon />}
                onClick={handleCameraClick}
                disabled={loading}
                fullWidth
              >
                Take Photo
              </Button>
              <Typography variant="caption" color="text.secondary">
                Best on mobile devices. On desktop, you can select an image file
                from your device.
              </Typography>
              {cameraPermission === "denied" && (
                <Alert severity="warning" icon={<WarningAmberIcon />}>
                  Camera access is denied. Try using the Upload or URL options
                  instead.
                </Alert>
              )}
            </Stack>
          </TabPanel>

          {/* Permission Dialog */}
          <Dialog
            open={showPermissionDialog}
            onClose={() => setShowPermissionDialog(false)}
          >
            <DialogTitle>Camera Permission Required</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ pt: 2 }}>
                <Typography variant="body2">
                  This app needs permission to access your camera to take
                  photos. You can:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li" variant="body2">
                    Allow camera access to take photos
                  </Typography>
                  <Typography component="li" variant="body2">
                    Use the Upload tab to select images from your device
                  </Typography>
                  <Typography component="li" variant="body2">
                    Use the URL tab to provide an image URL
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowPermissionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={requestCameraPermission} variant="contained">
                Allow Camera
              </Button>
            </DialogActions>
          </Dialog>

          {/* Image Preview/Cropper */}
          {previewUrl && (
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
              <ImageCropper
                ref={cropperRef}
                imageUrl={previewUrl}
                targetWidth={targetWidth}
                targetHeight={targetHeight}
              />
              <Typography
                variant="caption"
                color="primary.main"
                sx={{ mt: 1, display: "block", textAlign: "center" }}
              >
                Adjust the image above. It will be uploaded when you save the
                form.
              </Typography>
            </Box>
          )}

          {/* Current Saved Image Display */}
          {value && !previewUrl && (
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1, display: "block" }}
              >
                Current Image:
              </Typography>
              <Box
                component="img"
                src={value}
                onError={() => setError("Failed to load image")}
                sx={{
                  width: "100%",
                  maxHeight: 200,
                  objectFit: "cover",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
            </Box>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
