/**
 *export interface StaticAsset {
  id: string;
  name: string;
  type: 'payment-logo' | 'icon' | 'image' | 'video' | 'document';
  url: string;
  storagePath: string;
  category?: string | null;
  uploadedBy: string;
  uploadedAt: string;
  size: number;
  contentType: string;
  metadata?: Record<string, any>;
}s Service (Client-side)
 * All operations go through API routes (following architecture pattern)
 */

import { logServiceError } from "@letitrip/react-library";
import { apiService } from "./api.service";

export interface StaticAsset {
  id: string;
  name: string;
  type: "payment-logo" | "icon" | "image" | "video" | "document";
  url: string;
  storagePath: string;
  category?: string;
  uploadedBy: string;
  uploadedAt: string;
  size: number;
  contentType: string;
  metadata?: Record<string, any>;
}

export interface AssetUploadResult {
  asset: StaticAsset;
  success: boolean;
  error?: string;
}

class StaticAssetsService {
  private readonly BASE_PATH = "/admin/static-assets";

  /**
   * Get all static assets with optional filters
   */
  async getAssets(filters?: {
    type?: StaticAsset["type"];
    category?: string;
  }): Promise<StaticAsset[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.category) params.append("category", filters.category);

    const queryString = params.toString();
    const endpoint = queryString
      ? `${this.BASE_PATH}?${queryString}`
      : this.BASE_PATH;

    const response = await apiService.get<{ assets: StaticAsset[] }>(endpoint);
    return response.assets || [];
  }

  /**
   * Get assets by type
   */
  async getAssetsByType(type: StaticAsset["type"]): Promise<StaticAsset[]> {
    return this.getAssets({ type });
  }

  /**
   * Get assets by category
   */
  async getAssetsByCategory(category: string): Promise<StaticAsset[]> {
    return this.getAssets({ category });
  }

  /**
   * Get single asset
   */
  async getAsset(id: string): Promise<StaticAsset> {
    const response = await apiService.get<{ asset: StaticAsset }>(
      `${this.BASE_PATH}/${id}`,
    );
    return response.asset;
  }

  /**
   * Request upload URL (server generates signed URL)
   */
  async requestUploadUrl(data: {
    fileName: string;
    contentType: string;
    type: StaticAsset["type"];
    category?: string;
  }): Promise<{ uploadUrl: string; assetId: string; storagePath: string }> {
    return apiService.post<{
      uploadUrl: string;
      assetId: string;
      storagePath: string;
    }>(`${this.BASE_PATH}/upload-url`, data);
  }

  /**
   * Upload file (2-step process: get URL, then upload)
   */
  async uploadAsset(
    file: File,
    type: StaticAsset["type"],
    category?: string,
  ): Promise<AssetUploadResult> {
    try {
      // Step 1: Request upload URL from server
      const { uploadUrl, assetId, storagePath } = await this.requestUploadUrl({
        fileName: file.name,
        contentType: file.type,
        type,
        category,
      });

      // Step 2: Upload directly to Firebase Storage
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload to storage failed");
      }

      // Step 3: Notify server that upload completed
      const asset = await apiService.post<StaticAsset>(
        `${this.BASE_PATH}/confirm-upload`,
        {
          assetId,
          name: file.name,
          type,
          storagePath,
          category,
          size: file.size,
          contentType: file.type,
        },
      );

      return {
        asset,
        success: true,
      };
    } catch (error: any) {
      return {
        asset: {} as StaticAsset,
        success: false,
        error: error.message || "Upload failed",
      };
    }
  }

  /**
   * Update asset metadata
   */
  async updateAsset(
    id: string,
    updates: Partial<StaticAsset>,
  ): Promise<StaticAsset> {
    const response = await apiService.patch<{ asset: StaticAsset }>(
      `${this.BASE_PATH}/${id}`,
      updates,
    );
    return response.asset;
  }

  /**
   * Delete asset
   */
  async deleteAsset(id: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Get payment logo URL by payment ID
   */
  async getPaymentLogoUrl(paymentId: string): Promise<string | null> {
    try {
      const logos = await this.getAssetsByType("payment-logo");
      const logo = logos.find((l) => l.metadata?.paymentId === paymentId);
      return logo ? logo.url : null;
    } catch (error) {
      logServiceError(
        "StaticAssetsService",
        "getPaymentLogoUrl",
        error as Error,
      );
      return null;
    }
  }
}

export const staticAssetsService = new StaticAssetsService();

// Export for backward compatibility
export const {
  getAssets,
  getAssetsByType,
  getAssetsByCategory,
  getAsset,
  uploadAsset,
  updateAsset,
  deleteAsset,
  getPaymentLogoUrl,
} = staticAssetsService;

export default staticAssetsService;
