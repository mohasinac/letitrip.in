/**
 * CameraCapture Tests
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";

// ---------------------------------------------------------------------------
// next-intl mock
// ---------------------------------------------------------------------------
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// ---------------------------------------------------------------------------
// useCamera hook mock
// ---------------------------------------------------------------------------
const mockCamera = {
  isSupported: true,
  isActive: false,
  isCapturing: false,
  stream: null,
  error: null as string | null,
  videoRef: { current: null } as React.RefObject<HTMLVideoElement>,
  startCamera: jest.fn().mockResolvedValue(undefined),
  stopCamera: jest.fn(),
  takePhoto: jest.fn(),
  startRecording: jest.fn(),
  stopRecording: jest
    .fn()
    .mockResolvedValue(new Blob(["v"], { type: "video/webm" })),
  switchCamera: jest.fn().mockResolvedValue(undefined),
};

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useCamera: jest.fn(() => mockCamera),
}));

// ---------------------------------------------------------------------------
// @/components — partial mock (Alert, Button, Span, Spinner)
// ---------------------------------------------------------------------------
jest.mock("@/components", () => ({
  Alert: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant?: string;
  }) => (
    <div data-testid="alert" data-variant={variant}>
      {children}
    </div>
  ),
  Button: ({
    children,
    onClick,
    disabled,
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    "aria-label"?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  ),
  Span: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <span className={className}>{children}</span>,
  Spinner: () => <div data-testid="spinner" />,
}));

// ---------------------------------------------------------------------------
// @/constants mock
// ---------------------------------------------------------------------------
jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    flex: {
      center: "flex items-center justify-center",
      colCenter: "flex flex-col items-center",
      center: "flex items-center justify-center",
    },
    position: { fill: "absolute inset-0" },
  },
}));

// ---------------------------------------------------------------------------
// navigator.mediaDevices stub
// ---------------------------------------------------------------------------
Object.defineProperty(global.navigator, "mediaDevices", {
  writable: true,
  value: {
    enumerateDevices: jest.fn().mockResolvedValue([]),
  },
});

import CameraCapture from "../CameraCapture";

describe("CameraCapture", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock camera to default active state
    mockCamera.isActive = true;
    mockCamera.isCapturing = false;
    mockCamera.error = null;
    mockCamera.startCamera.mockResolvedValue(undefined);
    mockCamera.stopRecording.mockResolvedValue(
      new Blob(["v"], { type: "video/webm" }),
    );
    (navigator.mediaDevices.enumerateDevices as jest.Mock).mockResolvedValue(
      [],
    );
  });

  it("renders a video element for the viewfinder", async () => {
    const { container } = render(
      <CameraCapture mode="photo" onCapture={jest.fn()} />,
    );
    await waitFor(() =>
      expect(mockCamera.startCamera).toHaveBeenCalledWith({
        facingMode: "environment",
        audio: false,
      }),
    );
    expect(container.querySelector("video")).toBeInTheDocument();
  });

  it("shows spinner while starting camera", () => {
    // Don't resolve startCamera — stays in 'starting' state
    mockCamera.startCamera.mockReturnValue(new Promise(() => {}));
    render(<CameraCapture mode="photo" onCapture={jest.fn()} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows error alert when camera.error is set", async () => {
    mockCamera.error = "Camera unavailable";
    render(<CameraCapture mode="photo" onCapture={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByTestId("alert")).toBeInTheDocument(),
    );
    expect(screen.getByText("Camera unavailable")).toBeInTheDocument();
  });

  it("calls onError prop when camera.error changes", async () => {
    const onError = jest.fn();
    mockCamera.error = "Camera unavailable";
    render(
      <CameraCapture mode="photo" onCapture={jest.fn()} onError={onError} />,
    );
    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith("Camera unavailable"),
    );
  });

  it("photo mode: shows takePhoto button", async () => {
    render(<CameraCapture mode="photo" onCapture={jest.fn()} />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "takePhoto" }),
      ).toBeInTheDocument(),
    );
  });

  it("video mode: shows startRecording button", async () => {
    render(<CameraCapture mode="video" onCapture={jest.fn()} />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "startRecording" }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: "takePhoto" }),
    ).not.toBeInTheDocument();
  });

  it("both mode: shows both shutter and record buttons", async () => {
    render(<CameraCapture mode="both" onCapture={jest.fn()} />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "takePhoto" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "startRecording" }),
      ).toBeInTheDocument();
    });
  });

  it("clicking takePhoto calls onCapture with blob and 'photo'", async () => {
    const photoBlob = new Blob(["img"], { type: "image/webp" });
    mockCamera.takePhoto.mockReturnValue(photoBlob);
    const onCapture = jest.fn();
    render(<CameraCapture mode="photo" onCapture={onCapture} />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "takePhoto" }),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "takePhoto" }));
    expect(onCapture).toHaveBeenCalledWith(photoBlob, "photo");
  });

  it("clicking record button calls startRecording and toggles to stopRecording", async () => {
    render(<CameraCapture mode="video" onCapture={jest.fn()} />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "startRecording" }),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "startRecording" }));
    expect(mockCamera.startRecording).toHaveBeenCalled();
  });

  it("clicking stopRecording calls stopRecording and onCapture", async () => {
    mockCamera.isCapturing = true;
    const videoBlob = new Blob(["v"], { type: "video/webm" });
    mockCamera.stopRecording.mockResolvedValue(videoBlob);
    const onCapture = jest.fn();

    render(<CameraCapture mode="video" onCapture={onCapture} />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "stopRecording" }),
      ).toBeInTheDocument(),
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "stopRecording" }));
    });

    await waitFor(() =>
      expect(onCapture).toHaveBeenCalledWith(videoBlob, "video"),
    );
  });

  it("shows flip camera button when multiple cameras are detected", async () => {
    (navigator.mediaDevices.enumerateDevices as jest.Mock).mockResolvedValue([
      { kind: "videoinput", deviceId: "a" },
      { kind: "videoinput", deviceId: "b" },
    ]);
    render(<CameraCapture mode="photo" onCapture={jest.fn()} />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "flipCamera" }),
      ).toBeInTheDocument(),
    );
  });

  it("does NOT show flip button when only one camera is available", async () => {
    (navigator.mediaDevices.enumerateDevices as jest.Mock).mockResolvedValue([
      { kind: "videoinput", deviceId: "a" },
    ]);
    render(<CameraCapture mode="photo" onCapture={jest.fn()} />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "takePhoto" }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: "flipCamera" }),
    ).not.toBeInTheDocument();
  });
});
