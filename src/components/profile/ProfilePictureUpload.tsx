"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface ProfilePictureUploadProps {
  currentAvatar?: string;
  onUpload: (avatarUrl: string) => Promise<void>;
}

export default function ProfilePictureUpload({
  currentAvatar,
  onUpload,
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");

      const response = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      await onUpload(data.data.url);
      toast.success("Profile picture updated successfully!");
      setPreview(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayAvatar = preview || currentAvatar;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100">
          {displayAvatar ? (
            <Image
              src={displayAvatar}
              alt="Profile"
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <Camera className="w-12 h-12 text-white" />
            </div>
          )}
        </div>

        {/* Upload button overlay */}
        <button
          onClick={handleClick}
          disabled={uploading}
          className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Change profile picture"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Camera className="w-5 h-5" />
          )}
        </button>

        {/* Remove preview button */}
        {preview && !uploading && (
          <button
            onClick={handleRemove}
            className="absolute top-0 right-0 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
            title="Remove preview"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="text-center">
        <button
          onClick={handleClick}
          disabled={uploading}
          className="flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Uploading..." : "Change Photo"}
        </button>
        <p className="text-xs text-gray-500 mt-1">
          JPG, PNG or GIF. Max size 5MB.
        </p>
      </div>
    </div>
  );
}
