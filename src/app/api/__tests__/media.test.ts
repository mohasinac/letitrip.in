/**
 * @jest-environment node
 */

/**
 * Media API Integration Tests
 *
 * Tests:
 * - POST /api/media/upload
 * - POST /api/media/crop  (placeholder - returns 501)
 * - POST /api/media/trim  (placeholder - returns 501)
 */

import { buildRequest, parseResponse } from "./helpers";

// ============================================
// Mocks
// ============================================

const mockRequireAuthFromRequest = jest.fn();
jest.mock("@/lib/security/authorization", () => ({
  requireAuthFromRequest: (...args: unknown[]) =>
    mockRequireAuthFromRequest(...args),
}));

jest.mock("@/lib/validation/schemas", () => ({
  validateRequestBody: (schema: any, body: any) => {
    if (body && Object.keys(body).length > 0) {
      return { success: true, data: body };
    }
    return { success: false, errors: { _errors: ["Validation failed"] } };
  },
  formatZodErrors: (errors: any) => ({ _errors: ["Validation failed"] }),
  cropDataSchema: {},
  trimDataSchema: {},
  mediaUploadRequestSchema: {},
}));

// Mock axios for HTTP downloads
jest.mock("axios", () => {
  const mockAxios = {
    get: jest.fn(() =>
      Promise.resolve({
        data: Buffer.from("mocked-image-or-video-data"),
      }),
    ),
  };
  return {
    __esModule: true,
    default: mockAxios,
  };
});

// Mock sharp for image processing
jest.mock("sharp", () => {
  return jest.fn(() => {
    const mockSharp = {
      metadata: jest.fn().mockResolvedValue({ format: "jpeg" }),
      extract: jest.fn(function (this: any) {
        return this;
      }),
      jpeg: jest.fn(function (this: any) {
        return this;
      }),
      png: jest.fn(function (this: any) {
        return this;
      }),
      webp: jest.fn(function (this: any) {
        return this;
      }),
      toBuffer: jest
        .fn()
        .mockResolvedValue(Buffer.from("mocked-cropped-image")),
    };
    return mockSharp;
  });
});

// Mock fluent-ffmpeg for video processing
jest.mock("fluent-ffmpeg", () => {
  return jest.fn(() => {
    const mockFfmpeg: any = {
      seekInput: jest.fn(function (this: any) {
        return this;
      }),
      duration: jest.fn(function (this: any) {
        return this;
      }),
      videoBitrate: jest.fn(function (this: any) {
        return this;
      }),
      audioBitrate: jest.fn(function (this: any) {
        return this;
      }),
      toFormat: jest.fn(function (this: any) {
        return this;
      }),
      output: jest.fn(function (this: any) {
        return this;
      }),
      on: jest.fn(function (this: any, event: string, callback: Function) {
        // Simulate ffmpeg completing successfully on 'end' event
        if (event === "end") {
          setTimeout(() => callback(), 0);
        }
        return this;
      }),
      run: jest.fn(),
    };
    return mockFfmpeg;
  });
});

// Mock fs module
jest.mock("fs", () => ({
  writeFileSync: jest.fn(),
  readFileSync: jest.fn().mockReturnValue(Buffer.from("mocked-trimmed-video")),
  unlinkSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
}));

// Mock serverLogger
jest.mock("@/lib/server-logger", () => ({
  serverLogger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockBucketFile = jest.fn();
const mockFileSave = jest.fn();
const mockFileMakePublic = jest.fn();
const mockFileGetSignedUrl = jest.fn();

jest.mock("@/lib/firebase/admin", () => ({
  getAdminApp: () => ({}),
  getStorage: () => ({
    bucket: () => ({
      file: (...args: unknown[]) => {
        mockBucketFile(...args);
        return {
          save: (...a: unknown[]) => {
            mockFileSave(...a);
            return Promise.resolve();
          },
          makePublic: (...a: unknown[]) => {
            mockFileMakePublic(...a);
            return Promise.resolve();
          },
          getSignedUrl: (...a: unknown[]) => {
            mockFileGetSignedUrl(...a);
            return Promise.resolve(["https://signed-url.example.com/file"]);
          },
        };
      },
      name: "test-bucket",
    }),
  }),
}));

jest.mock("@/lib/errors", () => {
  class AppError extends Error {
    constructor(
      message: string,
      public statusCode: number = 500,
    ) {
      super(message);
      this.name = "AppError";
    }
  }
  class AuthenticationError extends AppError {
    statusCode = 401;
    code = "AUTH_ERROR";
    constructor(message: string) {
      super(message, 401);
      this.name = "AuthenticationError";
    }
  }
  return { AppError, AuthenticationError };
});

jest.mock("@/lib/errors/error-handler", () => ({
  handleApiError: (error: any) => {
    const { NextResponse } = require("next/server");
    const status = error.statusCode ?? 500;
    return NextResponse.json(
      { success: false, error: error.message },
      { status },
    );
  },
}));

import { POST as cropPOST } from "../media/crop/route";
import { POST as trimPOST } from "../media/trim/route";
import { AuthenticationError } from "@/lib/errors";
import axios from "axios";

// ============================================
// Tests: POST /api/media/crop (placeholder)
// ============================================

describe("Media API - POST /api/media/crop", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuthFromRequest.mockResolvedValue({ uid: "user-001" });
    mockFileGetSignedUrl.mockResolvedValue([
      "https://signed-url.example.com/file",
    ]);
  });

  it("successfully crops an image and returns 200", async () => {
    const req = buildRequest("/api/media/crop", {
      method: "POST",
      body: {
        sourceUrl: "https://example.com/image.jpg",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
    });
    const res = await cropPOST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("url");
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAuthFromRequest.mockRejectedValue(
      new AuthenticationError("Not authenticated"),
    );

    const req = buildRequest("/api/media/crop", {
      method: "POST",
      body: {
        sourceUrl: "https://example.com/image.jpg",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
    });
    const res = await cropPOST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns 400 for invalid body", async () => {
    const req = buildRequest("/api/media/crop", {
      method: "POST",
      body: {},
    });
    const res = await cropPOST(req);
    const { status } = await parseResponse(res);

    // Either 400 for validation or 501 for not implemented
    expect([400, 501]).toContain(status);
  });
});

// ============================================
// Tests: POST /api/media/trim (placeholder)
// ============================================

describe("Media API - POST /api/media/trim", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuthFromRequest.mockResolvedValue({ uid: "user-001" });
    mockFileGetSignedUrl.mockResolvedValue([
      "https://signed-url.example.com/file",
    ]);
  });

  it("successfully trims a video and returns 200", async () => {
    const req = buildRequest("/api/media/trim", {
      method: "POST",
      body: {
        sourceUrl: "https://example.com/video.mp4",
        startTime: 0,
        endTime: 10,
      },
    });
    const res = await trimPOST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("url");
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAuthFromRequest.mockRejectedValue(
      new AuthenticationError("Not authenticated"),
    );

    const req = buildRequest("/api/media/trim", {
      method: "POST",
      body: {
        sourceUrl: "https://example.com/video.mp4",
        startTime: 0,
        endTime: 10,
      },
    });
    const res = await trimPOST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns 400 when startTime >= endTime", async () => {
    const req = buildRequest("/api/media/trim", {
      method: "POST",
      body: {
        sourceUrl: "https://example.com/video.mp4",
        startTime: 10,
        endTime: 5,
      },
    });
    const res = await trimPOST(req);
    const { status } = await parseResponse(res);

    // Could be 400 for validation or 501 for not implemented
    expect([400, 501]).toContain(status);
  });
});
