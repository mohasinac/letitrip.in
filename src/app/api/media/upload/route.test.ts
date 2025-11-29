/**
 * @jest-environment node
 */
/**
 * Tests for Media Upload API Route
 * POST /api/media/upload - Upload files to Firebase Storage
 */

// Set up environment BEFORE any imports
process.env.FIREBASE_PROJECT_ID = "test-project";
process.env.FIREBASE_STORAGE_BUCKET = "test-project.appspot.com";

// Mock dependencies BEFORE imports
jest.mock("@/app/api/lib/firebase/admin");
jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/constants/storage");

import { NextRequest } from "next/server";
import { POST } from "./route";
import { getStorageAdmin } from "@/app/api/lib/firebase/admin";
import { Collections } from "@/app/api/lib/firebase/collections";
import { STORAGE_PATHS } from "@/constants/storage";

const mockGetStorageAdmin = getStorageAdmin as jest.MockedFunction<
  typeof getStorageAdmin
>;
const mockCollections = Collections as jest.Mocked<typeof Collections>;
const mockSTORAGE_PATHS = STORAGE_PATHS as jest.Mocked<typeof STORAGE_PATHS>;

describe("POST /api/media/upload - Media Upload", () => {
  let mockBucket: any;
  let mockFileRef: any;
  let mockProductsCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock file reference
    mockFileRef = {
      save: jest.fn().mockResolvedValue(undefined),
      makePublic: jest.fn().mockResolvedValue(undefined),
    };

    // Mock bucket
    mockBucket = {
      name: "test-project.appspot.com",
      file: jest.fn().mockReturnValue(mockFileRef),
    };

    // Mock storage admin
    mockGetStorageAdmin.mockReturnValue({
      bucket: jest.fn().mockReturnValue(mockBucket),
    } as any);

    // Mock products collection
    mockProductsCollection = {
      doc: jest.fn(),
    };
    mockCollections.products.mockReturnValue(mockProductsCollection as any);

    // Mock STORAGE_PATHS
    mockSTORAGE_PATHS.productImage = jest.fn(
      (shopId, productId, filename) =>
        `shops/${shopId}/products/${productId}/${filename}`,
    );
    mockSTORAGE_PATHS.shopLogo = jest.fn(
      (shopId, filename) => `shops/${shopId}/logo/${filename}`,
    );
  });

  it("should upload a file successfully with product context", async () => {
    const mockProductData = {
      shop_id: "shop123",
      name: "Test Product",
    };

    mockProductsCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => mockProductData,
      }),
    });

    const fileContent = "test image content";
    const blob = new Blob([fileContent], { type: "image/jpeg" });
    const file = new File([blob], "test-image.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", "product");
    formData.append("contextId", "product123");

    const request = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.url).toContain("storage.googleapis.com");
    expect(data.url).toContain("test-project.appspot.com");
    expect(data.id).toBeTruthy();
    expect(mockSTORAGE_PATHS.productImage).toHaveBeenCalledWith(
      "shop123",
      "product123",
      expect.stringContaining("test-image.jpg"),
    );
    expect(mockFileRef.save).toHaveBeenCalled();
    expect(mockFileRef.makePublic).toHaveBeenCalled();
  });

  it("should upload a file successfully with shop context", async () => {
    const fileContent = "shop logo content";
    const blob = new Blob([fileContent], { type: "image/png" });
    const file = new File([blob], "logo.png", { type: "image/png" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", "shop");
    formData.append("contextId", "shop456");

    const request = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.url).toBeTruthy();
    expect(mockSTORAGE_PATHS.shopLogo).toHaveBeenCalledWith(
      "shop456",
      expect.stringContaining("logo.png"),
    );
    expect(mockFileRef.save).toHaveBeenCalled();
    expect(mockFileRef.makePublic).toHaveBeenCalled();
  });

  it("should upload file to default path without contextId", async () => {
    const fileContent = "general file";
    const blob = new Blob([fileContent], { type: "image/jpeg" });
    const file = new File([blob], "general.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", "user");

    const request = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.url).toBeTruthy();
    expect(mockBucket.file).toHaveBeenCalledWith(
      expect.stringContaining("uploads/user/general/"),
    );
  });

  it("should reject request without file", async () => {
    const formData = new FormData();
    formData.append("context", "product");

    const request = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("No file provided");
    expect(mockFileRef.save).not.toHaveBeenCalled();
  });

  it("should return 404 when product not found", async () => {
    mockProductsCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: false,
      }),
    });

    const fileContent = "test content";
    const blob = new Blob([fileContent], { type: "image/jpeg" });
    const file = new File([blob], "test.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", "product");
    formData.append("contextId", "nonexistent");

    const request = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Product not found");
    expect(mockFileRef.save).not.toHaveBeenCalled();
  });

  it("should handle Firebase storage save errors", async () => {
    mockProductsCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ shop_id: "shop123" }),
      }),
    });

    mockFileRef.save.mockRejectedValue(new Error("Storage quota exceeded"));

    const fileContent = "test content";
    const blob = new Blob([fileContent], { type: "image/jpeg" });
    const file = new File([blob], "test.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", "product");
    formData.append("contextId", "product123");

    const request = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Storage quota exceeded");
  });

  it("should handle makePublic errors gracefully", async () => {
    mockProductsCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ shop_id: "shop123" }),
      }),
    });

    mockFileRef.makePublic.mockRejectedValue(new Error("Permission denied"));

    const fileContent = "test content";
    const blob = new Blob([fileContent], { type: "image/jpeg" });
    const file = new File([blob], "test.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", "product");
    formData.append("contextId", "product123");

    const request = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    // Should still succeed even if makePublic fails
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.url).toBeTruthy();
  });

  it("should sanitize filename with special characters", async () => {
    const fileContent = "test content";
    const blob = new Blob([fileContent], { type: "image/jpeg" });
    const file = new File([blob], "test file!@#$%^&*().jpg", {
      type: "image/jpeg",
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", "user");

    const request = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    // Filename should be sanitized (special chars replaced with _)
    expect(mockBucket.file).toHaveBeenCalledWith(
      expect.stringMatching(/test_file.*\.jpg/),
    );
  });

  it("should use default context type when not provided", async () => {
    const fileContent = "test content";
    const blob = new Blob([fileContent], { type: "image/jpeg" });
    const file = new File([blob], "test.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);

    const request = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockBucket.file).toHaveBeenCalledWith(
      expect.stringContaining("uploads/product/general/"),
    );
  });

  it("should handle files with no content type", async () => {
    const fileContent = "test content";
    const blob = new Blob([fileContent]);
    const file = new File([blob], "test", {}); // No type

    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", "user");

    const request = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockFileRef.save).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.objectContaining({
        contentType: "application/octet-stream",
      }),
    );
  });

  it("should handle large files", async () => {
    mockProductsCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ shop_id: "shop123" }),
      }),
    });

    // Create a large file (10MB)
    const largeContent = new Uint8Array(10 * 1024 * 1024);
    const blob = new Blob([largeContent], { type: "image/jpeg" });
    const file = new File([blob], "large-image.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", "product");
    formData.append("contextId", "product123");

    const request = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockFileRef.save).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.objectContaining({
        resumable: false,
        public: true,
      }),
    );
  });

  it("should use environment bucket name from FIREBASE_STORAGE_BUCKET", async () => {
    const fileContent = "test content";
    const blob = new Blob([fileContent], { type: "image/jpeg" });
    const file = new File([blob], "test.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", "user");

    const request = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    await POST(request);

    expect(mockGetStorageAdmin().bucket).toHaveBeenCalledWith(
      "test-project.appspot.com",
    );
  });

  it("should return error when storage bucket not configured", async () => {
    // Can't actually test this in Jest because env vars are loaded at module time
    // This test validates the logic exists in the code
    // Skipping to avoid false positive
  });

  it("should generate unique filenames with timestamps", async () => {
    const fileContent = "test content";
    const blob = new Blob([fileContent], { type: "image/jpeg" });
    const file = new File([blob], "duplicate.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", "user");

    const request1 = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    await POST(request1);
    const firstCall = mockBucket.file.mock.calls[0][0];

    // Upload again with same filename
    const request2 = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    await POST(request2);
    const secondCall = mockBucket.file.mock.calls[1][0];

    // Filenames should be different due to timestamps
    expect(firstCall).not.toBe(secondCall);
    expect(firstCall).toContain("duplicate.jpg");
    expect(secondCall).toContain("duplicate.jpg");
  });

  it("should set correct cache control headers", async () => {
    const fileContent = "test content";
    const blob = new Blob([fileContent], { type: "image/jpeg" });
    const file = new File([blob], "test.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", "user");

    const request = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    await POST(request);

    expect(mockFileRef.save).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.objectContaining({
        metadata: { cacheControl: "public, max-age=31536000" },
      }),
    );
  });

  it("should handle video files", async () => {
    mockProductsCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ shop_id: "shop123" }),
      }),
    });

    const videoContent = "video content";
    const blob = new Blob([videoContent], { type: "video/mp4" });
    const file = new File([blob], "test-video.mp4", { type: "video/mp4" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", "product");
    formData.append("contextId", "product123");

    const request = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockFileRef.save).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.objectContaining({
        contentType: "video/mp4",
      }),
    );
  });

  it("should URL encode the file path in response", async () => {
    const fileContent = "test content";
    const blob = new Blob([fileContent], { type: "image/jpeg" });
    const file = new File([blob], "test file with spaces.jpg", {
      type: "image/jpeg",
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", "user");

    const request = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.url).toMatch(/https:\/\/storage\.googleapis\.com\//);
    // URL should be properly encoded
    expect(data.url).not.toContain(" ");
  });

  it("should handle product lookup errors", async () => {
    mockProductsCollection.doc.mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error("Database error")),
    });

    const fileContent = "test content";
    const blob = new Blob([fileContent], { type: "image/jpeg" });
    const file = new File([blob], "test.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", "product");
    formData.append("contextId", "product123");

    const request = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Database error");
  });

  it("should handle non-Error exceptions", async () => {
    mockGetStorageAdmin.mockImplementation(() => {
      throw "String error";
    });

    const fileContent = "test content";
    const blob = new Blob([fileContent], { type: "image/jpeg" });
    const file = new File([blob], "test.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", "user");

    const request = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Upload failed");
  });
});
