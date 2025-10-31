"use client";

import React, { useState, useRef } from "react";
import {
  PrimaryButton,
  SecondaryButton,
  UnifiedInput,
  UnifiedAlert,
  UnifiedCard,
} from "@/components/ui/unified";
import {
  CloudUpload,
  Trash2,
  GripVertical,
  Crop,
  PlayCircle,
  Video,
  Camera,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { uploadWithAuth } from "@/lib/api/seller";
import WhatsAppImageEditor, { WhatsAppCropData } from "./WhatsAppImageEditor";
import VideoThumbnailSelector from "./VideoThumbnailSelector";

interface MediaUploadStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export default function MediaUploadStep({
  data,
  onChange,
}: MediaUploadStepProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whatsAppEditorOpen, setWhatsAppEditorOpen] = useState(false);
  const [selectedImageForEdit, setSelectedImageForEdit] = useState<{
    index: number;
    url: string;
    currentCrop?: WhatsAppCropData;
  } | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadMenuAnchor, setUploadMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [thumbnailSelectorOpen, setThumbnailSelectorOpen] = useState(false);
  const [selectedVideoForThumbnail, setSelectedVideoForThumbnail] = useState<{
    index: number;
    url: string;
    currentThumbnail?: string;
  } | null>(null);

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
    const img = data.media.images[index];
    setSelectedImageForEdit({
      index,
      url,
      currentCrop: img.whatsappCrop,
    });
    setWhatsAppEditorOpen(true);
  };

  const handleWhatsAppSave = async (cropData: WhatsAppCropData) => {
    if (!selectedImageForEdit) return;

    try {
      // Just save the crop data to the image object
      const newImages = [...data.media.images];
      newImages[selectedImageForEdit.index] = {
        ...newImages[selectedImageForEdit.index],
        whatsappCrop: cropData, // Store crop settings
        whatsappEdited: true,
      };

      onChange({
        media: {
          ...data.media,
          images: newImages,
        },
      });
    } catch (err: any) {
      console.error("WhatsApp save error:", err);
      setError(err.message || "Failed to save WhatsApp settings");
    } finally {
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

    try {
      // Validate file size (20MB limit per video)
      for (const file of Array.from(files)) {
        if (file.size > 20 * 1024 * 1024) {
          setError(`Video "${file.name}" exceeds 20MB limit`);
          setUploadingVideo(false);
          return;
        }
      }

      const newVideos = [];

      for (const videoFile of Array.from(files)) {
        // Generate thumbnail preview
        const { blob: thumbnailBlob, url: thumbnailUrl } =
          await generateVideoThumbnail(videoFile);

        // Create preview URL for video
        const videoPreviewUrl = URL.createObjectURL(videoFile);

        // Store video locally with thumbnail - don't upload yet
        newVideos.push({
          file: videoFile, // Store the actual video file for later upload
          thumbnailBlob: thumbnailBlob, // Store thumbnail blob for later upload
          url: videoPreviewUrl, // Temporary preview URL
          thumbnail: thumbnailUrl, // Temporary thumbnail URL
          order: data.media.videos.length + newVideos.length,
          name: videoFile.name,
          size: videoFile.size,
          isNew: true, // Flag to indicate this needs to be uploaded
        });
      }

      // Add videos to state
      onChange({
        media: {
          ...data.media,
          videos: [...data.media.videos, ...newVideos],
        },
      });
    } catch (err: any) {
      console.error("Video selection error:", err);
      setError(err.message || "Failed to select videos");
    } finally {
      setUploadingVideo(false);
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

  const openThumbnailSelector = (
    index: number,
    videoUrl: string,
    currentThumbnail?: string
  ) => {
    setSelectedVideoForThumbnail({
      index,
      url: videoUrl,
      currentThumbnail,
    });
    setThumbnailSelectorOpen(true);
  };

  const handleThumbnailSave = (
    thumbnailBlob: Blob,
    thumbnailUrl: string,
    timestamp: number
  ) => {
    if (!selectedVideoForThumbnail) return;

    try {
      // Update the video with new thumbnail
      const newVideos = [...data.media.videos];
      newVideos[selectedVideoForThumbnail.index] = {
        ...newVideos[selectedVideoForThumbnail.index],
        thumbnailBlob: thumbnailBlob,
        thumbnail: thumbnailUrl,
        thumbnailTimestamp: timestamp,
      };

      onChange({
        media: {
          ...data.media,
          videos: newVideos,
        },
      });
    } catch (err: any) {
      console.error("Thumbnail save error:", err);
      setError(err.message || "Failed to save thumbnail");
    } finally {
      setSelectedVideoForThumbnail(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Media Upload
      </h2>

      <UnifiedAlert variant="info">
        Upload up to 5 images. First image will be the main product image. Drag
        to reorder. Supports JPG, PNG, WebP (max 5MB per image).
      </UnifiedAlert>

      {error && (
        <div className="relative">
          <UnifiedAlert variant="error" onClose={() => setError(null)}>
            {error}
          </UnifiedAlert>
          <button
            onClick={() => setError(null)}
            className="absolute top-3 right-3 text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {uploading && (
        <div className="w-full">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Uploading images...
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-blue-600 animate-progress-stripes bg-gradient-to-r from-blue-500 to-blue-600"
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>
      )}

      {/* Image Upload with Camera Support */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative">
          <PrimaryButton
            onClick={(e) => setUploadMenuAnchor(e.currentTarget)}
            rightIcon={<ChevronDown className="w-4 h-4" />}
            disabled={data.media.images.length >= 5 || uploading}
          >
            {uploading ? "Processing..." : "Add Images"}
          </PrimaryButton>

          {/* Dropdown Menu */}
          {uploadMenuAnchor && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setUploadMenuAnchor(null)}
              />
              <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                <button
                  onClick={() => {
                    setUploadMenuAnchor(null);
                    fileInputRef.current?.click();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ImageIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Choose from Gallery
                  </span>
                </button>
                <button
                  onClick={() => {
                    setUploadMenuAnchor(null);
                    cameraInputRef.current?.click();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
                >
                  <Camera className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Take Photo
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

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

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {data.media.images.length} / 5 images • Saved locally until you submit
        </p>
      </div>

      {/* Image Grid with Drag and Drop */}
      {data.media.images.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="images" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {data.media.images.map((img: any, index: number) => (
                  <Draggable
                    key={`image-${index}`}
                    draggableId={`image-${index}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow transition-all ${
                          snapshot.isDragging
                            ? "opacity-80 rotate-2 shadow-xl"
                            : "shadow-md"
                        }`}
                      >
                        <div className="relative w-full h-[200px] bg-gray-100 dark:bg-gray-700 rounded-lg mb-2 overflow-hidden">
                          <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${img.url})` }}
                          />

                          {/* Drag Handle */}
                          <button
                            {...provided.dragHandleProps}
                            className="absolute top-2 left-2 p-1 bg-white dark:bg-gray-800 rounded cursor-grab active:cursor-grabbing hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <GripVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-800 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </button>

                          {/* WhatsApp Edit Button */}
                          <button
                            onClick={() => openWhatsAppEditor(index, img.url)}
                            title="Edit for WhatsApp (800x800)"
                            className={`absolute top-12 right-2 p-1 rounded transition-colors ${
                              img.whatsappEdited
                                ? "bg-[#25D366] hover:bg-[#128C7E] text-white"
                                : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            <Crop className="w-5 h-5" />
                          </button>

                          {/* Main Badge */}
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
                              Main Image
                            </div>
                          )}

                          {/* Order Badge */}
                          <div className="absolute bottom-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                        </div>
                        <UnifiedInput
                          size="sm"
                          label="Alt Text"
                          value={img.altText}
                          onChange={(e) => updateAltText(index, e.target.value)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Video Upload Section */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Product Videos (Optional)
        </h3>
        <UnifiedAlert variant="info" className="mb-4">
          Upload up to 2 videos. Thumbnails will be auto-generated. Supports
          MP4, WebM, MOV (max 20MB per video).
        </UnifiedAlert>

        {uploadingVideo && (
          <div className="w-full mb-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Processing video and generating thumbnail...
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-blue-600 animate-progress-stripes bg-gradient-to-r from-blue-500 to-blue-600"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
        )}

        <label className="inline-block">
          <SecondaryButton
            leftIcon={
              uploadingVideo ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <Video className="w-4 h-4" />
              )
            }
            disabled={data.media.videos.length >= 2 || uploadingVideo}
          >
            {uploadingVideo ? "Processing..." : "Add Videos"}
          </SecondaryButton>
          <input
            type="file"
            hidden
            multiple
            accept="video/*"
            onChange={handleVideoUpload}
            disabled={data.media.videos.length >= 2 || uploadingVideo}
          />
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {data.media.videos.length} / 2 videos • Saved locally until you submit
        </p>

        {/* Video Grid */}
        {data.media.videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {data.media.videos.map((video: any, index: number) => (
              <div
                key={`video-${index}`}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
              >
                <div
                  className="relative w-full h-[200px] bg-gray-100 dark:bg-gray-700 rounded-lg mb-2 overflow-hidden cursor-pointer group"
                  onClick={() => window.open(video.url, "_blank")}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${video.thumbnail})` }}
                  />

                  {/* Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all pointer-events-none">
                    <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      removeVideo(index);
                    }}
                    className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-800 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </button>

                  {/* Change Thumbnail Button */}
                  <button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      openThumbnailSelector(index, video.url, video.thumbnail);
                    }}
                    title="Change Thumbnail"
                    className="absolute top-12 right-2 p-1 bg-white dark:bg-gray-800 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </button>

                  {/* Video Badge */}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                    VIDEO {index + 1}
                  </div>

                  {/* File Size Badge */}
                  {video.size && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                      {(video.size / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {video.name || `Video ${index + 1}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp Image Editor Modal */}
      {selectedImageForEdit && (
        <WhatsAppImageEditor
          open={whatsAppEditorOpen}
          imageUrl={selectedImageForEdit.url}
          initialCrop={selectedImageForEdit.currentCrop?.crop}
          initialZoom={selectedImageForEdit.currentCrop?.zoom}
          onClose={() => {
            setWhatsAppEditorOpen(false);
            setSelectedImageForEdit(null);
          }}
          onSave={handleWhatsAppSave}
        />
      )}

      {/* Video Thumbnail Selector Modal */}
      {selectedVideoForThumbnail && (
        <VideoThumbnailSelector
          open={thumbnailSelectorOpen}
          videoUrl={selectedVideoForThumbnail.url}
          currentThumbnail={selectedVideoForThumbnail.currentThumbnail}
          onClose={() => {
            setThumbnailSelectorOpen(false);
            setSelectedVideoForThumbnail(null);
          }}
          onSave={handleThumbnailSave}
        />
      )}
    </div>
  );
}
