"use client";

import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  DragIndicator,
  CropSquare,
  PlayCircle,
  VideoLibrary,
  CameraAlt,
  Photo,
  ArrowDropDown,
} from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { uploadWithAuth } from "@/lib/api/seller";
import WhatsAppImageEditor from "./WhatsAppImageEditor";

interface MediaUploadStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export default function MediaUploadStep({
  data,
  onChange,
}: MediaUploadStepProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [whatsAppEditorOpen, setWhatsAppEditorOpen] = useState(false);
  const [selectedImageForEdit, setSelectedImageForEdit] = useState<{
    index: number;
    url: string;
  } | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadMenuAnchor, setUploadMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check total images count
    const remainingSlots = 5 - data.media.images.length;
    if (files.length > remainingSlots) {
      setError(`You can only upload ${remainingSlots} more image(s)`);
      return;
    }

    setError(null);

    try {
      // Store images as File objects with preview URLs - don't upload yet
      const newImages = await Promise.all(
        Array.from(files).map(async (file, index) => {
          // Create preview URL
          const previewUrl = URL.createObjectURL(file);

          return {
            file: file, // Store the actual file for later upload
            url: previewUrl, // Temporary preview URL
            altText: data.name || "Product image",
            order: data.media.images.length + index,
            isNew: true, // Flag to indicate this needs to be uploaded
          };
        })
      );

      onChange({
        media: {
          ...data.media,
          images: [...data.media.images, ...newImages],
        },
      });
    } catch (err: any) {
      console.error("Image selection error:", err);
      setError(err.message || "Failed to select images");
    }

    // Reset input
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const newImages = data.media.images.filter(
      (_: any, i: number) => i !== index
    );
    onChange({ media: { ...data.media, images: newImages } });
  };

  const updateAltText = (index: number, altText: string) => {
    const newImages = [...data.media.images];
    newImages[index] = { ...newImages[index], altText };
    onChange({ media: { ...data.media, images: newImages } });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(data.media.images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const reorderedImages = items.map((img: any, index: number) => ({
      ...img,
      order: index,
    }));

    onChange({ media: { ...data.media, images: reorderedImages } });
  };

  const openWhatsAppEditor = (index: number, url: string) => {
    setSelectedImageForEdit({ index, url });
    setWhatsAppEditorOpen(true);
  };

  const handleWhatsAppSave = async (croppedImageBlob: Blob) => {
    if (!selectedImageForEdit) return;

    try {
      setUploading(true);
      setError(null);

      // Create FormData with cropped image
      const formData = new FormData();
      formData.append("files", croppedImageBlob, `whatsapp-${Date.now()}.jpg`);
      formData.append("slug", data.seo.slug);
      formData.append("type", "image");

      // Upload to API
      const response: any = await uploadWithAuth(
        "/api/seller/products/media",
        formData
      );

      if (response.success && response.data.length > 0) {
        // Update the specific image with WhatsApp version
        const newImages = [...data.media.images];
        const whatsappUrl = response.data[0].url;

        // Add WhatsApp edited indicator to image
        newImages[selectedImageForEdit.index] = {
          ...newImages[selectedImageForEdit.index],
          url: whatsappUrl,
          whatsappEdited: true,
        };

        onChange({
          media: {
            ...data.media,
            images: newImages,
          },
        });
      } else {
        setError(response.error || "Failed to save WhatsApp image");
      }
    } catch (err: any) {
      console.error("WhatsApp save error:", err);
      setError(err.message || "Failed to save WhatsApp image");
    } finally {
      setUploading(false);
      setSelectedImageForEdit(null);
    }
  };

  /**
   * Generate video thumbnail from first frame
   */
  const generateVideoThumbnail = (
    videoFile: File
  ): Promise<{ blob: Blob; url: string }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        // Seek to 1 second (or 10% of duration)
        video.currentTime = Math.min(1, video.duration * 0.1);
      };

      video.onseeked = () => {
        try {
          // Set canvas size to video dimensions
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                resolve({ blob, url });
              } else {
                reject(new Error("Failed to generate thumbnail"));
              }

              // Cleanup
              URL.revokeObjectURL(video.src);
            },
            "image/jpeg",
            0.85
          );
        } catch (error) {
          reject(error);
        }
      };

      video.onerror = () => {
        reject(new Error("Failed to load video"));
      };

      // Load video
      video.src = URL.createObjectURL(videoFile);
    });
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check total videos count
    const remainingSlots = 2 - data.media.videos.length;
    if (files.length > remainingSlots) {
      setError(`You can only upload ${remainingSlots} more video(s)`);
      return;
    }

    setUploadingVideo(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validate slug exists
      if (!data.seo.slug) {
        setError("Please enter a product name first to generate a slug");
        setUploadingVideo(false);
        return;
      }

      // Validate file size (20MB limit per video)
      for (const file of Array.from(files)) {
        if (file.size > 20 * 1024 * 1024) {
          setError(`Video "${file.name}" exceeds 20MB limit`);
          setUploadingVideo(false);
          return;
        }
      }

      const uploadedVideos = [];

      for (const videoFile of Array.from(files)) {
        // Generate thumbnail
        const { blob: thumbnailBlob } = await generateVideoThumbnail(videoFile);

        // Create FormData for video
        const videoFormData = new FormData();
        videoFormData.append("files", videoFile);
        videoFormData.append("slug", data.seo.slug);
        videoFormData.append("type", "video");

        // Upload video
        const videoResponse: any = await uploadWithAuth(
          "/api/seller/products/media",
          videoFormData
        );

        if (!videoResponse.success) {
          throw new Error(videoResponse.error || "Failed to upload video");
        }

        const videoData = videoResponse.data[0];

        // Create FormData for thumbnail
        const thumbnailFormData = new FormData();
        thumbnailFormData.append(
          "files",
          thumbnailBlob,
          `${videoData.name}-thumb.jpg`
        );
        thumbnailFormData.append("slug", data.seo.slug);
        thumbnailFormData.append("type", "image");

        // Upload thumbnail
        const thumbnailResponse: any = await uploadWithAuth(
          "/api/seller/products/media",
          thumbnailFormData
        );

        if (!thumbnailResponse.success) {
          throw new Error(
            thumbnailResponse.error || "Failed to upload thumbnail"
          );
        }

        const thumbnailData = thumbnailResponse.data[0];

        uploadedVideos.push({
          url: videoData.url,
          thumbnail: thumbnailData.url,
          order: data.media.videos.length + uploadedVideos.length,
          path: videoData.path,
          name: videoData.name,
          size: videoData.size,
        });
      }

      // Add uploaded videos to state
      onChange({
        media: {
          ...data.media,
          videos: [...data.media.videos, ...uploadedVideos],
        },
      });

      setUploadProgress(100);
    } catch (err: any) {
      console.error("Video upload error:", err);
      setError(err.message || "Failed to upload videos");
    } finally {
      setUploadingVideo(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }

    // Reset input
    e.target.value = "";
  };

  const removeVideo = (index: number) => {
    const newVideos = data.media.videos.filter(
      (_: any, i: number) => i !== index
    );
    onChange({ media: { ...data.media, videos: newVideos } });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6" gutterBottom>
        Media Upload
      </Typography>

      <Alert severity="info">
        Upload up to 5 images. First image will be the main product image. Drag
        to reorder. Supports JPG, PNG, WebP (max 5MB per image).
      </Alert>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {uploading && (
        <Box sx={{ width: "100%" }}>
          <Typography variant="caption" gutterBottom>
            Uploading images...
          </Typography>
          <LinearProgress variant="indeterminate" />
        </Box>
      )}

      {/* Image Upload with Camera Support */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="contained"
          onClick={(e) => setUploadMenuAnchor(e.currentTarget)}
          endIcon={<ArrowDropDown />}
          sx={{
            py: 1.5,
            px: 3,
          }}
          disabled={data.media.images.length >= 5 || uploading}
        >
          {uploading ? "Processing..." : "Add Images"}
        </Button>

        <Menu
          anchorEl={uploadMenuAnchor}
          open={Boolean(uploadMenuAnchor)}
          onClose={() => setUploadMenuAnchor(null)}
        >
          <MenuItem
            onClick={() => {
              setUploadMenuAnchor(null);
              fileInputRef.current?.click();
            }}
          >
            <ListItemIcon>
              <Photo />
            </ListItemIcon>
            <ListItemText>Choose from Gallery</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setUploadMenuAnchor(null);
              cameraInputRef.current?.click();
            }}
          >
            <ListItemIcon>
              <CameraAlt />
            </ListItemIcon>
            <ListItemText>Take Photo</ListItemText>
          </MenuItem>
        </Menu>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={handleImageSelect}
          disabled={data.media.images.length >= 5 || uploading}
        />
        <input
          ref={cameraInputRef}
          type="file"
          hidden
          accept="image/*"
          capture="environment"
          onChange={handleImageSelect}
          disabled={data.media.images.length >= 5 || uploading}
        />

        <Typography variant="caption" color="text.secondary">
          {data.media.images.length} / 5 images • Saved locally until you submit
        </Typography>
      </Box>

      {/* Image Grid with Drag and Drop */}
      {data.media.images.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="images" direction="horizontal">
            {(provided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: 2,
                }}
              >
                {data.media.images.map((img: any, index: number) => (
                  <Draggable
                    key={`image-${index}`}
                    draggableId={`image-${index}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          p: 2,
                          opacity: snapshot.isDragging ? 0.8 : 1,
                          transform: snapshot.isDragging
                            ? "rotate(2deg)"
                            : "none",
                          boxShadow: snapshot.isDragging ? 6 : 1,
                          transition: "box-shadow 0.2s",
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            height: 200,
                            bgcolor: "grey.100",
                            backgroundImage: `url(${img.url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderRadius: 1,
                            mb: 1,
                            position: "relative",
                          }}
                        >
                          {/* Drag Handle */}
                          <IconButton
                            {...provided.dragHandleProps}
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 8,
                              left: 8,
                              bgcolor: "background.paper",
                              cursor: "grab",
                              "&:active": {
                                cursor: "grabbing",
                              },
                            }}
                          >
                            <DragIndicator />
                          </IconButton>

                          {/* Delete Button */}
                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              bgcolor: "background.paper",
                            }}
                            onClick={() => removeImage(index)}
                          >
                            <Delete />
                          </IconButton>

                          {/* WhatsApp Edit Button */}
                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 48,
                              right: 8,
                              bgcolor: img.whatsappEdited
                                ? "#25D366"
                                : "background.paper",
                              color: img.whatsappEdited ? "white" : "inherit",
                              "&:hover": {
                                bgcolor: img.whatsappEdited
                                  ? "#128C7E"
                                  : "background.paper",
                              },
                            }}
                            onClick={() => openWhatsAppEditor(index, img.url)}
                            title="Edit for WhatsApp (800x800)"
                          >
                            <CropSquare />
                          </IconButton>

                          {/* Main Badge */}
                          {index === 0 && (
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 8,
                                left: 8,
                                bgcolor: "primary.main",
                                color: "white",
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: "0.75rem",
                              }}
                            >
                              Main Image
                            </Box>
                          )}

                          {/* Order Badge */}
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 8,
                              right: 8,
                              bgcolor: "rgba(0, 0, 0, 0.6)",
                              color: "white",
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                            }}
                          >
                            {index + 1}
                          </Box>
                        </Box>
                        <TextField
                          fullWidth
                          size="small"
                          label="Alt Text"
                          value={img.altText}
                          onChange={(e) => updateAltText(index, e.target.value)}
                        />
                      </Paper>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Video Upload */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Product Videos (Optional)
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Upload up to 2 videos. Thumbnails will be auto-generated. Supports
          MP4, WebM, MOV (max 20MB per video).
        </Alert>

        {uploadingVideo && (
          <Box sx={{ width: "100%", mb: 2 }}>
            <Typography variant="caption" gutterBottom>
              Uploading video and generating thumbnail...
            </Typography>
            <LinearProgress variant="indeterminate" />
          </Box>
        )}

        <Button
          variant="outlined"
          component="label"
          startIcon={
            uploadingVideo ? <CircularProgress size={20} /> : <VideoLibrary />
          }
          disabled={data.media.videos.length >= 2 || uploadingVideo}
        >
          {uploadingVideo ? "Uploading..." : "Upload Videos"}
          <input
            type="file"
            hidden
            multiple
            accept="video/*"
            onChange={handleVideoUpload}
            disabled={data.media.videos.length >= 2 || uploadingVideo}
          />
        </Button>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          {data.media.videos.length} / 2 videos uploaded
        </Typography>

        {/* Video Grid */}
        {data.media.videos.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: 2,
              mt: 2,
            }}
          >
            {data.media.videos.map((video: any, index: number) => (
              <Paper key={`video-${index}`} sx={{ p: 2 }}>
                <Box
                  sx={{
                    width: "100%",
                    height: 200,
                    bgcolor: "grey.100",
                    backgroundImage: `url(${video.thumbnail})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: 1,
                    mb: 1,
                    position: "relative",
                    cursor: "pointer",
                    "&:hover .play-icon": {
                      opacity: 1,
                      transform: "scale(1.1)",
                    },
                  }}
                  onClick={() => window.open(video.url, "_blank")}
                >
                  {/* Play Icon Overlay */}
                  <Box
                    className="play-icon"
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      opacity: 0.8,
                      transition: "all 0.3s",
                      pointerEvents: "none",
                    }}
                  >
                    <PlayCircle
                      sx={{
                        fontSize: 64,
                        color: "white",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                      }}
                    />
                  </Box>

                  {/* Delete Button */}
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "background.paper",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVideo(index);
                    }}
                  >
                    <Delete />
                  </IconButton>

                  {/* Video Badge */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      bgcolor: "error.main",
                      color: "white",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    VIDEO {index + 1}
                  </Box>

                  {/* File Size Badge */}
                  {video.size && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        bgcolor: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.7rem",
                      }}
                    >
                      {(video.size / (1024 * 1024)).toFixed(1)} MB
                    </Box>
                  )}
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1 }}
                >
                  {video.name || `Video ${index + 1}`}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Box>

      {/* WhatsApp Image Editor Modal */}
      {selectedImageForEdit && (
        <WhatsAppImageEditor
          open={whatsAppEditorOpen}
          imageUrl={selectedImageForEdit.url}
          onClose={() => {
            setWhatsAppEditorOpen(false);
            setSelectedImageForEdit(null);
          }}
          onSave={handleWhatsAppSave}
        />
      )}
    </Box>
  );
}
