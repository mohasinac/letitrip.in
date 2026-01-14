/**
 * VideoUploadWithThumbnail Component Tests
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MockUploadService } from "../../adapters/examples";
import { VideoUploadWithThumbnail } from "../VideoUploadWithThumbnail";

describe("VideoUploadWithThumbnail", () => {
  const mockUploadService = new MockUploadService();
  const mockOnUploadComplete = vi.fn();
  const mockOnUploadError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders with default props", () => {
      render(
        <VideoUploadWithThumbnail
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      expect(screen.getByText(/drag.*drop.*video/i)).toBeInTheDocument();
    });

    it("renders with custom button text", () => {
      render(
        <VideoUploadWithThumbnail
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
          buttonText="Upload Demo Video"
        />
      );

      expect(screen.getByText("Upload Demo Video")).toBeInTheDocument();
    });

    it("shows max duration info", () => {
      render(
        <VideoUploadWithThumbnail
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
          maxDuration={300} // 5 minutes
        />
      );

      expect(screen.getByText(/5.*min/i)).toBeInTheDocument();
    });
  });

  describe("File Selection", () => {
    it("accepts valid video file", async () => {
      render(
        <VideoUploadWithThumbnail
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const input = screen.getByLabelText(/upload.*video/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/video.*selected/i)).toBeInTheDocument();
      });
    });

    it("rejects files exceeding max size", async () => {
      render(
        <VideoUploadWithThumbnail
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
          onUploadError={mockOnUploadError}
          maxSize={10 * 1024 * 1024} // 10MB
        />
      );

      // Create 20MB file
      const largeFile = new File(
        [new ArrayBuffer(20 * 1024 * 1024)],
        "large.mp4",
        { type: "video/mp4" }
      );
      const input = screen.getByLabelText(/upload.*video/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(mockOnUploadError).toHaveBeenCalledWith(
          expect.stringContaining("size")
        );
      });
    });

    it("rejects non-video files", async () => {
      render(
        <VideoUploadWithThumbnail
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
          onUploadError={mockOnUploadError}
        />
      );

      const file = new File(["text"], "test.txt", { type: "text/plain" });
      const input = screen.getByLabelText(/upload.*video/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnUploadError).toHaveBeenCalledWith(
          expect.stringContaining("video")
        );
      });
    });
  });

  describe("Video Preview", () => {
    it("shows video player after file selection", async () => {
      render(
        <VideoUploadWithThumbnail
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const input = screen.getByLabelText(/upload.*video/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /play/i })
        ).toBeInTheDocument();
      });
    });

    it("shows video duration", async () => {
      render(
        <VideoUploadWithThumbnail
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const input = screen.getByLabelText(/upload.*video/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/duration/i)).toBeInTheDocument();
      });
    });
  });

  describe("Thumbnail Generation", () => {
    it("shows thumbnail preview", async () => {
      render(
        <VideoUploadWithThumbnail
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const input = screen.getByLabelText(/upload.*video/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/thumbnail/i)).toBeInTheDocument();
      });
    });

    it("allows selecting different frame for thumbnail", async () => {
      render(
        <VideoUploadWithThumbnail
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const input = screen.getByLabelText(/upload.*video/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      const frameSelector = await screen.findByLabelText(/select.*frame/i);
      expect(frameSelector).toBeInTheDocument();
    });
  });

  describe("Upload Process", () => {
    it("shows upload button after video selection", async () => {
      render(
        <VideoUploadWithThumbnail
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const input = screen.getByLabelText(/upload.*video/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /upload/i })
        ).toBeInTheDocument();
      });
    });

    it("shows progress during upload", async () => {
      const slowUploadService = new MockUploadService(1000);

      render(
        <VideoUploadWithThumbnail
          uploadService={slowUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const input = screen.getByLabelText(/upload.*video/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      const uploadButton = await screen.findByRole("button", {
        name: /upload/i,
      });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText(/uploading/i)).toBeInTheDocument();
      });
    });

    it("calls onUploadComplete with URLs on success", async () => {
      render(
        <VideoUploadWithThumbnail
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const input = screen.getByLabelText(/upload.*video/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      const uploadButton = await screen.findByRole("button", {
        name: /upload/i,
      });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            videoUrl: expect.any(String),
            thumbnailUrl: expect.any(String),
          })
        );
      });
    });

    it("calls onUploadError on failure", async () => {
      const failingUploadService = new MockUploadService(0, true);

      render(
        <VideoUploadWithThumbnail
          uploadService={failingUploadService}
          onUploadComplete={mockOnUploadComplete}
          onUploadError={mockOnUploadError}
        />
      );

      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const input = screen.getByLabelText(/upload.*video/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      const uploadButton = await screen.findByRole("button", {
        name: /upload/i,
      });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(mockOnUploadError).toHaveBeenCalledWith(expect.any(String));
      });
    });
  });

  describe("Duration Validation", () => {
    it("rejects videos exceeding max duration", async () => {
      // Mock video element to return duration > maxDuration
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tagName) => {
        const element = originalCreateElement(tagName);
        if (tagName === "video") {
          Object.defineProperty(element, "duration", {
            get: () => 600, // 10 minutes
          });
        }
        return element;
      });

      render(
        <VideoUploadWithThumbnail
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
          onUploadError={mockOnUploadError}
          maxDuration={300} // 5 minutes
        />
      );

      const file = new File(["video"], "long.mp4", { type: "video/mp4" });
      const input = screen.getByLabelText(/upload.*video/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnUploadError).toHaveBeenCalledWith(
          expect.stringContaining("duration")
        );
      });

      vi.restoreAllMocks();
    });
  });

  describe("Cancel Functionality", () => {
    it("shows cancel button during upload", async () => {
      const slowUploadService = new MockUploadService(2000);

      render(
        <VideoUploadWithThumbnail
          uploadService={slowUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const input = screen.getByLabelText(/upload.*video/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      const uploadButton = await screen.findByRole("button", {
        name: /upload/i,
      });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /cancel/i })
        ).toBeInTheDocument();
      });
    });

    it("resets state when cancelled", async () => {
      const slowUploadService = new MockUploadService(2000);

      render(
        <VideoUploadWithThumbnail
          uploadService={slowUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const input = screen.getByLabelText(/upload.*video/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      const uploadButton = await screen.findByRole("button", {
        name: /upload/i,
      });
      fireEvent.click(uploadButton);

      const cancelButton = await screen.findByRole("button", {
        name: /cancel/i,
      });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText(/drag.*drop.*video/i)).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper labels for form controls", () => {
      render(
        <VideoUploadWithThumbnail
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      expect(screen.getByLabelText(/upload.*video/i)).toBeInTheDocument();
    });

    it("shows video controls for accessibility", async () => {
      render(
        <VideoUploadWithThumbnail
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const input = screen.getByLabelText(/upload.*video/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        const video = screen.getByRole("button", { name: /play/i });
        expect(video).toBeInTheDocument();
      });
    });
  });
});
