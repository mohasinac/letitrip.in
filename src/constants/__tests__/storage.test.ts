import {
  MEDIA_URL_CONFIG,
  STORAGE_BUCKETS,
  STORAGE_CONFIG,
  STORAGE_PATHS,
  StorageBucket,
} from "../storage";

describe("Storage Constants", () => {
  // ============================================================================
  // STORAGE_BUCKETS Tests
  // ============================================================================
  describe("STORAGE_BUCKETS", () => {
    it("should export STORAGE_BUCKETS object", () => {
      expect(STORAGE_BUCKETS).toBeDefined();
      expect(typeof STORAGE_BUCKETS).toBe("object");
    });

    it("should have SHOP_LOGOS bucket", () => {
      expect(STORAGE_BUCKETS.SHOP_LOGOS).toBe("shop-logos");
    });

    it("should have SHOP_BANNERS bucket", () => {
      expect(STORAGE_BUCKETS.SHOP_BANNERS).toBe("shop-banners");
    });

    it("should have PRODUCT_IMAGES bucket", () => {
      expect(STORAGE_BUCKETS.PRODUCT_IMAGES).toBe("product-images");
    });

    it("should have PRODUCT_VIDEOS bucket", () => {
      expect(STORAGE_BUCKETS.PRODUCT_VIDEOS).toBe("product-videos");
    });

    it("should have CATEGORY_IMAGES bucket", () => {
      expect(STORAGE_BUCKETS.CATEGORY_IMAGES).toBe("category-images");
    });

    it("should have AUCTION_IMAGES bucket", () => {
      expect(STORAGE_BUCKETS.AUCTION_IMAGES).toBe("auction-images");
    });

    it("should have AUCTION_VIDEOS bucket", () => {
      expect(STORAGE_BUCKETS.AUCTION_VIDEOS).toBe("auction-videos");
    });

    it("should have USER_AVATARS bucket", () => {
      expect(STORAGE_BUCKETS.USER_AVATARS).toBe("user-avatars");
    });

    it("should have REVIEW_IMAGES bucket", () => {
      expect(STORAGE_BUCKETS.REVIEW_IMAGES).toBe("review-images");
    });

    it("should have REVIEW_VIDEOS bucket", () => {
      expect(STORAGE_BUCKETS.REVIEW_VIDEOS).toBe("review-videos");
    });

    it("should have RETURN_IMAGES bucket", () => {
      expect(STORAGE_BUCKETS.RETURN_IMAGES).toBe("return-images");
    });

    it("should have RETURN_VIDEOS bucket", () => {
      expect(STORAGE_BUCKETS.RETURN_VIDEOS).toBe("return-videos");
    });

    it("should have TICKET_ATTACHMENTS bucket", () => {
      expect(STORAGE_BUCKETS.TICKET_ATTACHMENTS).toBe("ticket-attachments");
    });

    it("should have INVOICES bucket", () => {
      expect(STORAGE_BUCKETS.INVOICES).toBe("invoices");
    });

    it("should have SHIPPING_LABELS bucket", () => {
      expect(STORAGE_BUCKETS.SHIPPING_LABELS).toBe("shipping-labels");
    });

    it("should have TEMP_UPLOADS bucket", () => {
      expect(STORAGE_BUCKETS.TEMP_UPLOADS).toBe("temp-uploads");
    });

    it("should have consistent naming convention", () => {
      Object.values(STORAGE_BUCKETS).forEach((bucket) => {
        expect(bucket).toMatch(/^[a-z-]+$/);
      });
    });

    it("should have unique bucket names", () => {
      const buckets = Object.values(STORAGE_BUCKETS);
      const uniqueBuckets = new Set(buckets);
      expect(uniqueBuckets.size).toBe(buckets.length);
    });
  });

  // ============================================================================
  // STORAGE_PATHS Tests
  // ============================================================================
  describe("STORAGE_PATHS", () => {
    it("should export STORAGE_PATHS object", () => {
      expect(STORAGE_PATHS).toBeDefined();
      expect(typeof STORAGE_PATHS).toBe("object");
    });

    describe("shopLogo", () => {
      it("should generate valid shop logo path", () => {
        const path = STORAGE_PATHS.shopLogo("shop123", "logo.png");
        expect(path).toBe("shop-logos/shop123/logo.png");
      });

      it("should include shop ID in path", () => {
        const path = STORAGE_PATHS.shopLogo("test-shop", "image.jpg");
        expect(path).toContain("test-shop");
      });
    });

    describe("shopBanner", () => {
      it("should generate valid shop banner path", () => {
        const path = STORAGE_PATHS.shopBanner("shop456", "banner.jpg");
        expect(path).toBe("shop-banners/shop456/banner.jpg");
      });
    });

    describe("productImage", () => {
      it("should generate valid product image path", () => {
        const path = STORAGE_PATHS.productImage("shop1", "prod1", "image.png");
        expect(path).toBe("product-images/shop1/prod1/image.png");
      });

      it("should include shop ID and product ID", () => {
        const path = STORAGE_PATHS.productImage("s1", "p1", "test.jpg");
        expect(path).toContain("s1");
        expect(path).toContain("p1");
      });
    });

    describe("productVideo", () => {
      it("should generate valid product video path", () => {
        const path = STORAGE_PATHS.productVideo("shop2", "prod2", "video.mp4");
        expect(path).toBe("product-videos/shop2/prod2/video.mp4");
      });
    });

    describe("categoryImage", () => {
      it("should generate valid category image path", () => {
        const path = STORAGE_PATHS.categoryImage("cat1", "category.jpg");
        expect(path).toBe("category-images/cat1/category.jpg");
      });
    });

    describe("auctionImage", () => {
      it("should generate valid auction image path", () => {
        const path = STORAGE_PATHS.auctionImage("shop3", "auc1", "image.jpg");
        expect(path).toBe("auction-images/shop3/auc1/image.jpg");
      });
    });

    describe("auctionVideo", () => {
      it("should generate valid auction video path", () => {
        const path = STORAGE_PATHS.auctionVideo("shop4", "auc2", "video.mp4");
        expect(path).toBe("auction-videos/shop4/auc2/video.mp4");
      });
    });

    describe("userAvatar", () => {
      it("should generate valid user avatar path", () => {
        const path = STORAGE_PATHS.userAvatar("user123", "avatar.png");
        expect(path).toBe("user-avatars/user123/avatar.png");
      });
    });

    describe("reviewImage", () => {
      it("should generate valid review image path", () => {
        const path = STORAGE_PATHS.reviewImage("user1", "review1", "photo.jpg");
        expect(path).toBe("review-images/user1/review1/photo.jpg");
      });
    });

    describe("reviewVideo", () => {
      it("should generate valid review video path", () => {
        const path = STORAGE_PATHS.reviewVideo("user2", "review2", "video.mp4");
        expect(path).toBe("review-videos/user2/review2/video.mp4");
      });
    });

    describe("returnImage", () => {
      it("should generate valid return image path", () => {
        const path = STORAGE_PATHS.returnImage(
          "user3",
          "return1",
          "evidence.jpg"
        );
        expect(path).toBe("return-images/user3/return1/evidence.jpg");
      });
    });

    describe("returnVideo", () => {
      it("should generate valid return video path", () => {
        const path = STORAGE_PATHS.returnVideo(
          "user4",
          "return2",
          "evidence.mp4"
        );
        expect(path).toBe("return-videos/user4/return2/evidence.mp4");
      });
    });

    describe("ticketAttachment", () => {
      it("should generate valid ticket attachment path", () => {
        const path = STORAGE_PATHS.ticketAttachment(
          "user5",
          "ticket1",
          "file.pdf"
        );
        expect(path).toBe("ticket-attachments/user5/ticket1/file.pdf");
      });
    });

    describe("invoice", () => {
      it("should generate valid invoice path", () => {
        const path = STORAGE_PATHS.invoice("order123", "invoice.pdf");
        expect(path).toBe("invoices/order123/invoice.pdf");
      });
    });

    describe("shippingLabel", () => {
      it("should generate valid shipping label path", () => {
        const path = STORAGE_PATHS.shippingLabel("order456", "label.pdf");
        expect(path).toBe("shipping-labels/order456/label.pdf");
      });
    });

    describe("tempUpload", () => {
      it("should generate valid temp upload path", () => {
        const path = STORAGE_PATHS.tempUpload("user6", "temp.jpg");
        expect(path).toContain("temp-uploads/user6/");
        expect(path).toContain("temp.jpg");
      });

      it("should include timestamp in path", () => {
        const before = Date.now();
        const path = STORAGE_PATHS.tempUpload("user7", "test.png");
        const after = Date.now();

        const match = path.match(/temp-uploads\/user7\/(\d+)-test\.png/);
        expect(match).not.toBeNull();
        const timestamp = parseInt(match![1], 10);
        expect(timestamp).toBeGreaterThanOrEqual(before);
        expect(timestamp).toBeLessThanOrEqual(after);
      });
    });
  });

  // ============================================================================
  // STORAGE_CONFIG Tests
  // ============================================================================
  describe("STORAGE_CONFIG", () => {
    it("should export STORAGE_CONFIG object", () => {
      expect(STORAGE_CONFIG).toBeDefined();
      expect(typeof STORAGE_CONFIG).toBe("object");
    });

    describe("MAX_FILE_SIZE", () => {
      it("should have IMAGE max size", () => {
        expect(STORAGE_CONFIG.MAX_FILE_SIZE.IMAGE).toBe(10 * 1024 * 1024);
      });

      it("should have VIDEO max size", () => {
        expect(STORAGE_CONFIG.MAX_FILE_SIZE.VIDEO).toBe(100 * 1024 * 1024);
      });

      it("should have DOCUMENT max size", () => {
        expect(STORAGE_CONFIG.MAX_FILE_SIZE.DOCUMENT).toBe(5 * 1024 * 1024);
      });

      it("should have AVATAR max size", () => {
        expect(STORAGE_CONFIG.MAX_FILE_SIZE.AVATAR).toBe(2 * 1024 * 1024);
      });

      it("should have VIDEO size greater than IMAGE", () => {
        expect(STORAGE_CONFIG.MAX_FILE_SIZE.VIDEO).toBeGreaterThan(
          STORAGE_CONFIG.MAX_FILE_SIZE.IMAGE
        );
      });
    });

    describe("ALLOWED_MIME_TYPES", () => {
      it("should have IMAGES mime types", () => {
        expect(Array.isArray(STORAGE_CONFIG.ALLOWED_MIME_TYPES.IMAGES)).toBe(
          true
        );
        expect(STORAGE_CONFIG.ALLOWED_MIME_TYPES.IMAGES.length).toBeGreaterThan(
          0
        );
      });

      it("should have valid image MIME types", () => {
        STORAGE_CONFIG.ALLOWED_MIME_TYPES.IMAGES.forEach((type) => {
          expect(type).toMatch(/^image\//);
        });
      });

      it("should have VIDEOS mime types", () => {
        expect(Array.isArray(STORAGE_CONFIG.ALLOWED_MIME_TYPES.VIDEOS)).toBe(
          true
        );
        expect(STORAGE_CONFIG.ALLOWED_MIME_TYPES.VIDEOS.length).toBeGreaterThan(
          0
        );
      });

      it("should have valid video MIME types", () => {
        STORAGE_CONFIG.ALLOWED_MIME_TYPES.VIDEOS.forEach((type) => {
          expect(type).toMatch(/^video\//);
        });
      });

      it("should have DOCUMENTS mime types", () => {
        expect(Array.isArray(STORAGE_CONFIG.ALLOWED_MIME_TYPES.DOCUMENTS)).toBe(
          true
        );
        expect(
          STORAGE_CONFIG.ALLOWED_MIME_TYPES.DOCUMENTS.length
        ).toBeGreaterThan(0);
      });
    });

    describe("ALLOWED_EXTENSIONS", () => {
      it("should have IMAGES extensions", () => {
        expect(Array.isArray(STORAGE_CONFIG.ALLOWED_EXTENSIONS.IMAGES)).toBe(
          true
        );
        expect(STORAGE_CONFIG.ALLOWED_EXTENSIONS.IMAGES.length).toBeGreaterThan(
          0
        );
      });

      it("should have valid image extensions", () => {
        STORAGE_CONFIG.ALLOWED_EXTENSIONS.IMAGES.forEach((ext) => {
          expect(ext).toMatch(/^\.[a-z]+$/);
        });
      });

      it("should have VIDEOS extensions", () => {
        expect(Array.isArray(STORAGE_CONFIG.ALLOWED_EXTENSIONS.VIDEOS)).toBe(
          true
        );
        expect(STORAGE_CONFIG.ALLOWED_EXTENSIONS.VIDEOS.length).toBeGreaterThan(
          0
        );
      });

      it("should have valid video extensions", () => {
        STORAGE_CONFIG.ALLOWED_EXTENSIONS.VIDEOS.forEach((ext) => {
          expect(ext).toMatch(/^\.[a-z0-9]+$/);
        });
      });

      it("should have DOCUMENTS extensions", () => {
        expect(Array.isArray(STORAGE_CONFIG.ALLOWED_EXTENSIONS.DOCUMENTS)).toBe(
          true
        );
        expect(
          STORAGE_CONFIG.ALLOWED_EXTENSIONS.DOCUMENTS.length
        ).toBeGreaterThan(0);
      });
    });

    describe("IMAGE_OPTIMIZATION", () => {
      it("should have THUMBNAIL config", () => {
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.THUMBNAIL).toBeDefined();
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.THUMBNAIL.width).toBe(200);
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.THUMBNAIL.height).toBe(200);
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.THUMBNAIL.quality).toBe(80);
      });

      it("should have SMALL config", () => {
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.SMALL).toBeDefined();
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.SMALL.width).toBe(400);
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.SMALL.height).toBe(400);
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.SMALL.quality).toBe(85);
      });

      it("should have MEDIUM config", () => {
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.MEDIUM).toBeDefined();
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.MEDIUM.width).toBe(800);
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.MEDIUM.height).toBe(800);
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.MEDIUM.quality).toBe(85);
      });

      it("should have LARGE config", () => {
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.LARGE).toBeDefined();
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.LARGE.width).toBe(1200);
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.LARGE.height).toBe(1200);
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.LARGE.quality).toBe(90);
      });

      it("should have increasing sizes", () => {
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.SMALL.width).toBeGreaterThan(
          STORAGE_CONFIG.IMAGE_OPTIMIZATION.THUMBNAIL.width
        );
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.MEDIUM.width).toBeGreaterThan(
          STORAGE_CONFIG.IMAGE_OPTIMIZATION.SMALL.width
        );
        expect(STORAGE_CONFIG.IMAGE_OPTIMIZATION.LARGE.width).toBeGreaterThan(
          STORAGE_CONFIG.IMAGE_OPTIMIZATION.MEDIUM.width
        );
      });
    });

    describe("VIDEO_OPTIMIZATION", () => {
      it("should have THUMBNAIL config", () => {
        expect(STORAGE_CONFIG.VIDEO_OPTIMIZATION.THUMBNAIL).toBeDefined();
        expect(STORAGE_CONFIG.VIDEO_OPTIMIZATION.THUMBNAIL.timestamp).toBe(1);
        expect(STORAGE_CONFIG.VIDEO_OPTIMIZATION.THUMBNAIL.width).toBe(400);
        expect(STORAGE_CONFIG.VIDEO_OPTIMIZATION.THUMBNAIL.height).toBe(300);
      });

      it("should have MAX_DURATION", () => {
        expect(STORAGE_CONFIG.VIDEO_OPTIMIZATION.MAX_DURATION).toBe(300);
      });
    });

    describe("CLEANUP", () => {
      it("should have TEMP_FILES_TTL", () => {
        expect(STORAGE_CONFIG.CLEANUP.TEMP_FILES_TTL).toBe(24 * 60 * 60 * 1000);
      });

      it("should have FAILED_UPLOAD_RETRY_COUNT", () => {
        expect(STORAGE_CONFIG.CLEANUP.FAILED_UPLOAD_RETRY_COUNT).toBe(3);
      });
    });
  });

  // ============================================================================
  // MEDIA_URL_CONFIG Tests
  // ============================================================================
  describe("MEDIA_URL_CONFIG", () => {
    it("should export MEDIA_URL_CONFIG object", () => {
      expect(MEDIA_URL_CONFIG).toBeDefined();
      expect(typeof MEDIA_URL_CONFIG).toBe("object");
    });

    describe("PLACEHOLDERS", () => {
      it("should have PRODUCT placeholder", () => {
        expect(MEDIA_URL_CONFIG.PLACEHOLDERS.PRODUCT).toBeDefined();
        expect(MEDIA_URL_CONFIG.PLACEHOLDERS.PRODUCT).toMatch(/\.(png|jpg)$/);
      });

      it("should have SHOP_LOGO placeholder", () => {
        expect(MEDIA_URL_CONFIG.PLACEHOLDERS.SHOP_LOGO).toBeDefined();
        expect(MEDIA_URL_CONFIG.PLACEHOLDERS.SHOP_LOGO).toMatch(/\.(png|jpg)$/);
      });

      it("should have SHOP_BANNER placeholder", () => {
        expect(MEDIA_URL_CONFIG.PLACEHOLDERS.SHOP_BANNER).toBeDefined();
        expect(MEDIA_URL_CONFIG.PLACEHOLDERS.SHOP_BANNER).toMatch(
          /\.(png|jpg)$/
        );
      });

      it("should have CATEGORY placeholder", () => {
        expect(MEDIA_URL_CONFIG.PLACEHOLDERS.CATEGORY).toBeDefined();
        expect(MEDIA_URL_CONFIG.PLACEHOLDERS.CATEGORY).toMatch(/\.(png|jpg)$/);
      });

      it("should have AVATAR placeholder", () => {
        expect(MEDIA_URL_CONFIG.PLACEHOLDERS.AVATAR).toBeDefined();
        expect(MEDIA_URL_CONFIG.PLACEHOLDERS.AVATAR).toMatch(/\.(png|jpg)$/);
      });

      it("should have AUCTION placeholder", () => {
        expect(MEDIA_URL_CONFIG.PLACEHOLDERS.AUCTION).toBeDefined();
        expect(MEDIA_URL_CONFIG.PLACEHOLDERS.AUCTION).toMatch(/\.(png|jpg)$/);
      });

      it("should have valid placeholder paths", () => {
        Object.values(MEDIA_URL_CONFIG.PLACEHOLDERS).forEach((path) => {
          expect(path).toMatch(/^\//);
        });
      });
    });

    describe("CDN Configuration", () => {
      it("should have CDN_BASE_URL", () => {
        expect(MEDIA_URL_CONFIG.CDN_BASE_URL).toBeDefined();
        expect(typeof MEDIA_URL_CONFIG.CDN_BASE_URL).toBe("string");
      });

      it("should have USE_CDN flag", () => {
        expect(typeof MEDIA_URL_CONFIG.USE_CDN).toBe("boolean");
      });
    });

    describe("CACHE_CONTROL", () => {
      it("should have IMMUTABLE cache control", () => {
        expect(MEDIA_URL_CONFIG.CACHE_CONTROL.IMMUTABLE).toBeDefined();
        expect(MEDIA_URL_CONFIG.CACHE_CONTROL.IMMUTABLE).toContain("public");
        expect(MEDIA_URL_CONFIG.CACHE_CONTROL.IMMUTABLE).toContain("max-age");
        expect(MEDIA_URL_CONFIG.CACHE_CONTROL.IMMUTABLE).toContain("immutable");
      });

      it("should have LONG cache control", () => {
        expect(MEDIA_URL_CONFIG.CACHE_CONTROL.LONG).toBeDefined();
        expect(MEDIA_URL_CONFIG.CACHE_CONTROL.LONG).toContain("public");
        expect(MEDIA_URL_CONFIG.CACHE_CONTROL.LONG).toContain("max-age");
      });

      it("should have SHORT cache control", () => {
        expect(MEDIA_URL_CONFIG.CACHE_CONTROL.SHORT).toBeDefined();
        expect(MEDIA_URL_CONFIG.CACHE_CONTROL.SHORT).toContain("public");
        expect(MEDIA_URL_CONFIG.CACHE_CONTROL.SHORT).toContain("max-age");
      });

      it("should have NO_CACHE cache control", () => {
        expect(MEDIA_URL_CONFIG.CACHE_CONTROL.NO_CACHE).toBeDefined();
        expect(MEDIA_URL_CONFIG.CACHE_CONTROL.NO_CACHE).toContain("no-cache");
        expect(MEDIA_URL_CONFIG.CACHE_CONTROL.NO_CACHE).toContain("no-store");
      });
    });
  });

  // ============================================================================
  // Type Tests
  // ============================================================================
  describe("Type Exports", () => {
    it("should export StorageBucket type", () => {
      const bucket: StorageBucket = "shop-logos";
      expect(bucket).toBe("shop-logos");
    });
  });
});
