import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ImageUpload } from "../ImageUpload";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    ...rest
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} {...rest} />,
}));

// By default camera is supported; individual tests can override
const mockUseCamera = {
  isSupported: true,
  isActive: false,
  isCapturing: false,
  stream: null,
  error: null,
  videoRef: { current: null },
  startCamera: jest.fn(),
  stopCamera: jest.fn(),
  takePhoto: jest.fn(() => null),
  startRecording: jest.fn(),
  stopRecording: jest.fn(),
  switchCamera: jest.fn(),
};

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useCamera: jest.fn(() => mockUseCamera),
}));

// CameraCapture is only rendered when camera mode is active — mock it
jest.mock("@/components", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    type,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: string;
    className?: string;
  }) => (
    <button
      type={(type as "button" | "submit" | "reset") ?? "button"}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  ),
  Label: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
  Span: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <span className={className}>{children}</span>,
  Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  CameraCapture: ({
    onCapture,
  }: {
    onCapture: (blob: Blob, type: "photo" | "video") => void;
  }) => (
    <div data-testid="camera-capture">
      <button
        onClick={() =>
          onCapture(new Blob(["img"], { type: "image/webp" }), "photo")
        }
      >
        capture
      </button>
    </div>
  ),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

const mockOnUpload = jest
  .fn()
  .mockResolvedValue("https://cdn.example.com/img.webp");
const mockOnChange = jest.fn();

function makeFile(name = "photo.jpg", type = "image/jpeg"): File {
  return new File(["content"], name, { type });
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ImageUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCamera.isSupported = true;
  });

  // ── Default (file-only) ──────────────────────────────────────────────────

  describe("default captureSource (file-only)", () => {
    it("renders file picker upload button", () => {
      render(<ImageUpload onUpload={mockOnUpload} label="Product Image" />);
      expect(screen.getByText("Click to upload")).toBeInTheDocument();
    });

    it("does not render CameraCapture", () => {
      render(<ImageUpload onUpload={mockOnUpload} />);
      expect(screen.queryByTestId("camera-capture")).not.toBeInTheDocument();
    });

    it("does not render toggle buttons", () => {
      render(<ImageUpload onUpload={mockOnUpload} captureSource="file-only" />);
      expect(screen.queryByText("switchToCamera")).not.toBeInTheDocument();
      expect(screen.queryByText("switchToUpload")).not.toBeInTheDocument();
    });
  });

  // ── Camera-only with camera supported ───────────────────────────────────

  describe("captureSource=camera-only with camera support", () => {
    it("renders CameraCapture instead of file picker", () => {
      render(
        <ImageUpload onUpload={mockOnUpload} captureSource="camera-only" />,
      );
      expect(screen.getByTestId("camera-capture")).toBeInTheDocument();
      expect(screen.queryByText("Click to upload")).not.toBeInTheDocument();
    });

    it("calls onUpload with a File when camera captures a photo", async () => {
      render(
        <ImageUpload
          onUpload={mockOnUpload}
          onChange={mockOnChange}
          captureSource="camera-only"
        />,
      );
      fireEvent.click(screen.getByText("capture"));
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledTimes(1);
        const arg = mockOnUpload.mock.calls[0][0] as File;
        expect(arg).toBeInstanceOf(File);
        expect(arg.name).toBe("camera-capture.webp");
        expect(arg.type).toBe("image/webp");
      });
    });

    it("calls onChange with the uploaded URL after camera capture", async () => {
      render(
        <ImageUpload
          onUpload={mockOnUpload}
          onChange={mockOnChange}
          captureSource="camera-only"
        />,
      );
      fireEvent.click(screen.getByText("capture"));
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          "https://cdn.example.com/img.webp",
        );
      });
    });
  });

  // ── Camera-only without camera support (mobile fallback) ─────────────────

  describe("captureSource=camera-only without camera support", () => {
    it("renders mobile capture fallback button instead of CameraCapture", () => {
      mockUseCamera.isSupported = false;
      render(
        <ImageUpload onUpload={mockOnUpload} captureSource="camera-only" />,
      );
      // CameraCapture should not appear
      expect(screen.queryByTestId("camera-capture")).not.toBeInTheDocument();
      // The mobile fallback button should be visible
      expect(screen.getByText("switchToCamera")).toBeInTheDocument();
    });
  });

  // ── Both: toggle between file and camera ────────────────────────────────

  describe("captureSource=both with camera support", () => {
    it("renders toggle buttons", () => {
      render(<ImageUpload onUpload={mockOnUpload} captureSource="both" />);
      expect(screen.getByText("switchToUpload")).toBeInTheDocument();
      expect(screen.getByText("switchToCamera")).toBeInTheDocument();
    });

    it("defaults to file input mode (no camera)", () => {
      render(<ImageUpload onUpload={mockOnUpload} captureSource="both" />);
      expect(screen.getByText("Click to upload")).toBeInTheDocument();
      expect(screen.queryByTestId("camera-capture")).not.toBeInTheDocument();
    });

    it("switches to camera mode on toggle click", () => {
      render(<ImageUpload onUpload={mockOnUpload} captureSource="both" />);
      fireEvent.click(screen.getByText("switchToCamera"));
      expect(screen.getByTestId("camera-capture")).toBeInTheDocument();
      expect(screen.queryByText("Click to upload")).not.toBeInTheDocument();
    });

    it("switches back to file mode on toggle click", () => {
      render(<ImageUpload onUpload={mockOnUpload} captureSource="both" />);
      fireEvent.click(screen.getByText("switchToCamera"));
      fireEvent.click(screen.getByText("switchToUpload"));
      expect(screen.getByText("Click to upload")).toBeInTheDocument();
      expect(screen.queryByTestId("camera-capture")).not.toBeInTheDocument();
    });
  });

  // ── Both: no camera support — toggle hidden ───────────────────────────────

  describe("captureSource=both without camera support", () => {
    it("does not render toggle buttons when camera is unsupported", () => {
      mockUseCamera.isSupported = false;
      render(<ImageUpload onUpload={mockOnUpload} captureSource="both" />);
      expect(screen.queryByText("switchToUpload")).not.toBeInTheDocument();
      expect(screen.queryByText("switchToCamera")).not.toBeInTheDocument();
      // Falls back to file picker
      expect(screen.getByText("Click to upload")).toBeInTheDocument();
    });
  });

  // ── Label & helper text ──────────────────────────────────────────────────

  it("renders label when provided", () => {
    render(<ImageUpload onUpload={mockOnUpload} label="My Label" />);
    expect(screen.getByText("My Label")).toBeInTheDocument();
  });

  it("renders helperText", () => {
    render(<ImageUpload onUpload={mockOnUpload} helperText="Max 5 MB" />);
    expect(screen.getByText("Max 5 MB")).toBeInTheDocument();
  });

  // ── Error from camera capture upload failure ─────────────────────────────

  it("shows error when camera capture upload fails", async () => {
    const failUpload = jest.fn().mockRejectedValue(new Error("Network error"));
    render(<ImageUpload onUpload={failUpload} captureSource="camera-only" />);
    fireEvent.click(screen.getByText("capture"));
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });
});
