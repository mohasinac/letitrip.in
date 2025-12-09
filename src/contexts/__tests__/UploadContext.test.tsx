/**
 * Unit Tests for UploadContext
 *
 * Tests upload state management, file tracking, retry logic,
 * memory cleanup, and concurrent operations
 */

import { act, renderHook } from "@testing-library/react";
import React from "react";
import { UploadProvider, useUploadContext } from "../UploadContext";

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = jest.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UploadProvider>{children}</UploadProvider>
);

describe("UploadContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with empty uploads", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      expect(result.current.uploads).toEqual([]);
      expect(result.current.pendingCount).toBe(0);
      expect(result.current.uploadingCount).toBe(0);
      expect(result.current.failedCount).toBe(0);
      expect(result.current.successCount).toBe(0);
      expect(result.current.hasPendingUploads).toBe(false);
      expect(result.current.hasFailedUploads).toBe(false);
    });

    it("should throw error when used outside provider", () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        renderHook(() => useUploadContext());
      }).toThrow("useUploadContext must be used within an UploadProvider");

      consoleError.mockRestore();
    });
  });

  describe("Adding Uploads", () => {
    it("should add upload with generated ID", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      let uploadId: string;
      act(() => {
        uploadId = result.current.addUpload(file);
      });

      expect(uploadId!).toBeTruthy();
      expect(uploadId!).toMatch(/^upload-/);
      expect(result.current.uploads.length).toBe(1);
      expect(result.current.uploads[0].file).toBe(file);
      expect(result.current.uploads[0].status).toBe("pending");
      expect(result.current.uploads[0].progress).toBe(0);
      expect(result.current.uploads[0].retryCount).toBe(0);
    });

    it("should add upload with preview", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      const preview = "blob:preview-url";

      act(() => {
        result.current.addUpload(file, preview);
      });

      expect(result.current.uploads[0].preview).toBe(preview);
    });

    it("should add multiple uploads", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file1 = new File(["content1"], "test1.jpg", { type: "image/jpeg" });
      const file2 = new File(["content2"], "test2.jpg", { type: "image/jpeg" });

      act(() => {
        result.current.addUpload(file1);
        result.current.addUpload(file2);
      });

      expect(result.current.uploads.length).toBe(2);
      expect(result.current.pendingCount).toBe(2);
    });

    it("should generate unique IDs for each upload", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      let id1: string, id2: string;
      act(() => {
        id1 = result.current.addUpload(file);
        id2 = result.current.addUpload(file);
      });

      expect(id1!).not.toBe(id2!);
    });
  });

  describe("Updating Uploads", () => {
    it("should update upload status", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      let uploadId: string;
      act(() => {
        uploadId = result.current.addUpload(file);
      });

      act(() => {
        result.current.updateUpload(uploadId!, { status: "uploading" });
      });

      expect(result.current.uploads[0].status).toBe("uploading");
    });

    it("should update upload progress", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      let uploadId: string;
      act(() => {
        uploadId = result.current.addUpload(file);
      });

      act(() => {
        result.current.updateUpload(uploadId!, { progress: 50 });
      });

      expect(result.current.uploads[0].progress).toBe(50);
    });

    it("should update multiple fields at once", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      let uploadId: string;
      act(() => {
        uploadId = result.current.addUpload(file);
      });

      act(() => {
        result.current.updateUpload(uploadId!, {
          status: "success",
          progress: 100,
          url: "https://example.com/uploaded.jpg",
          uploadedAt: new Date(),
        });
      });

      const upload = result.current.uploads[0];
      expect(upload.status).toBe("success");
      expect(upload.progress).toBe(100);
      expect(upload.url).toBe("https://example.com/uploaded.jpg");
      expect(upload.uploadedAt).toBeInstanceOf(Date);
    });

    it("should not affect other uploads", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file1 = new File(["content1"], "test1.jpg", { type: "image/jpeg" });
      const file2 = new File(["content2"], "test2.jpg", { type: "image/jpeg" });

      let id1: string, id2: string;
      act(() => {
        id1 = result.current.addUpload(file1);
        id2 = result.current.addUpload(file2);
      });

      act(() => {
        result.current.updateUpload(id1!, {
          status: "uploading",
          progress: 75,
        });
      });

      expect(result.current.uploads[0].progress).toBe(75);
      expect(result.current.uploads[1].progress).toBe(0);
      expect(result.current.uploads[1].status).toBe("pending");
    });

    it("should handle error state", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      let uploadId: string;
      act(() => {
        uploadId = result.current.addUpload(file);
      });

      act(() => {
        result.current.updateUpload(uploadId!, {
          status: "error",
          error: "Upload failed",
        });
      });

      expect(result.current.uploads[0].status).toBe("error");
      expect(result.current.uploads[0].error).toBe("Upload failed");
      expect(result.current.failedCount).toBe(1);
      expect(result.current.hasFailedUploads).toBe(true);
    });
  });

  describe("Removing Uploads", () => {
    it("should remove upload by ID", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      let uploadId: string;
      act(() => {
        uploadId = result.current.addUpload(file);
      });

      act(() => {
        result.current.removeUpload(uploadId!);
      });

      expect(result.current.uploads.length).toBe(0);
    });

    it("should revoke object URL when removing upload with preview", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      const preview = "blob:preview-url";

      let uploadId: string;
      act(() => {
        uploadId = result.current.addUpload(file, preview);
      });

      act(() => {
        result.current.removeUpload(uploadId!);
      });

      expect(URL.revokeObjectURL).toHaveBeenCalledWith(preview);
    });

    it("should not throw when removing non-existent upload", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      expect(() => {
        act(() => {
          result.current.removeUpload("non-existent-id");
        });
      }).not.toThrow();
    });
  });

  describe("Retry Logic", () => {
    it("should retry failed upload", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      let uploadId: string;
      act(() => {
        uploadId = result.current.addUpload(file);
      });

      act(() => {
        result.current.updateUpload(uploadId!, {
          status: "error",
          error: "Upload failed",
        });
      });

      act(() => {
        result.current.retryUpload(uploadId!);
      });

      const upload = result.current.uploads[0];
      expect(upload.status).toBe("pending");
      expect(upload.error).toBeUndefined();
      expect(upload.progress).toBe(0);
      expect(upload.retryCount).toBe(1);
    });

    it("should increment retry count", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      let uploadId: string;
      act(() => {
        uploadId = result.current.addUpload(file);
      });

      // Fail and retry multiple times
      act(() => {
        result.current.updateUpload(uploadId!, { status: "error" });
        result.current.retryUpload(uploadId!);
        result.current.updateUpload(uploadId!, { status: "error" });
        result.current.retryUpload(uploadId!);
      });

      expect(result.current.uploads[0].retryCount).toBe(2);
    });
  });

  describe("Clearing Uploads", () => {
    it("should clear completed uploads", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file1 = new File(["content1"], "test1.jpg", { type: "image/jpeg" });
      const file2 = new File(["content2"], "test2.jpg", { type: "image/jpeg" });

      let id1: string, id2: string;
      act(() => {
        id1 = result.current.addUpload(file1, "blob:preview1");
        id2 = result.current.addUpload(file2);
      });

      act(() => {
        result.current.updateUpload(id1!, { status: "success" });
      });

      act(() => {
        result.current.clearCompleted();
      });

      expect(result.current.uploads.length).toBe(1);
      expect(result.current.uploads[0].file).toBe(file2);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview1");
    });

    it("should clear failed uploads", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file1 = new File(["content1"], "test1.jpg", { type: "image/jpeg" });
      const file2 = new File(["content2"], "test2.jpg", { type: "image/jpeg" });

      let id1: string, id2: string;
      act(() => {
        id1 = result.current.addUpload(file1, "blob:preview1");
        id2 = result.current.addUpload(file2);
      });

      act(() => {
        result.current.updateUpload(id1!, { status: "error", error: "Failed" });
      });

      act(() => {
        result.current.clearFailed();
      });

      expect(result.current.uploads.length).toBe(1);
      expect(result.current.uploads[0].file).toBe(file2);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview1");
    });

    it("should clear all uploads", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file1 = new File(["content1"], "test1.jpg", { type: "image/jpeg" });
      const file2 = new File(["content2"], "test2.jpg", { type: "image/jpeg" });

      act(() => {
        result.current.addUpload(file1, "blob:preview1");
        result.current.addUpload(file2, "blob:preview2");
      });

      (URL.revokeObjectURL as jest.Mock).mockClear();

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.uploads.length).toBe(0);
      // Called at least 2 times (once for each preview in clearAll)
      // May be called more times by useEffect cleanup
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview1");
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview2");
    });
  });

  describe("Upload Counts", () => {
    it("should track pending uploads", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file1 = new File(["content1"], "test1.jpg", { type: "image/jpeg" });
      const file2 = new File(["content2"], "test2.jpg", { type: "image/jpeg" });

      act(() => {
        result.current.addUpload(file1);
        result.current.addUpload(file2);
      });

      expect(result.current.pendingCount).toBe(2);
      expect(result.current.hasPendingUploads).toBe(true);
    });

    it("should track uploading uploads", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      let uploadId: string;
      act(() => {
        uploadId = result.current.addUpload(file);
      });

      act(() => {
        result.current.updateUpload(uploadId!, { status: "uploading" });
      });

      expect(result.current.uploadingCount).toBe(1);
      expect(result.current.hasPendingUploads).toBe(true);
    });

    it("should track success uploads", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      let uploadId: string;
      act(() => {
        uploadId = result.current.addUpload(file);
      });

      act(() => {
        result.current.updateUpload(uploadId!, { status: "success" });
      });

      expect(result.current.successCount).toBe(1);
      expect(result.current.hasPendingUploads).toBe(false);
    });

    it("should track failed uploads", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      let uploadId: string;
      act(() => {
        uploadId = result.current.addUpload(file);
      });

      act(() => {
        result.current.updateUpload(uploadId!, { status: "error" });
      });

      expect(result.current.failedCount).toBe(1);
      expect(result.current.hasFailedUploads).toBe(true);
    });

    it("should track mixed statuses", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const files = [
        new File(["1"], "test1.jpg", { type: "image/jpeg" }),
        new File(["2"], "test2.jpg", { type: "image/jpeg" }),
        new File(["3"], "test3.jpg", { type: "image/jpeg" }),
        new File(["4"], "test4.jpg", { type: "image/jpeg" }),
      ];

      let ids: string[];
      act(() => {
        ids = files.map((file) => result.current.addUpload(file));
      });

      act(() => {
        result.current.updateUpload(ids[0], { status: "uploading" });
        result.current.updateUpload(ids[1], { status: "success" });
        result.current.updateUpload(ids[2], { status: "error" });
        // ids[3] remains pending
      });

      expect(result.current.pendingCount).toBe(1);
      expect(result.current.uploadingCount).toBe(1);
      expect(result.current.successCount).toBe(1);
      expect(result.current.failedCount).toBe(1);
    });
  });

  describe("Memory Cleanup", () => {
    it("should cleanup on unmount", () => {
      const { result, unmount } = renderHook(() => useUploadContext(), {
        wrapper,
      });

      act(() => {
        result.current.addUpload(
          new File(["1"], "test1.jpg", { type: "image/jpeg" }),
          "blob:preview1"
        );
        result.current.addUpload(
          new File(["2"], "test2.jpg", { type: "image/jpeg" }),
          "blob:preview2"
        );
      });

      (URL.revokeObjectURL as jest.Mock).mockClear();

      unmount();

      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty file", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const emptyFile = new File([], "empty.txt", { type: "text/plain" });

      let uploadId: string;
      act(() => {
        uploadId = result.current.addUpload(emptyFile);
      });

      expect(result.current.uploads[0].file).toBe(emptyFile);
      expect(result.current.uploads[0].file.size).toBe(0);
    });

    it("should handle large file", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const largeContent = "x".repeat(10 * 1024 * 1024); // 10MB
      const largeFile = new File([largeContent], "large.bin", {
        type: "application/octet-stream",
      });

      act(() => {
        result.current.addUpload(largeFile);
      });

      expect(result.current.uploads[0].file.size).toBe(10 * 1024 * 1024);
    });

    it("should handle concurrent updates", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      let uploadId: string;
      act(() => {
        uploadId = result.current.addUpload(file);
      });

      act(() => {
        result.current.updateUpload(uploadId!, { progress: 25 });
        result.current.updateUpload(uploadId!, { progress: 50 });
        result.current.updateUpload(uploadId!, { progress: 75 });
      });

      // Should have the last update
      expect(result.current.uploads[0].progress).toBe(75);
    });

    it("should handle removal during iteration", () => {
      const { result } = renderHook(() => useUploadContext(), { wrapper });

      const files = [
        new File(["1"], "test1.jpg", { type: "image/jpeg" }),
        new File(["2"], "test2.jpg", { type: "image/jpeg" }),
        new File(["3"], "test3.jpg", { type: "image/jpeg" }),
      ];

      let ids: string[];
      act(() => {
        ids = files.map((file) => result.current.addUpload(file));
      });

      // Remove middle item
      act(() => {
        result.current.removeUpload(ids[1]);
      });

      expect(result.current.uploads.length).toBe(2);
      expect(result.current.uploads[0].file).toBe(files[0]);
      expect(result.current.uploads[1].file).toBe(files[2]);
    });
  });
});
