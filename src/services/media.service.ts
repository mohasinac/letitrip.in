/**
 * @fileoverview Service Module
 * @module src/services/media.service
 * @description This file contains service functions for media operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { apiService } from "./api.service";

/**
 * UploadMediaData interface
 * 
 * @interface
 * @description Defines the structure and contract for UploadMediaData
 */
interface UploadMediaData {
  /** File */
  file: File;
  /** Context */
  context:
    | "product"
    | "shop"
    | "auction"
    | "review"
    | "return"
    | "avatar"
    | "category";
  /** Context Id */
  contextId?: string;
  /** Slug */
  slug?: string;
  /** Description */
  description?: string;
}

/**
 * MediaItem interface
 * 
 * @interface
 * @description Defines the structure and contract for MediaItem
 */
interface MediaItem {
  /** Id */
  id: string;
  /** Url */
  url: string;
  /** Thumbnail Url */
  thumbnailUrl?: string;
  /** Type */
  type: "image" | "video";
  /** Size */
  size: number;
  /** Mime Type */
  mimeType: string;
  /** Slug */
  slug?: string;
  /** Description */
  description?: string;
  /** Context */
  context: string;
  /** Context Id */
  contextId?: string;
  /** Uploaded By */
  uploadedBy: string;
  /** Created At */
  createdAt: Date;
}

/**
 * UpdateMediaData interface
 * 
 * @interface
 * @description Defines the structure and contract for UpdateMediaData
 */
interface UpdateMediaData {
  /** Slug */
  slug?: string;
  /** Description */
  description?: string;
}

/**
 * MediaUploadResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for MediaUploadResponse
 */
interface MediaUploadResponse {
  /** Url */
  url: string;
  /** Thumbnail Url */
  thumbnailUrl?: string;
  /** Id */
  id: string;
}

/**
 * MediaService class
 * 
 * @class
 * @description Description of MediaService class functionality
 */
class MediaService {
  // Upload single media file
  async upload(data: UploadMediaData): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("context", data.context);
    if (data.contextId) formData.append("contextId", data.contextId);
    if (data.slug) formData.append("slug", data.slug);
    if (data.description) formData.append("description", data.description);

    const response = await fetch("/api/media/upload", {
      /** Method */
      method: "POST",
      /** Body */
      body: formData,
    });

    if (!response.ok) {
      /**
 * Performs error operation
 *
 * @returns {any} The error result
 *
 */
const error = await response
        .json()
        .catch(() => ({ error: "Failed to upload media" }));
      throw new Error(error.error || error.message || "Failed to upload media");
    }

    const result = await response.json();

    // Handle API response format { success: true, url, id }
    if (!result.success) {
      throw new Error(result.error || "Failed to upload media");
    }

