/**
 * ImageUploadWithCrop Component Tests
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MockUploadService } from "../../adapters/examples";
import { ImageUploadWithCrop } from "../ImageUploadWithCrop";

describe("ImageUploadWithCrop", () => {
  const mockUploadService = new MockUploadService();
  const mockOnUploadComplete = vi.fn();
  const mockOnUploadError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders with default props", () => {
      render(
        <ImageUploadWithCrop
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      expect(screen.getByText(/drag.*drop.*image/i)).toBeInTheDocument();
    });

    it("renders with custom button text", () => {
      render(
        <ImageUploadWithCrop
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
          buttonText="Upload Product Image"
        />
      );

      expect(screen.getByText("Upload Product Image")).toBeInTheDocument();
    });

    it("renders with aspect ratio indicator", () => {
      render(
        <ImageUploadWithCrop
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
          aspectRatio={16 / 9}
        />
      );

      expect(screen.getByText(/16:9/i)).toBeInTheDocument();
    });
  });

  describe("File Selection", () => {
    it("accepts valid image file", async () => {
      render(
        <ImageUploadWithCrop
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      const input = screen.getByLabelText(/upload.*image/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByAltText("Preview")).toBeInTheDocument();
      });
    });

    it("rejects files exceeding max size", async () => {
      render(
        <ImageUploadWithCrop
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
          onUploadError={mockOnUploadError}
          maxSize={1 * 1024 * 1024} // 1MB
        />
      );

      // Create 2MB file
      const largeFile = new File(
        [new ArrayBuffer(2 * 1024 * 1024)],
        "large.jpg",
        { type: "image/jpeg" }
      );
      const input = screen.getByLabelText(/upload.*image/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(mockOnUploadError).toHaveBeenCalledWith(
          expect.stringContaining("size")
        );
      });
    });

    it("rejects non-image files", async () => {
      render(
        <ImageUploadWithCrop
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
          onUploadError={mockOnUploadError}
        />
      );

      const file = new File(["text"], "test.txt", { type: "text/plain" });
      const input = screen.getByLabelText(/upload.*image/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnUploadError).toHaveBeenCalledWith(
          expect.stringContaining("image")
        );
      });
    });
  });

  describe("Image Controls", () => {
    it("shows zoom controls after image selection", async () => {
      render(
        <ImageUploadWithCrop
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      const input = screen.getByLabelText(/upload.*image/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByLabelText(/zoom/i)).toBeInTheDocument();
      });
    });

    it("shows rotation buttons", async () => {
      render(
        <ImageUploadWithCrop
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      const input = screen.getByLabelText(/upload.*image/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByLabelText(/rotate.*left/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/rotate.*right/i)).toBeInTheDocument();
      });
    });

    it("updates zoom value when slider changes", async () => {
      render(
        <ImageUploadWithCrop
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      const input = screen.getByLabelText(/upload.*image/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      const zoomSlider = await screen.findByLabelText(/zoom/i);
      fireEvent.change(zoomSlider, { target: { value: "2" } });

      expect(zoomSlider).toHaveValue("2");
    });
  });

  describe("Upload Process", () => {
    it("shows upload button after image selection", async () => {
      render(
        <ImageUploadWithCrop
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      const input = screen.getByLabelText(/upload.*image/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /upload/i })
        ).toBeInTheDocument();
      });
    });

    it("shows progress during upload", async () => {
      const slowUploadService = new MockUploadService(1000); // 1 second delay

      render(
        <ImageUploadWithCrop
          uploadService={slowUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      const input = screen.getByLabelText(/upload.*image/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      const uploadButton = await screen.findByRole("button", {
        name: /upload/i,
      });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText(/uploading/i)).toBeInTheDocument();
      });
    });

    it("calls onUploadComplete with URL on success", async () => {
      render(
        <ImageUploadWithCrop
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      const input = screen.getByLabelText(/upload.*image/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      const uploadButton = await screen.findByRole("button", {
        name: /upload/i,
      });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            url: expect.stringContaining("mock-url"),
          })
        );
      });
    });

    it("calls onUploadError on failure", async () => {
      const failingUploadService = new MockUploadService(0, true);

      render(
        <ImageUploadWithCrop
          uploadService={failingUploadService}
          onUploadComplete={mockOnUploadComplete}
          onUploadError={mockOnUploadError}
        />
      );

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      const input = screen.getByLabelText(/upload.*image/i) as HTMLInputElement;

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

  describe("Cancel Functionality", () => {
    it("shows cancel button during upload", async () => {
      const slowUploadService = new MockUploadService(2000);

      render(
        <ImageUploadWithCrop
          uploadService={slowUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      const input = screen.getByLabelText(/upload.*image/i) as HTMLInputElement;

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
        <ImageUploadWithCrop
          uploadService={slowUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      const input = screen.getByLabelText(/upload.*image/i) as HTMLInputElement;

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
        expect(screen.getByText(/drag.*drop.*image/i)).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper labels for form controls", () => {
      render(
        <ImageUploadWithCrop
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      expect(screen.getByLabelText(/upload.*image/i)).toBeInTheDocument();
    });

    it("shows alt text for preview image", async () => {
      render(
        <ImageUploadWithCrop
          uploadService={mockUploadService}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      const input = screen.getByLabelText(/upload.*image/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByAltText("Preview")).toBeInTheDocument();
      });
    });
  });
});
