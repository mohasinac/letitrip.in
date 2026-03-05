/**
 * useCamera Tests
 */

import { renderHook, act } from "@testing-library/react";
import { useCamera } from "../useCamera";

// ---------------------------------------------------------------------------
// Global browser API mocks
// ---------------------------------------------------------------------------

const mockStop = jest.fn();
const mockGetTracks = jest.fn(() => [{ stop: mockStop }]);

const mockMediaStream = {
  getTracks: mockGetTracks,
} as unknown as MediaStream;

const mockGetUserMedia = jest.fn();
const mockEnumerateDevices = jest.fn();

Object.defineProperty(global.navigator, "mediaDevices", {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia,
    enumerateDevices: mockEnumerateDevices,
  },
});

// MediaRecorder mock
const mockRecorderStart = jest.fn();
const mockRecorderStop = jest.fn();
let recorderOnStop: (() => void) | null = null;
let recorderOnDataAvailable: ((e: { data: Blob }) => void) | null = null;

class MockMediaRecorder {
  state = "inactive";
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  constructor(_stream: MediaStream, _options?: MediaRecorderOptions) {}
  start() {
    this.state = "recording";
    mockRecorderStart();
    recorderOnDataAvailable = this.ondataavailable;
    recorderOnStop = this.onstop;
  }
  stop() {
    this.state = "inactive";
    mockRecorderStop();
  }
}

(global as unknown as Record<string, unknown>).MediaRecorder = MockMediaRecorder;

// ---------------------------------------------------------------------------
// canvas.toBlob stub — installed inside beforeEach to avoid module-level
// document access issues; captured in a module-scope variable for assertions.
// ---------------------------------------------------------------------------

const mockToBlob = jest.fn((cb: BlobCallback) => {
  cb(new Blob(["photo"], { type: "image/webp" }));
});
const mockGetContext = jest.fn(() => ({ drawImage: jest.fn() }));

let mockCreateElement: jest.SpyInstance;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useCamera", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserMedia.mockResolvedValue(mockMediaStream);
    recorderOnStop = null;
    recorderOnDataAvailable = null;

    // Spy on document.createElement inside beforeEach so jsdom is ready
    const originalCreateElement = document.createElement.bind(document);
    mockCreateElement = jest
      .spyOn(document, "createElement")
      .mockImplementation((tag: string) => {
        if (tag === "canvas") {
          return {
            width: 0,
            height: 0,
            toBlob: mockToBlob,
            getContext: mockGetContext,
          } as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tag);
      });
  });

  afterEach(() => {
    mockCreateElement?.mockRestore();
  });

  it("isSupported is true when navigator.mediaDevices is available", () => {
    const { result } = renderHook(() => useCamera());
    expect(result.current.isSupported).toBe(true);
  });

  it("starts with isActive=false, stream=null", () => {
    const { result } = renderHook(() => useCamera());
    expect(result.current.isActive).toBe(false);
    expect(result.current.stream).toBeNull();
  });

  it("startCamera opens stream and sets isActive=true", async () => {
    const { result } = renderHook(() => useCamera());
    await act(async () => {
      await result.current.startCamera();
    });
    expect(mockGetUserMedia).toHaveBeenCalledWith({
      video: { facingMode: "environment" },
      audio: false,
    });
    expect(result.current.isActive).toBe(true);
    expect(result.current.stream).toBe(mockMediaStream);
  });

  it("stopCamera releases tracks and resets state", async () => {
    const { result } = renderHook(() => useCamera());
    await act(async () => {
      await result.current.startCamera();
    });
    act(() => {
      result.current.stopCamera();
    });
    expect(mockStop).toHaveBeenCalled();
    expect(result.current.isActive).toBe(false);
    expect(result.current.stream).toBeNull();
  });

  it("sets error when getUserMedia throws NotAllowedError", async () => {
    const err = new DOMException("denied", "NotAllowedError");
    mockGetUserMedia.mockRejectedValueOnce(err);
    const { result } = renderHook(() => useCamera());
    await act(async () => {
      await result.current.startCamera();
    });
    expect(result.current.error).toMatch(/permission denied/i);
  });

  it("takes a photo and returns a Blob", async () => {
    const { result } = renderHook(() => useCamera());
    await act(async () => {
      await result.current.startCamera();
    });

    // videoRef.current is null in renderHook (no <video> in DOM) — seed it
    Object.defineProperty(result.current.videoRef, "current", {
      writable: true,
      value: { videoWidth: 640, videoHeight: 480 },
    });

    let blob: Blob | null = null;
    act(() => {
      blob = result.current.takePhoto();
    });
    expect(blob).not.toBeNull();
    expect((blob as unknown as Blob).type).toBe("image/webp");
  });

  it("startRecording sets isCapturing=true", async () => {
    const { result } = renderHook(() => useCamera());
    await act(async () => {
      await result.current.startCamera();
    });
    act(() => {
      result.current.startRecording();
    });
    expect(result.current.isCapturing).toBe(true);
    expect(mockRecorderStart).toHaveBeenCalled();
  });

  it("stopRecording resolves with a video Blob", async () => {
    const { result } = renderHook(() => useCamera());
    await act(async () => {
      await result.current.startCamera();
    });
    act(() => {
      result.current.startRecording();
    });

    let blob!: Blob;
    const promise = act(async () => {
      blob = await result.current.stopRecording();
    });

    // Simulate recorder firing onstop
    act(() => {
      if (recorderOnStop) recorderOnStop();
    });

    await promise;
    expect(blob).toBeDefined();
  });

  it("switchCamera toggles to front camera", async () => {
    const { result } = renderHook(() => useCamera());
    await act(async () => {
      await result.current.startCamera({ facingMode: "environment" });
    });
    await act(async () => {
      await result.current.switchCamera();
    });
    expect(mockGetUserMedia).toHaveBeenLastCalledWith(
      expect.objectContaining({
        video: { facingMode: "user" },
      }),
    );
  });

  it("stopCamera is called automatically on unmount", async () => {
    const { result, unmount } = renderHook(() => useCamera());
    await act(async () => {
      await result.current.startCamera();
    });
    unmount();
    expect(mockStop).toHaveBeenCalled();
  });
});
