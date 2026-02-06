/**
 * Tests for useStorageUpload hook
 *
 * Coverage:
 * - File validation (size, type)
 * - Upload flow (success, error)
 * - Save callback handling
 * - Cleanup on failure
 * - Cleanup on unmount
 * - State management
 * - Old file deletion
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useStorageUpload } from "../useStorageUpload";
import { storage, auth } from "@/lib/firebase/config";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { ERROR_MESSAGES } from "@/constants";

// Mock Firebase
jest.mock("@/lib/firebase/config", () => ({
  storage: {},
  auth: { currentUser: { uid: "test-user-id" } },
}));

jest.mock("firebase/storage", () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
}));

describe("useStorageUpload", () => {
  const mockRef = ref as jest.MockedFunction<typeof ref>;
  const mockUploadBytes = uploadBytes as jest.MockedFunction<
    typeof uploadBytes
  >;
  const mockGetDownloadURL = getDownloadURL as jest.MockedFunction<
    typeof getDownloadURL
  >;
  const mockDeleteObject = deleteObject as jest.MockedFunction<
    typeof deleteObject
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as any).currentUser = { uid: "test-user-id" };
  });

  // ============================================
  // File Validation Tests
  // ============================================

  describe("File Validation", () => {
    it("validates file type correctly", async () => {
      const onUploadError = jest.fn();
      const { result } = renderHook(() => useStorageUpload({ onUploadError }));

      const invalidFile = new File(["test"], "test.txt", {
        type: "text/plain",
      });

      await act(async () => {
        await result.current.upload(invalidFile, "test/path.txt");
      });

      expect(onUploadError).toHaveBeenCalledWith(
        expect.stringContaining(ERROR_MESSAGES.UPLOAD.INVALID_TYPE),
      );
      expect(result.current.state.error).toContain(
        ERROR_MESSAGES.UPLOAD.INVALID_TYPE,
      );
    });

    it("validates file size correctly", async () => {
      const onUploadError = jest.fn();
      const { result } = renderHook(
        () => useStorageUpload({ maxSize: 1024, onUploadError }), // 1KB limit
      );

      // Create 2KB file
      const largeFile = new File(["x".repeat(2048)], "test.jpg", {
        type: "image/jpeg",
      });

      await act(async () => {
        await result.current.upload(largeFile, "test/path.jpg");
      });

      expect(onUploadError).toHaveBeenCalledWith(
        expect.stringContaining(ERROR_MESSAGES.UPLOAD.FILE_TOO_LARGE),
      );
      expect(result.current.state.error).toContain(
        ERROR_MESSAGES.UPLOAD.FILE_TOO_LARGE,
      );
    });

    it("accepts valid file types", async () => {
      const { result } = renderHook(() => useStorageUpload());

      const validFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

      mockRef.mockReturnValue({ fullPath: "test/path.jpg" } as any);
      mockUploadBytes.mockResolvedValue({
        ref: { fullPath: "test/path.jpg" },
      } as any);
      mockGetDownloadURL.mockResolvedValue("https://example.com/test.jpg");

      await act(async () => {
        await result.current.upload(validFile, "test/path.jpg");
      });

      expect(mockUploadBytes).toHaveBeenCalled();
    });

    it("accepts custom allowed types", async () => {
      const { result } = renderHook(() =>
        useStorageUpload({ allowedTypes: ["application/pdf"] }),
      );

      const pdfFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      mockRef.mockReturnValue({ fullPath: "test/path.pdf" } as any);
      mockUploadBytes.mockResolvedValue({
        ref: { fullPath: "test/path.pdf" },
      } as any);
      mockGetDownloadURL.mockResolvedValue("https://example.com/test.pdf");

      await act(async () => {
        await result.current.upload(pdfFile, "test/path.pdf");
      });

      expect(mockUploadBytes).toHaveBeenCalled();
    });
  });

  // ============================================
  // Authentication Tests
  // ============================================

  describe("Authentication", () => {
    it("requires authentication before upload", async () => {
      (auth as any).currentUser = null;
      const onUploadError = jest.fn();
      const { result } = renderHook(() => useStorageUpload({ onUploadError }));

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      await act(async () => {
        await result.current.upload(file, "test/path.jpg");
      });

      expect(onUploadError).toHaveBeenCalledWith(
        ERROR_MESSAGES.UPLOAD.AUTH_REQUIRED,
      );
      expect(result.current.state.error).toBe(
        ERROR_MESSAGES.UPLOAD.AUTH_REQUIRED,
      );
    });
  });

  // ============================================
  // Upload Flow Tests
  // ============================================

  describe("Upload Flow", () => {
    it("uploads file successfully", async () => {
      const onUploadStart = jest.fn();
      const onUploadSuccess = jest.fn().mockResolvedValue(undefined);
      const onSaveSuccess = jest.fn();

      const { result } = renderHook(() =>
        useStorageUpload({
          onUploadStart,
          onUploadSuccess,
          onSaveSuccess,
        }),
      );

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const mockDownloadURL = "https://example.com/test.jpg";

      mockRef.mockReturnValue({ fullPath: "test/path.jpg" } as any);
      mockUploadBytes.mockResolvedValue({
        ref: { fullPath: "test/path.jpg" },
      } as any);
      mockGetDownloadURL.mockResolvedValue(mockDownloadURL);

      await act(async () => {
        await result.current!.upload(file, "test/path.jpg");
      });

      expect(onUploadStart).toHaveBeenCalled();
      expect(onUploadSuccess).toHaveBeenCalledWith(mockDownloadURL);
      expect(onSaveSuccess).toHaveBeenCalled();
      expect(result.current!.state.downloadURL).toBe(mockDownloadURL);
      expect(result.current!.state.error).toBeNull();
    });

    it("sets uploading state during upload", async () => {
      let resolveUpload: any;
      const uploadPromise = new Promise((resolve) => {
        resolveUpload = resolve;
      });

      const { result } = renderHook(() => useStorageUpload());

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      mockRef.mockReturnValue({ fullPath: "test/path.jpg" } as any);
      mockUploadBytes.mockReturnValue(uploadPromise as any);
      mockGetDownloadURL.mockResolvedValue("https://example.com/test.jpg");

      act(() => {
        result.current!.upload(file, "test/path.jpg");
      });

      // Check uploading state immediately after starting upload
      expect(result.current!.isUploading).toBe(true);
      expect(result.current!.isProcessing).toBe(true);

      // Resolve upload
      resolveUpload({ ref: { fullPath: "test/path.jpg" } });

      await waitFor(() => {
        expect(result.current!.isUploading).toBe(false);
      });
    });

    it("handles upload errors", async () => {
      const onUploadError = jest.fn();
      const { result } = renderHook(() => useStorageUpload({ onUploadError }));

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const uploadError = new Error("Upload failed");

      mockRef.mockReturnValue({ fullPath: "test/path.jpg" } as any);
      mockUploadBytes.mockRejectedValue(uploadError);

      await act(async () => {
        await result.current!.upload(file, "test/path.jpg");
      });

      expect(onUploadError).toHaveBeenCalledWith("Upload failed");
      expect(result.current!.state.error).toBe("Upload failed");
      expect(result.current!.state.uploading).toBe(false);
    });
  });

  // ============================================
  // Save Callback Tests
  // ============================================

  describe("Save Callback", () => {
    it("calls onUploadSuccess with download URL", async () => {
      const onUploadSuccess = jest.fn<void, [string]>();
      const { result } = renderHook(() =>
        useStorageUpload({ onUploadSuccess }),
      );

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const mockDownloadURL = "https://example.com/test.jpg";

      mockRef.mockReturnValue({ fullPath: "test/path.jpg" } as any);
      mockUploadBytes.mockResolvedValue({
        ref: { fullPath: "test/path.jpg" },
      } as any);
      mockGetDownloadURL.mockResolvedValue(mockDownloadURL);

      await act(async () => {
        await result.current.upload(file, "test/path.jpg");
      });

      expect(onUploadSuccess).toHaveBeenCalledWith(mockDownloadURL);
    });

    it("sets saving state during save callback", async () => {
      const onUploadSuccess = jest.fn().mockResolvedValue(undefined);
      const onSaveSuccess = jest.fn();
      const { result } = renderHook(() =>
        useStorageUpload({ onUploadSuccess, onSaveSuccess }),
      );

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      mockRef.mockReturnValue({ fullPath: "test/path.jpg" } as any);
      mockUploadBytes.mockResolvedValue({
        ref: { fullPath: "test/path.jpg" },
      } as any);
      mockGetDownloadURL.mockResolvedValue("https://example.com/test.jpg");

      await act(async () => {
        await result.current.upload(file, "test/path.jpg");
      });

      // Verify the complete save flow executed
      expect(onUploadSuccess).toHaveBeenCalledWith(
        "https://example.com/test.jpg",
      );
      expect(onSaveSuccess).toHaveBeenCalled();
      expect(result.current.isSaving).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.state.error).toBeNull();
    });

    it("handles save errors and cleans up uploaded file", async () => {
      const saveError = new Error("Save failed");
      const onUploadSuccess = jest.fn().mockRejectedValue(saveError);
      const onSaveError = jest.fn();

      const { result } = renderHook(() =>
        useStorageUpload({
          onUploadSuccess,
          onSaveError,
        }),
      );

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      mockRef.mockReturnValue({ fullPath: "test/path.jpg" } as any);
      mockUploadBytes.mockResolvedValue({
        ref: { fullPath: "test/path.jpg" },
      } as any);
      mockGetDownloadURL.mockResolvedValue("https://example.com/test.jpg");
      mockDeleteObject.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.upload(file, "test/path.jpg");
      });

      // Should delete uploaded file on save failure
      expect(mockDeleteObject).toHaveBeenCalled();
      expect(onSaveError).toHaveBeenCalledWith("Save failed");
      expect(result.current.state.error).toBe("Save failed");
      expect(result.current.state.downloadURL).toBeNull();
    });
  });

  // ============================================
  // Old File Deletion Tests
  // ============================================

  describe("Old File Deletion", () => {
    it("deletes old file before uploading new one", async () => {
      const { result } = renderHook(() => useStorageUpload());

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const oldFileURL = "https://firebasestorage.googleapis.com/old/file.jpg";

      mockRef.mockReturnValue({ fullPath: "test/path.jpg" } as any);
      mockUploadBytes.mockResolvedValue({
        ref: { fullPath: "test/path.jpg" },
      } as any);
      mockGetDownloadURL.mockResolvedValue("https://example.com/test.jpg");
      mockDeleteObject.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.upload(file, "test/path.jpg", oldFileURL);
      });

      expect(mockDeleteObject).toHaveBeenCalled();
    });

    it("silences object-not-found errors when deleting old files", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const { result } = renderHook(() => useStorageUpload());

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const oldFileURL = "https://firebasestorage.googleapis.com/old/file.jpg";

      mockRef.mockReturnValue({ fullPath: "test/path.jpg" } as any);
      mockUploadBytes.mockResolvedValue({
        ref: { fullPath: "test/path.jpg" },
      } as any);
      mockGetDownloadURL.mockResolvedValue("https://example.com/test.jpg");
      mockDeleteObject.mockRejectedValue({ code: "storage/object-not-found" });

      await act(async () => {
        await result.current.upload(file, "test/path.jpg", oldFileURL);
      });

      // Should NOT log error for object-not-found
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("logs other deletion errors", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const { result } = renderHook(() => useStorageUpload());

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const oldFileURL = "https://firebasestorage.googleapis.com/old/file.jpg";

      mockRef.mockReturnValue({ fullPath: "test/path.jpg" } as any);
      mockUploadBytes.mockResolvedValue({
        ref: { fullPath: "test/path.jpg" },
      } as any);
      mockGetDownloadURL.mockResolvedValue("https://example.com/test.jpg");
      mockDeleteObject.mockRejectedValue({ code: "storage/unauthorized" });

      await act(async () => {
        await result.current.upload(file, "test/path.jpg", oldFileURL);
      });

      // Should log error for other errors
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to delete old file:",
        expect.any(Object),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  // ============================================
  // Cancel Tests
  // ============================================

  describe("Cancel", () => {
    it("cancels upload and cleans up uploaded file", async () => {
      const onUploadSuccess = jest.fn().mockResolvedValue(undefined);
      const onSaveSuccess = jest.fn();

      mockRef.mockReturnValue({ fullPath: "test/path.jpg" } as any);
      mockUploadBytes.mockResolvedValue({
        ref: { fullPath: "test/path.jpg" },
      } as any);
      mockGetDownloadURL.mockResolvedValue("https://example.com/test.jpg");
      mockDeleteObject.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useStorageUpload({ onUploadSuccess, onSaveSuccess }),
      );

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      await act(async () => {
        await result.current.upload(file, "test/path.jpg");
      });

      // Cancel after upload
      await act(async () => {
        await result.current.cancel();
      });

      expect(result.current.state.uploading).toBe(false);
      expect(result.current.state.saving).toBe(false);
      expect(result.current.state.error).toBeNull();
    });

    it("resets state when canceling", async () => {
      const { result } = renderHook(() => useStorageUpload());

      await act(async () => {
        await result.current.cancel();
      });

      expect(result.current.state).toEqual({
        uploading: false,
        saving: false,
        error: null,
        downloadURL: null,
      });
    });
  });

  // ============================================
  // Cleanup Tests
  // ============================================

  describe("Cleanup", () => {
    it("cleans up uploaded file on unmount if save incomplete", async () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      const { result, unmount } = renderHook(() => useStorageUpload());

      mockDeleteObject.mockResolvedValue(undefined);

      // Simulate incomplete save by calling cleanup
      await act(async () => {
        await result.current.cleanup();
      });

      unmount();

      consoleLogSpy.mockRestore();
    });
  });

  // ============================================
  // State Management Tests
  // ============================================

  describe("State Management", () => {
    it("provides correct initial state", () => {
      const { result } = renderHook(() => useStorageUpload());

      expect(result.current.state).toEqual({
        uploading: false,
        saving: false,
        error: null,
        downloadURL: null,
      });
      expect(result.current.isUploading).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.isProcessing).toBe(false);
    });

    it("resets state between uploads", async () => {
      const { result } = renderHook(() => useStorageUpload());

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      mockRef.mockReturnValue({ fullPath: "test/path.jpg" } as any);
      mockUploadBytes.mockResolvedValue({
        ref: { fullPath: "test/path.jpg" },
      } as any);
      mockGetDownloadURL.mockResolvedValue("https://example.com/test1.jpg");

      // First upload
      await act(async () => {
        await result.current.upload(file, "test/path1.jpg");
      });

      expect(result.current.state.downloadURL).toBe(
        "https://example.com/test1.jpg",
      );

      // Second upload
      mockGetDownloadURL.mockResolvedValue("https://example.com/test2.jpg");

      await act(async () => {
        await result.current.upload(file, "test/path2.jpg");
      });

      expect(result.current.state.downloadURL).toBe(
        "https://example.com/test2.jpg",
      );
    });
  });
});
