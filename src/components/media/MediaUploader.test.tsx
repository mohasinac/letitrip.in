/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MediaUploader from "./MediaUploader";
import { validateMedia } from "@/lib/media/media-validator";

// Mock dependencies
jest.mock("@/lib/media/media-validator", () => ({
  validateMedia: jest.fn(),
}));

jest.mock("./MediaPreviewCard", () => ({
  __esModule: true,
  default: ({ file, onRemove }: any) => (
    <div data-testid="media-preview">
      {file?.file?.name || "preview"}
      <button onClick={() => onRemove(file?.id)}>Remove</button>
    </div>
  ),
}));

jest.mock("./CameraCapture", () => ({
  __esModule: true,
  default: ({ onCapture, onClose }: any) => (
    <div data-testid="camera-capture">
      <button
        onClick={() =>
          onCapture({
            id: "camera-1",
            file: new File([], "camera.jpg"),
            type: "image",
          })
        }
      >
        Capture
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock("./VideoRecorder", () => ({
  __esModule: true,
  default: ({ onRecorded, onClose }: any) => (
    <div data-testid="video-recorder">
      <button
        onClick={() =>
          onRecorded({
            id: "video-1",
            file: new File([], "video.mp4"),
            type: "video",
          })
        }
      >
        Record
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Upload: () => <div data-testid="upload-icon" />,
  Camera: () => <div data-testid="camera-icon" />,
  Video: () => <div data-testid="video-icon" />,
  X: () => <div data-testid="x-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />,
}));

describe("MediaUploader", () => {
  const mockOnFilesAdded = jest.fn();
  const mockOnFileRemoved = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (validateMedia as jest.Mock).mockResolvedValue({
      errors: [],
      warnings: [],
    });
    global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = jest.fn();
  });

  describe("Rendering", () => {
    it("renders upload area with default props", () => {
      render(<MediaUploader />);

      expect(screen.getByTestId("upload-icon")).toBeInTheDocument();
      expect(screen.getByText("Upload media files")).toBeInTheDocument();
      expect(screen.getByText(/drag & drop files here/i)).toBeInTheDocument();
    });

    it("renders camera button when enabled", () => {
      render(<MediaUploader enableCamera={true} />);

      expect(screen.getByTestId("camera-icon")).toBeInTheDocument();
    });

    it("renders video recording button when enabled", () => {
      render(<MediaUploader enableVideoRecording={true} />);

      expect(screen.getByTestId("video-icon")).toBeInTheDocument();
    });

    it("does not render camera button when disabled", () => {
      render(<MediaUploader enableCamera={false} />);

      expect(screen.queryByTestId("camera-icon")).not.toBeInTheDocument();
    });

    it("does not render video button when disabled", () => {
      render(<MediaUploader enableVideoRecording={false} />);

      expect(screen.queryByTestId("video-icon")).not.toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<MediaUploader className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("File Input", () => {
    it("allows clicking to browse files", () => {
      render(<MediaUploader />);

      const uploadArea = screen.getByText("Upload media files").closest("div");
      expect(uploadArea).toHaveClass("cursor-pointer");
    });

    it("triggers file input on click", () => {
      render(<MediaUploader />);

      const uploadArea = screen.getByText("Upload media files").closest("div");
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const clickSpy = jest.spyOn(fileInput, "click");

      fireEvent.click(uploadArea!);

      expect(clickSpy).toHaveBeenCalled();
    });

    it("does not allow clicking when disabled", () => {
      render(<MediaUploader disabled={true} />);

      const uploadArea = screen.getByText("Upload media files").closest("div");
      expect(uploadArea).toHaveClass("cursor-not-allowed");
    });

    it("sets correct accept attribute for images only", () => {
      render(<MediaUploader accept="image" />);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute("accept", "image/*");
    });

    it("sets correct accept attribute for videos only", () => {
      render(<MediaUploader accept="video" />);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute("accept", "video/*");
    });

    it("sets correct accept attribute for all media", () => {
      render(<MediaUploader accept="all" />);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute("accept", "image/*,video/*");
    });

    it("allows multiple files when enabled", () => {
      render(<MediaUploader multiple={true} />);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute("multiple");
    });

    it("does not allow multiple files when disabled", () => {
      render(<MediaUploader multiple={false} />);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).not.toHaveAttribute("multiple");
    });
  });

  describe("File Upload", () => {
    it("handles file selection via input", async () => {
      render(<MediaUploader onFilesAdded={mockOnFilesAdded} />);

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnFilesAdded).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              file,
              type: "image",
              source: "file",
            }),
          ]),
        );
      });
    });

    it("creates preview URL for uploaded file", async () => {
      render(<MediaUploader onFilesAdded={mockOnFilesAdded} />);

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
      });
    });

    it("validates file before adding", async () => {
      render(
        <MediaUploader
          onFilesAdded={mockOnFilesAdded}
          resourceType="product"
        />,
      );

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(validateMedia).toHaveBeenCalledWith(
          file,
          "PRODUCT_IMAGE",
          "image",
        );
      });
    });

    it("shows error for invalid file", async () => {
      (validateMedia as jest.Mock).mockResolvedValueOnce({
        errors: ["File too large"],
        warnings: [],
      });

      render(<MediaUploader onFilesAdded={mockOnFilesAdded} />);

      const file = new File(["content"], "large.jpg", { type: "image/jpeg" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(
          screen.getByText(/large.jpg.*file too large/i),
        ).toBeInTheDocument();
      });

      expect(mockOnFilesAdded).not.toHaveBeenCalled();
    });

    it("handles multiple file selection", async () => {
      render(<MediaUploader onFilesAdded={mockOnFilesAdded} multiple={true} />);

      const file1 = new File(["content1"], "test1.jpg", { type: "image/jpeg" });
      const file2 = new File(["content2"], "test2.jpg", { type: "image/jpeg" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file1, file2] } });

      await waitFor(() => {
        expect(mockOnFilesAdded).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ file: file1 }),
            expect.objectContaining({ file: file2 }),
          ]),
        );
      });
    });

    it("respects maxFiles limit", async () => {
      render(
        <MediaUploader
          onFilesAdded={mockOnFilesAdded}
          maxFiles={2}
          files={[]}
        />,
      );

      const files = [
        new File(["1"], "1.jpg", { type: "image/jpeg" }),
        new File(["2"], "2.jpg", { type: "image/jpeg" }),
        new File(["3"], "3.jpg", { type: "image/jpeg" }),
      ];
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files } });

      await waitFor(() => {
        const calls = mockOnFilesAdded.mock.calls[0][0];
        expect(calls).toHaveLength(2);
      });
    });

    it("shows max files reached message", () => {
      const existingFiles = [
        {
          id: "1",
          file: new File([], "1.jpg"),
          type: "image" as const,
          source: "file" as const,
          preview: "",
          uploadStatus: "pending" as const,
          uploadProgress: 0,
        },
        {
          id: "2",
          file: new File([], "2.jpg"),
          type: "image" as const,
          source: "file" as const,
          preview: "",
          uploadStatus: "pending" as const,
          uploadProgress: 0,
        },
      ];

      render(<MediaUploader files={existingFiles} maxFiles={2} />);

      expect(screen.getByText(/maximum 2 files reached/i)).toBeInTheDocument();
    });

    it("disables upload when max files reached", () => {
      const existingFiles = [
        {
          id: "1",
          file: new File([], "1.jpg"),
          type: "image" as const,
          source: "file" as const,
          preview: "",
          uploadStatus: "pending" as const,
          uploadProgress: 0,
        },
      ];

      render(<MediaUploader files={existingFiles} maxFiles={1} />);

      const uploadArea = screen.getByText(/maximum.*reached/i).closest("div");
      expect(uploadArea).toHaveClass("cursor-not-allowed");
    });
  });

  describe("Drag and Drop", () => {
    it("highlights drop zone on drag enter", () => {
      render(<MediaUploader />);

      const uploadArea = screen.getByText("Upload media files").closest("div")!;

      fireEvent.dragEnter(uploadArea);

      expect(uploadArea).toHaveClass("border-blue-500", "bg-blue-50");
      expect(screen.getByText("Drop files here")).toBeInTheDocument();
    });

    it("removes highlight on drag leave", () => {
      render(<MediaUploader />);

      const uploadArea = screen.getByText("Upload media files").closest("div")!;

      fireEvent.dragEnter(uploadArea);
      fireEvent.dragLeave(uploadArea);

      expect(uploadArea).not.toHaveClass("border-blue-500");
      expect(screen.getByText("Upload media files")).toBeInTheDocument();
    });

    it("handles file drop", async () => {
      render(<MediaUploader onFilesAdded={mockOnFilesAdded} />);

      const file = new File(["content"], "dropped.jpg", { type: "image/jpeg" });
      const uploadArea = screen.getByText("Upload media files").closest("div")!;

      fireEvent.drop(uploadArea, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(mockOnFilesAdded).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ file })]),
        );
      });
    });

    it("prevents default drag behavior", () => {
      render(<MediaUploader />);

      const uploadArea = screen.getByText("Upload media files").closest("div")!;
      const dragEvent = new Event("dragover", {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = jest.spyOn(dragEvent, "preventDefault");

      uploadArea.dispatchEvent(dragEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("does not accept drop when disabled", async () => {
      render(<MediaUploader disabled={true} onFilesAdded={mockOnFilesAdded} />);

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      const uploadArea = screen.getByText("Upload media files").closest("div")!;

      fireEvent.drop(uploadArea, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(mockOnFilesAdded).not.toHaveBeenCalled();
      });
    });

    it("does not accept drop when max files reached", async () => {
      const existingFiles = [
        {
          id: "1",
          file: new File([], "1.jpg"),
          type: "image" as const,
          source: "file" as const,
          preview: "",
          uploadStatus: "pending" as const,
          uploadProgress: 0,
        },
      ];

      render(
        <MediaUploader
          files={existingFiles}
          maxFiles={1}
          onFilesAdded={mockOnFilesAdded}
        />,
      );

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      const uploadArea = screen.getByText(/maximum.*reached/i).closest("div")!;

      fireEvent.drop(uploadArea, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(mockOnFilesAdded).not.toHaveBeenCalled();
      });
    });
  });

  describe("Camera Capture", () => {
    it("opens camera modal on button click", () => {
      render(<MediaUploader enableCamera={true} />);

      const cameraButton = screen.getByTestId("camera-icon").closest("button")!;
      fireEvent.click(cameraButton);

      expect(screen.getByTestId("camera-capture")).toBeInTheDocument();
    });

    it("handles captured photo", async () => {
      render(
        <MediaUploader enableCamera={true} onFilesAdded={mockOnFilesAdded} />,
      );

      const cameraButton = screen.getByTestId("camera-icon").closest("button")!;
      fireEvent.click(cameraButton);

      const captureButton = screen.getByText("Capture");
      fireEvent.click(captureButton);

      await waitFor(() => {
        expect(mockOnFilesAdded).toHaveBeenCalledWith([
          expect.objectContaining({ id: "camera-1" }),
        ]);
      });
    });

    it("closes camera modal after capture", async () => {
      render(
        <MediaUploader enableCamera={true} onFilesAdded={mockOnFilesAdded} />,
      );

      const cameraButton = screen.getByTestId("camera-icon").closest("button")!;
      fireEvent.click(cameraButton);

      const captureButton = screen.getByText("Capture");
      fireEvent.click(captureButton);

      await waitFor(() => {
        expect(screen.queryByTestId("camera-capture")).not.toBeInTheDocument();
      });
    });

    it("closes camera modal on cancel", () => {
      render(<MediaUploader enableCamera={true} />);

      const cameraButton = screen.getByTestId("camera-icon").closest("button")!;
      fireEvent.click(cameraButton);

      const closeButton = screen.getByText("Close");
      fireEvent.click(closeButton);

      expect(screen.queryByTestId("camera-capture")).not.toBeInTheDocument();
    });
  });

  describe("Video Recording", () => {
    it("opens video recorder modal on button click", () => {
      render(<MediaUploader enableVideoRecording={true} />);

      const videoButton = screen.getByTestId("video-icon").closest("button")!;
      fireEvent.click(videoButton);

      expect(screen.getByTestId("video-recorder")).toBeInTheDocument();
    });

    it("handles recorded video", async () => {
      render(
        <MediaUploader
          enableVideoRecording={true}
          onFilesAdded={mockOnFilesAdded}
        />,
      );

      const videoButton = screen.getByTestId("video-icon").closest("button")!;
      fireEvent.click(videoButton);

      const recordButton = screen.getByText("Record");
      fireEvent.click(recordButton);

      await waitFor(() => {
        expect(mockOnFilesAdded).toHaveBeenCalledWith([
          expect.objectContaining({ id: "video-1" }),
        ]);
      });
    });

    it("closes video recorder after recording", async () => {
      render(
        <MediaUploader
          enableVideoRecording={true}
          onFilesAdded={mockOnFilesAdded}
        />,
      );

      const videoButton = screen.getByTestId("video-icon").closest("button")!;
      fireEvent.click(videoButton);

      const recordButton = screen.getByText("Record");
      fireEvent.click(recordButton);

      await waitFor(() => {
        expect(screen.queryByTestId("video-recorder")).not.toBeInTheDocument();
      });
    });
  });

  describe("File Type Detection", () => {
    it("detects image file type", async () => {
      render(<MediaUploader onFilesAdded={mockOnFilesAdded} />);

      const file = new File(["content"], "image.jpg", { type: "image/jpeg" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnFilesAdded).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ type: "image" })]),
        );
      });
    });

    it("detects video file type", async () => {
      render(<MediaUploader onFilesAdded={mockOnFilesAdded} accept="video" />);

      const file = new File(["content"], "video.mp4", { type: "video/mp4" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnFilesAdded).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ type: "video" })]),
        );
      });
    });

    it("skips non-image files when accept=image", async () => {
      render(<MediaUploader onFilesAdded={mockOnFilesAdded} accept="image" />);

      const file = new File(["content"], "video.mp4", { type: "video/mp4" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnFilesAdded).not.toHaveBeenCalled();
      });
    });

    it("skips non-video files when accept=video", async () => {
      render(<MediaUploader onFilesAdded={mockOnFilesAdded} accept="video" />);

      const file = new File(["content"], "image.jpg", { type: "image/jpeg" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnFilesAdded).not.toHaveBeenCalled();
      });
    });
  });

  describe("Resource Type Validation", () => {
    it("validates with product resource type", async () => {
      render(
        <MediaUploader
          onFilesAdded={mockOnFilesAdded}
          resourceType="product"
        />,
      );

      const file = new File(["content"], "product.jpg", { type: "image/jpeg" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(validateMedia).toHaveBeenCalledWith(
          file,
          "PRODUCT_IMAGE",
          "image",
        );
      });
    });

    it("validates with shop resource type", async () => {
      render(
        <MediaUploader onFilesAdded={mockOnFilesAdded} resourceType="shop" />,
      );

      const file = new File(["content"], "shop.jpg", { type: "image/jpeg" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(validateMedia).toHaveBeenCalledWith(file, "SHOP_LOGO", "image");
      });
    });

    it("validates with category resource type", async () => {
      render(
        <MediaUploader
          onFilesAdded={mockOnFilesAdded}
          resourceType="category"
        />,
      );

      const file = new File(["content"], "category.jpg", {
        type: "image/jpeg",
      });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(validateMedia).toHaveBeenCalledWith(
          file,
          "CATEGORY_IMAGE",
          "image",
        );
      });
    });

    it("validates with user resource type", async () => {
      render(
        <MediaUploader onFilesAdded={mockOnFilesAdded} resourceType="user" />,
      );

      const file = new File(["content"], "avatar.jpg", { type: "image/jpeg" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(validateMedia).toHaveBeenCalledWith(
          file,
          "USER_AVATAR",
          "image",
        );
      });
    });
  });

  describe("Error Display", () => {
    it("displays validation errors", async () => {
      (validateMedia as jest.Mock).mockResolvedValueOnce({
        errors: ["File too large", "Invalid format"],
        warnings: [],
      });

      render(<MediaUploader />);

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(
          screen.getByText(/test.jpg.*file too large.*invalid format/i),
        ).toBeInTheDocument();
      });
    });

    it("shows alert icon for errors", async () => {
      (validateMedia as jest.Mock).mockResolvedValueOnce({
        errors: ["Error"],
        warnings: [],
      });

      render(<MediaUploader />);

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
      });
    });

    it("clears errors on new upload", async () => {
      (validateMedia as jest.Mock)
        .mockResolvedValueOnce({ errors: ["Error"], warnings: [] })
        .mockResolvedValueOnce({ errors: [], warnings: [] });

      render(<MediaUploader onFilesAdded={mockOnFilesAdded} />);

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      // First upload with error
      const file1 = new File(["content"], "bad.jpg", { type: "image/jpeg" });
      fireEvent.change(fileInput, { target: { files: [file1] } });

      await waitFor(() => {
        expect(screen.getByText(/bad.jpg.*error/i)).toBeInTheDocument();
      });

      // Second upload without error
      const file2 = new File(["content"], "good.jpg", { type: "image/jpeg" });
      fireEvent.change(fileInput, { target: { files: [file2] } });

      await waitFor(() => {
        expect(screen.queryByText(/bad.jpg/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Disabled State", () => {
    it("disables all interactions when disabled", () => {
      render(<MediaUploader disabled={true} />);

      const uploadArea = screen.getByText("Upload media files").closest("div");
      const fileInput = document.querySelector('input[type="file"]');

      expect(uploadArea).toHaveClass("cursor-not-allowed");
      expect(fileInput).toBeDisabled();
    });

    it("hides action buttons when disabled", () => {
      render(<MediaUploader disabled={true} enableCamera={true} />);

      expect(screen.queryByTestId("camera-icon")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty file list", async () => {
      render(<MediaUploader onFilesAdded={mockOnFilesAdded} />);

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [] } });

      await waitFor(() => {
        expect(mockOnFilesAdded).not.toHaveBeenCalled();
      });
    });

    it("generates unique IDs for files", async () => {
      render(<MediaUploader onFilesAdded={mockOnFilesAdded} />);

      const file1 = new File(["content"], "test1.jpg", { type: "image/jpeg" });
      const file2 = new File(["content"], "test2.jpg", { type: "image/jpeg" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file1, file2] } });

      await waitFor(() => {
        const addedFiles = mockOnFilesAdded.mock.calls[0][0];
        expect(addedFiles[0].id).not.toBe(addedFiles[1].id);
      });
    });

    it("includes file metadata", async () => {
      render(<MediaUploader onFilesAdded={mockOnFilesAdded} />);

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnFilesAdded).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              metadata: expect.objectContaining({
                size: file.size,
                mimeType: file.type,
              }),
            }),
          ]),
        );
      });
    });

    it("sets upload status to pending", async () => {
      render(<MediaUploader onFilesAdded={mockOnFilesAdded} />);

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnFilesAdded).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              uploadStatus: "pending",
              uploadProgress: 0,
            }),
          ]),
        );
      });
    });
  });
});
