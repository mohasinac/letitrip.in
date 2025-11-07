import { apiService } from './api.service';

interface UploadMediaData {
  file: File;
  context: 'product' | 'shop' | 'auction' | 'review' | 'return' | 'avatar' | 'category';
  contextId?: string;
  slug?: string;
  description?: string;
}

interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
  size: number;
  mimeType: string;
  slug?: string;
  description?: string;
  context: string;
  contextId?: string;
  uploadedBy: string;
  createdAt: Date;
}

interface UpdateMediaData {
  slug?: string;
  description?: string;
}

interface MediaUploadResponse {
  url: string;
  thumbnailUrl?: string;
  id: string;
}

class MediaService {
  // Upload single media file
  async upload(data: UploadMediaData): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('context', data.context);
    if (data.contextId) formData.append('contextId', data.contextId);
    if (data.slug) formData.append('slug', data.slug);
    if (data.description) formData.append('description', data.description);
    
    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload media');
    }
    
    return response.json();
  }

  // Upload multiple media files
  async uploadMultiple(files: File[], context: string, contextId?: string): Promise<MediaUploadResponse[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('context', context);
    if (contextId) formData.append('contextId', contextId);
    
    const response = await fetch('/api/media/upload-multiple', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload media');
    }
    
    return response.json();
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

  // Get media by context
  async getByContext(context: string, contextId: string): Promise<MediaItem[]> {
    return apiService.get<MediaItem[]>(`/media/context/${context}/${contextId}`);
  }

  // Generate signed URL for upload (for large files)
  async getUploadUrl(
    fileName: string,
    fileType: string,
    context: string
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    return apiService.post<{ uploadUrl: string; fileUrl: string }>('/media/upload-url', {
      fileName,
      fileType,
      context,
    });
  }

  // Confirm upload (after using signed URL)
  async confirmUpload(fileUrl: string, metadata: {
    context: string;
    contextId?: string;
    slug?: string;
    description?: string;
  }): Promise<MediaItem> {
    return apiService.post<MediaItem>('/media/confirm-upload', {
      fileUrl,
      ...metadata,
    });
  }

  // Validate file before upload
  validateFile(file: File, maxSizeMB: number, allowedTypes: string[]): { valid: boolean; error?: string } {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    return { valid: true };
  }

  // Get media constraints
  getConstraints(context: string): { maxSizeMB: number; allowedTypes: string[]; maxFiles: number } {
    const constraints: Record<string, { maxSizeMB: number; allowedTypes: string[]; maxFiles: number }> = {
      product: {
        maxSizeMB: 5,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
        maxFiles: 10,
      },
      shop: {
        maxSizeMB: 2,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxFiles: 2,
      },
      auction: {
        maxSizeMB: 5,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
        maxFiles: 10,
      },
      review: {
        maxSizeMB: 3,
        allowedTypes: ['image/jpeg', 'image/png', 'video/mp4'],
        maxFiles: 5,
      },
      return: {
        maxSizeMB: 3,
        allowedTypes: ['image/jpeg', 'image/png', 'video/mp4'],
        maxFiles: 5,
      },
      avatar: {
        maxSizeMB: 1,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxFiles: 1,
      },
      category: {
        maxSizeMB: 2,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxFiles: 1,
      },
    };

    return constraints[context] || constraints.product;
  }
}

export const mediaService = new MediaService();
export type { UploadMediaData, MediaItem, UpdateMediaData, MediaUploadResponse };
