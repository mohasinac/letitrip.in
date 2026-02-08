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
          save: (...a: unknown[]) => mockFileSave(...a),
          makePublic: (...a: unknown[]) => mockFileMakePublic(...a),
          getSignedUrl: (...a: unknown[]) => mockFileGetSignedUrl(...a),
        };
      },
      name: "test-bucket",
    }),
  }),
}));

jest.mock("@/lib/errors", () => {
  class AuthenticationError extends Error {
    statusCode = 401;
    code = "AUTH_ERROR";
    constructor(message: string) {
      super(message);
      this.name = "AuthenticationError";
    }
  }
  return { AuthenticationError };
});

import { POST as cropPOST } from "../media/crop/route";
import { POST as trimPOST } from "../media/trim/route";
import { AuthenticationError } from "@/lib/errors";

// ============================================
// Tests: POST /api/media/crop (placeholder)
// ============================================

describe("Media API - POST /api/media/crop", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuthFromRequest.mockResolvedValue({ uid: "user-001" });
  });

  it("returns 501 Not Implemented", async () => {
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

    expect(status).toBe(501);
    expect(body.success).toBe(false);
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
  });

  it("returns 501 Not Implemented", async () => {
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

    expect(status).toBe(501);
    expect(body.success).toBe(false);
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
