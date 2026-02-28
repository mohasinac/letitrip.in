/**
 * Tests for AvatarUpload component
 *
 * Coverage:
 * - File selection and preview
 * - Image cropping modal
 * - Upload flow via useMediaUpload (POST /api/media/upload)
 * - Error handling
 * - Loading states
 * - Cancel pending change
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock next-intl BEFORE everything else
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock hooks — useMediaUpload (replaces old useStorageUpload)
jest.mock("@/hooks", () => ({
  useMediaUpload: jest.fn(),
}));

// Mock component dependencies
jest.mock("@/components", () => ({
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
  Alert: ({ variant, children, onClose }: any) => (
    <div data-testid="alert" data-variant={variant}>
      {children}
      {onClose && (
        <button onClick={onClose} data-testid="alert-close">
          ×
        </button>
      )}
    </div>
  ),
  Progress: ({ value, label, variant: pVariant }: any) => (
    <div data-testid="progress" data-value={value} data-variant={pVariant}>
      {label && <span>{label}</span>}
    </div>
  ),
  ImageCropModal: ({ isOpen, imageUrl, onSave, onClose }: any) =>
    isOpen ? (
      <div data-testid="crop-modal">
        <img src={imageUrl} alt="crop-preview" />
        <button
          onClick={() =>
            onSave({ url: imageUrl, zoom: 1, position: { x: 50, y: 50 } })
          }
        >
          Save
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null,
  AvatarDisplay: ({ cropData, size }: any) => (
    <div data-testid="avatar-display" data-size={size}>
      {cropData?.url ? (
        <img src={cropData.url} alt="avatar" />
      ) : (
        <span>No Avatar</span>
      )}
    </div>
  ),
  Text: ({ children }: any) => <span>{children}</span>,
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    spacing: { stack: "space-y-4" },
    themed: { border: "border-gray-200" },
  },
  UI_HELP_TEXT: {
    AVATAR_UPLOAD: "Upload guidelines",
    AVATAR_FORMATS: "Accepted formats",
  },
  SUCCESS_MESSAGES: {
    UPLOAD: { AVATAR_UPLOADED: "Avatar uploaded successfully" },
  },
}));

import { AvatarUpload } from "../AvatarUpload";
import * as hooks from "@/hooks";

describe("AvatarUpload", () => {
  const mockMutate = jest.fn();
  const mockReset = jest.fn();
  const mockUseMediaUpload = hooks.useMediaUpload as jest.MockedFunction<
    typeof hooks.useMediaUpload
  >;

  const defaultProps = {
    userId: "test-user-id",
    currentPhotoURL: null,
    currentCropData: null,
  };

  const defaultReturn = {
    mutate: mockMutate,
    isLoading: false,
    error: null,
    data: undefined,
    reset: mockReset,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMediaUpload.mockReturnValue(defaultReturn as any);
    global.FileReader = class FileReader {
      readAsDataURL() {
        setTimeout(() => {
          (this as any).result = "data:image/jpeg;base64,test";
          (this as any).onloadend?.();
        }, 0);
      }
    } as any;
  });

  describe("Rendering", () => {
    it("renders without current avatar", () => {
      render(<AvatarUpload {...defaultProps} />);
      expect(screen.getByTestId("avatar-display")).toBeInTheDocument();
      expect(screen.getByText("chooseImage")).toBeInTheDocument();
    });

    it("renders with current avatar", () => {
      render(
        <AvatarUpload
          {...defaultProps}
          currentPhotoURL="https://example.com/avatar.jpg"
          currentCropData={{
            url: "https://example.com/avatar.jpg",
            zoom: 1,
            position: { x: 50, y: 50 },
          }}
        />,
      );
      expect(screen.getByAltText("avatar")).toHaveAttribute(
        "src",
        "https://example.com/avatar.jpg",
      );
      expect(screen.getByText("changePhoto")).toBeInTheDocument();
    });

    it("renders upload instructions", () => {
      render(<AvatarUpload {...defaultProps} />);
      expect(screen.getByText("Upload guidelines")).toBeInTheDocument();
      expect(screen.getByText("Accepted formats")).toBeInTheDocument();
    });
  });

  describe("File Selection", () => {
    it("opens crop modal when file is selected", async () => {
      render(<AvatarUpload {...defaultProps} />);
      const fileInput = screen.getByLabelText("changePhoto");
      fireEvent.change(fileInput, {
        target: { files: [new File(["t"], "t.jpg", { type: "image/jpeg" })] },
      });
      await waitFor(() =>
        expect(screen.getByTestId("crop-modal")).toBeInTheDocument(),
      );
    });

    it("does nothing if no file selected", () => {
      render(<AvatarUpload {...defaultProps} />);
      fireEvent.change(screen.getByLabelText("changePhoto"), {
        target: { files: [] },
      });
      expect(screen.queryByTestId("crop-modal")).not.toBeInTheDocument();
    });
  });

  describe("Crop Modal", () => {
    it("closes modal when cancel is clicked", async () => {
      render(<AvatarUpload {...defaultProps} />);
      fireEvent.change(screen.getByLabelText("changePhoto"), {
        target: { files: [new File(["t"], "t.jpg", { type: "image/jpeg" })] },
      });
      await waitFor(() =>
        expect(screen.getByTestId("crop-modal")).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("Cancel"));
      expect(screen.queryByTestId("crop-modal")).not.toBeInTheDocument();
    });

    it("shows pending save button after crop is saved", async () => {
      render(<AvatarUpload {...defaultProps} />);
      fireEvent.change(screen.getByLabelText("changePhoto"), {
        target: { files: [new File(["t"], "t.jpg", { type: "image/jpeg" })] },
      });
      await waitFor(() =>
        expect(screen.getByTestId("crop-modal")).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("Save"));
      await waitFor(() =>
        expect(screen.getByText("saveAvatar")).toBeInTheDocument(),
      );
    });

    it("calls mutate with FormData when Save Avatar is clicked", async () => {
      mockMutate.mockResolvedValue({ url: "https://example.com/new.jpg" });
      render(<AvatarUpload {...defaultProps} />);
      fireEvent.change(screen.getByLabelText("changePhoto"), {
        target: { files: [new File(["t"], "t.jpg", { type: "image/jpeg" })] },
      });
      await waitFor(() =>
        expect(screen.getByTestId("crop-modal")).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("Save"));
      await waitFor(() =>
        expect(screen.getByText("saveAvatar")).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("saveAvatar"));
      await waitFor(() =>
        expect(mockMutate).toHaveBeenCalledWith(expect.any(FormData)),
      );
    });
  });

  describe("Upload Flow", () => {
    it("calls onUploadSuccess with url and cropData after upload", async () => {
      const newUrl = "https://example.com/uploaded.jpg";
      mockMutate.mockResolvedValue({ url: newUrl });
      const onUploadSuccess = jest.fn();
      render(
        <AvatarUpload {...defaultProps} onUploadSuccess={onUploadSuccess} />,
      );
      fireEvent.change(screen.getByLabelText("changePhoto"), {
        target: { files: [new File(["t"], "t.jpg", { type: "image/jpeg" })] },
      });
      await waitFor(() =>
        expect(screen.getByTestId("crop-modal")).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("Save"));
      await waitFor(() =>
        expect(screen.getByText("saveAvatar")).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("saveAvatar"));
      await waitFor(() =>
        expect(onUploadSuccess).toHaveBeenCalledWith(
          newUrl,
          expect.objectContaining({ zoom: 1 }),
        ),
      );
    });

    it("calls onSaveComplete after successful upload", async () => {
      mockMutate.mockResolvedValue({ url: "https://example.com/new.jpg" });
      const onSaveComplete = jest.fn();
      render(
        <AvatarUpload {...defaultProps} onSaveComplete={onSaveComplete} />,
      );
      fireEvent.change(screen.getByLabelText("changePhoto"), {
        target: { files: [new File(["t"], "t.jpg", { type: "image/jpeg" })] },
      });
      await waitFor(() =>
        expect(screen.getByTestId("crop-modal")).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("Save"));
      await waitFor(() =>
        expect(screen.getByText("saveAvatar")).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("saveAvatar"));
      await waitFor(() => expect(onSaveComplete).toHaveBeenCalled());
    });
  });

  describe("Loading States", () => {
    it("shows progress bar while uploading (isLoading=true)", () => {
      mockUseMediaUpload.mockReturnValue({
        ...defaultReturn,
        isLoading: true,
      } as any);
      render(<AvatarUpload {...defaultProps} />);
      expect(screen.getByTestId("progress")).toBeInTheDocument();
      expect(screen.getByText("uploading")).toBeInTheDocument();
    });

    it("hides default controls while uploading", () => {
      mockUseMediaUpload.mockReturnValue({
        ...defaultReturn,
        isLoading: true,
      } as any);
      render(<AvatarUpload {...defaultProps} />);
      expect(screen.queryByText("chooseImage")).not.toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("displays error from uploadApiError", () => {
      mockUseMediaUpload.mockReturnValue({
        ...defaultReturn,
        error: { message: "Upload failed", status: 500 },
      } as any);
      render(<AvatarUpload {...defaultProps} />);
      expect(screen.getByTestId("alert")).toHaveAttribute(
        "data-variant",
        "error",
      );
      expect(screen.getByTestId("alert")).toHaveTextContent("Upload failed");
    });

    it("calls onUploadError when mutate throws", async () => {
      mockMutate.mockRejectedValue(new Error("Network error"));
      const onUploadError = jest.fn();
      render(<AvatarUpload {...defaultProps} onUploadError={onUploadError} />);
      fireEvent.change(screen.getByLabelText("changePhoto"), {
        target: { files: [new File(["t"], "t.jpg", { type: "image/jpeg" })] },
      });
      await waitFor(() =>
        expect(screen.getByTestId("crop-modal")).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("Save"));
      await waitFor(() =>
        expect(screen.getByText("saveAvatar")).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("saveAvatar"));
      await waitFor(() =>
        expect(onUploadError).toHaveBeenCalledWith("Network error"),
      );
    });

    it("calls reset when alert close is clicked", () => {
      mockUseMediaUpload.mockReturnValue({
        ...defaultReturn,
        error: { message: "Failed", status: 500 },
      } as any);
      render(<AvatarUpload {...defaultProps} />);
      fireEvent.click(screen.getByTestId("alert-close"));
      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe("Cancel Pending", () => {
    it("hides Save Avatar button when cancelChange is clicked", async () => {
      render(<AvatarUpload {...defaultProps} />);
      fireEvent.change(screen.getByLabelText("changePhoto"), {
        target: { files: [new File(["t"], "t.jpg", { type: "image/jpeg" })] },
      });
      await waitFor(() =>
        expect(screen.getByTestId("crop-modal")).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("Save"));
      await waitFor(() =>
        expect(screen.getByText("saveAvatar")).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("cancelChange"));
      expect(screen.queryByText("saveAvatar")).not.toBeInTheDocument();
      expect(screen.getByText("chooseImage")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has accessible file input", () => {
      render(<AvatarUpload {...defaultProps} />);
      const fileInput = screen.getByLabelText("changePhoto");
      expect(fileInput).toHaveAttribute("type", "file");
      expect(fileInput).toHaveAttribute(
        "accept",
        "image/jpeg,image/png,image/webp,image/gif",
      );
    });
  });
});
