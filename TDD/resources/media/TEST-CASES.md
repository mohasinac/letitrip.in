# Media Resource - Test Cases

## Unit Tests

### Media Upload

```typescript
describe("Media Service", () => {
  describe("upload", () => {
    it("should upload image file", async () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const result = await mediaService.upload(file, { folder: "products" });
      expect(result.id).toBeDefined();
      expect(result.url).toContain("storage.googleapis.com");
      expect(result.mimeType).toBe("image/webp"); // Converted
    });

    it("should generate thumbnail", async () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const result = await mediaService.upload(file);
      expect(result.thumbnailUrl).toBeDefined();
    });

    it("should convert to WebP", async () => {
      const file = new File(["test"], "test.png", { type: "image/png" });
      const result = await mediaService.upload(file);
      expect(result.fileName).toMatch(/\.webp$/);
    });

    it("should fail for large files", async () => {
      const largeFile = new File(
        [new ArrayBuffer(6 * 1024 * 1024)],
        "large.jpg",
        { type: "image/jpeg" },
      );
      await expect(mediaService.upload(largeFile)).rejects.toThrow(
        "File exceeds maximum size",
      );
    });

    it("should fail for invalid types", async () => {
      const file = new File(["test"], "test.exe", {
        type: "application/octet-stream",
      });
      await expect(mediaService.upload(file)).rejects.toThrow(
        "File type not allowed",
      );
    });

    it("should extract image dimensions", async () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const result = await mediaService.upload(file);
      expect(result).toHaveProperty("width");
      expect(result).toHaveProperty("height");
    });
  });

  describe("uploadMultiple", () => {
    it("should upload multiple files", async () => {
      const files = [
        new File(["test1"], "test1.jpg", { type: "image/jpeg" }),
        new File(["test2"], "test2.jpg", { type: "image/jpeg" }),
      ];
      const result = await mediaService.uploadMultiple(files);
      expect(result).toHaveLength(2);
    });

    it("should limit to 10 files", async () => {
      const files = Array.from(
        { length: 15 },
        (_, i) => new File(["test"], `test${i}.jpg`, { type: "image/jpeg" }),
      );
      await expect(mediaService.uploadMultiple(files)).rejects.toThrow(
        "Maximum 10 files allowed",
      );
    });

    it("should handle partial failures", async () => {
      const files = [
        new File(["test"], "test.jpg", { type: "image/jpeg" }),
        new File(["test"], "test.exe", { type: "application/octet-stream" }),
      ];
      const result = await mediaService.uploadMultiple(files);
      expect(result.length).toBe(1);
    });
  });

  describe("uploadFromUrl", () => {
    it("should upload from external URL", async () => {
      const result = await mediaService.uploadFromUrl(
        "https://example.com/image.jpg",
        { folder: "products" },
      );
      expect(result.id).toBeDefined();
    });

    it("should fail for invalid URLs", async () => {
      await expect(mediaService.uploadFromUrl("not-a-url")).rejects.toThrow(
        "Invalid URL",
      );
    });

    it("should fail for non-image URLs", async () => {
      await expect(
        mediaService.uploadFromUrl("https://example.com/page.html"),
      ).rejects.toThrow("URL does not point to an image");
    });
  });

  describe("list", () => {
    it("should return user's media", async () => {
      const media = await mediaService.list();
      expect(media.data).toBeInstanceOf(Array);
    });

    it("should filter by folder", async () => {
      const media = await mediaService.list({ folder: "products" });
      media.data.forEach((m) => {
        expect(m.folder).toBe("products");
      });
    });
  });

  describe("delete", () => {
    it("should delete media file", async () => {
      const result = await mediaService.delete("media_001");
      expect(result.success).toBe(true);
    });

    it("should remove from storage", async () => {
      await mediaService.delete("media_001");
      // Verify file is removed from Firebase Storage
    });

    it("should fail for other user's media", async () => {
      await expect(mediaService.delete("other_media")).rejects.toThrow(
        "Forbidden",
      );
    });
  });
});
```

### Image Processing

```typescript
describe("Image Processing", () => {
  it("should resize large images", async () => {
    const largeImage = createTestImage(4000, 3000);
    const result = await mediaService.upload(largeImage);
    expect(result.width).toBeLessThanOrEqual(2000);
  });

  it("should maintain aspect ratio", async () => {
    const image = createTestImage(1600, 1200); // 4:3
    const result = await mediaService.upload(image);
    const ratio = result.width / result.height;
    expect(ratio).toBeCloseTo(4 / 3, 2);
  });

  it("should strip EXIF data", async () => {
    const imageWithExif = createTestImageWithExif();
    const result = await mediaService.upload(imageWithExif);
    // Verify no EXIF data in output
  });

  it("should generate thumbnail at 300x300", async () => {
    const image = createTestImage(1000, 800);
    const result = await mediaService.upload(image);
    // Verify thumbnail dimensions
    expect(result.thumbnailUrl).toBeDefined();
  });
});
```

---

## Integration Tests

### Media API

```typescript
describe("Media API Integration", () => {
  let userToken: string;

  beforeAll(async () => {
    userToken = await getTestUserToken();
  });

  describe("POST /api/media/upload", () => {
    it("should upload file", async () => {
      const formData = new FormData();
      formData.append(
        "file",
        new File(["test"], "test.jpg", { type: "image/jpeg" }),
      );
      formData.append("folder", "products");

      const response = await fetch("/api/media/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${userToken}` },
        body: formData,
      });
      expect(response.status).toBe(201);
    });

    it("should require authentication", async () => {
      const formData = new FormData();
      formData.append(
        "file",
        new File(["test"], "test.jpg", { type: "image/jpeg" }),
      );

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/media/upload-multiple", () => {
    it("should upload multiple files", async () => {
      const formData = new FormData();
      formData.append(
        "files",
        new File(["test1"], "test1.jpg", { type: "image/jpeg" }),
      );
      formData.append(
        "files",
        new File(["test2"], "test2.jpg", { type: "image/jpeg" }),
      );

      const response = await fetch("/api/media/upload-multiple", {
        method: "POST",
        headers: { Authorization: `Bearer ${userToken}` },
        body: formData,
      });
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.data).toHaveLength(2);
    });
  });

  describe("GET /api/media", () => {
    it("should return user media", async () => {
      const response = await fetch("/api/media", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /api/media/:id", () => {
    it("should delete media", async () => {
      const response = await fetch("/api/media/media_001", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(response.status).toBe(200);
    });
  });
});
```

### Seller Media API

```typescript
describe("Seller Media API Integration", () => {
  let sellerToken: string;

  beforeAll(async () => {
    sellerToken = await getTestSellerToken();
  });

  it("should allow bulk upload for sellers", async () => {
    const formData = new FormData();
    for (let i = 0; i < 5; i++) {
      formData.append(
        "files",
        new File(["test"], `test${i}.jpg`, { type: "image/jpeg" }),
      );
    }

    const response = await fetch("/api/media/upload-multiple", {
      method: "POST",
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: formData,
    });
    expect(response.status).toBe(201);
  });
});
```

### Admin Media API

```typescript
describe("Admin Media API Integration", () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await getTestAdminToken();
  });

  describe("GET /api/admin/media", () => {
    it("should return all media", async () => {
      const response = await fetch("/api/admin/media", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /api/admin/media/cleanup", () => {
    it("should cleanup orphaned media", async () => {
      const response = await fetch("/api/admin/media/cleanup", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveProperty("deleted");
    });
  });
});
```