    return {
      /** Url */
      url: result.url,
      /** Id */
      id: result.id,
      /** Thumbnail Url */
      thumbnailUrl: result.thumbnailUrl,
    };
  }

  // Upload multiple media files
  async uploadMultiple(
    /** Files */
    files: File[],
    /** Context */
    context: string,
    /** Con/**
 * Performs form data operation
 *
 * @returns {any} The formdata result
 *
 */
text Id */
    contextId?: string,
  ): Promise<MediaUploadResponse[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("context", context);
    if (contextId) formData.append("contextId", contextId);

    const response = awai/**
 * Performs error operation
 *
 * @returns {any} The error result
 *
 */
t fetch("/api/media/upload-multiple", {
      /** Method */
      method: "POST",
      /** Body */
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Failed to upload media" }));
      throw new Error(error.error || error.message || "Failed to upload media");
    }

    const result = await response.json();

    // Handle API response format
    if (!result.success) {
      throw new Error(result.error || "Failed to upload media");
    }

    return result.uploads || [];
  }

  // Get media by ID
  async getById(id: string): Promise<MediaItem> {
    return apiService.get<MediaItem>(`/media/${id}`);
  }

  // Update media metadata (owner/admin)
  async updateMetadata(id: string, data: UpdateMediaData): Promise<MediaItem> {
    return apiService.patch<MediaItem>(`/media/${id}`, data);
  }

  // Delete media (owner/admin)
  async delete(id: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/media/${id}`);
  }

  // Delete media by URL or path from Firebase Storage
  async deleteByUrl(
    /** Url */
    url: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch("/api/media/delete", {
      /** Method */
      method: "DELETE",
      /** Headers */
      headers: {
        "Content-Type": "application/json",
      },
      /** Body */
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete media");
    }

    return response.json();
  }

  // Delete media by path from Firebase Storage
  async deleteByPath(
    /** Path */
    path: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch("/api/media/delete", {
      /** Method */
      method: "DELETE",
      /** Headers */
      headers: {
        "Content-Type": "application/json",
      },
      /** Body */
      body: JSON.stringify({ path }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete media");
    }

    return response.json();
  }

  // Get media by context
  async getByContext(context: string, contextId: string): Promise<MediaItem[]> {
    return apiService.get<MediaItem[]>(
      `/media/context/${context}/${contextId}`,
    );
  }

  // Generate signed URL for upload (for large files)
  async getUploadUrl(
    /** File Name */
    fileName: string,
    /** File Type */
    fileType: string,
    /** Context */
    context: string,
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    return apiService.post<{ uploadUrl: string; fileUrl: string }>(
      "/media/upload-url",
      {
        fileName,
        fileType,
        context,
      },
    );
  }

  // Confirm upload (after using signed URL)
  async confirmUpload(
    /** File Url */
    fileUrl: string,
    /** Metadata */
    metadata: {
      /** Context */
      context: string;
      /** Context Id */
      contextId?: string;
      /** Slug */
      slug?: string;
      /** Description */
      description?: string;
    },
  ): Promise<MediaItem> {
    return apiService.post<MediaItem>("/media/confirm-upload", {
      fileUrl,
      ...metadata,
    });
  }

  // Validate file before upload
  validateFile(
    /** File */
    file: File,
    /** Max Size M B */
    maxSizeMB: number,
    /** Allowed Types */
    allowedTypes: string[],
  ): { valid: boolean; error?: string } {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        /** Valid */
        valid: false,
        /** Error */
        error: `File size exceeds ${maxSizeMB}MB limit`,
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        /** Valid */
        valid: false,
        /** Error */
        error: `File type ${file.type} is not allowed`,
      };
    }

    return { valid: true };
  }

  // Get media constraints
  getConstraints(context: string): {
    /** Max Size M B */
    maxSizeMB: number;
    /** Allowed Types */
    allowedTypes: string[];
    /** Max Files */
    maxFiles: number;
  } {
    const constraints: Record<
      string,
      { maxSizeMB: number; allowedTypes: string[]; maxFiles: number }
    > = {
      /** Product */
      product: {
        /** Max Size M B */
        maxSizeMB: 5,
        /** Allowed Types */
        allowedTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4"],
        /** Max Files */
        maxFiles: 10,
      },
      /** Shop */
      shop: {
        /** Max Size M B */
        maxSizeMB: 2,
        /** Allowed Types */
        allowedTypes: ["image/jpeg", "image/png", "image/webp"],
        /** Max Files */
        maxFiles: 2,
      },
      /** Auction */
      auction: {
        /** Max Size M B */
        maxSizeMB: 5,
        /** Allowed Types */
        allowedTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4"],
        /** Max Files */
        maxFiles: 10,
      },
      /** Review */
      review: {
        /** Max Size M B */
        maxSizeMB: 3,
        /** Allowed Types */
        allowedTypes: ["image/jpeg", "image/png", "video/mp4"],
        /** Max Files */
        maxFiles: 5,
      },
      /** Return */
      return: {
        /** Max Size M B */
        maxSizeMB: 3,
        /** Allowed Types */
        allowedTypes: ["image/jpeg", "image/png", "video/mp4"],
        /** Max Files */
        maxFiles: 5,
      },
      /** Avatar */
      avatar: {
        /** Max Size M B */
        maxSizeMB: 1,
        /** Allowed Types */
        allowedTypes: ["image/jpeg", "image/png", "image/webp"],
        /** Max Files */
        maxFiles: 1,
      },
      /** Category */
      category: {
        /** Max Size M B */
        maxSizeMB: 2,
        /** Allowed Types */
        allowedTypes: ["image/jpeg", "image/png", "image/webp"],
        /** Max Files */
        maxFiles: 1,
      },
    };

    return constraints[context] || constraints.product;
  }
}

export const mediaService = new MediaService();
export type {
  UploadMediaData,
  MediaItem,
  UpdateMediaData,
  MediaUploadResponse,
};
