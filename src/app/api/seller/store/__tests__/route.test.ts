/**
 * GET /api/seller/store + PATCH /api/seller/store tests
 */

const mockFindById = jest.fn();
const mockUpdate = jest.fn();

jest.mock("@/repositories", () => ({
  userRepository: {
    findById: (...args: any[]) => mockFindById(...args),
    update: (...args: any[]) => mockUpdate(...args),
  },
}));

jest.mock("@/lib/firebase/auth-server", () => ({
  verifySessionCookie: jest.fn(),
}));

jest.mock("@/lib/api/request-helpers", () => ({
  getRequiredSessionCookie: jest.fn().mockReturnValue("session-token"),
}));

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

jest.mock("@/lib/api-response", () => ({
  successResponse: jest.fn((data, msg) => ({
    status: 200,
    body: { data, message: msg },
  })),
  ApiErrors: {
    validationError: jest.fn((issues) => ({
      status: 400,
      body: { issues },
    })),
  },
}));

jest.mock("@/lib/errors/error-handler", () => ({
  handleApiError: jest.fn((err) => ({
    status: err.statusCode ?? 500,
    body: { message: err.message },
  })),
}));

jest.mock("@/lib/errors", () => ({
  AuthenticationError: class extends Error {
    statusCode = 401;
    constructor(msg: string) {
      super(msg);
    }
  },
  AuthorizationError: class extends Error {
    statusCode = 403;
    constructor(msg: string) {
      super(msg);
    }
  },
}));

jest.mock("@/utils", () => ({
  slugify: jest.fn((s: string) => s.toLowerCase().replace(/\s+/g, "-")),
}));

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    AUTH: {
      SESSION_EXPIRED: "Session expired",
      ADMIN_ACCESS_REQUIRED: "Admin required",
      UNAUTHORIZED: "Unauthorized",
    },
    DATABASE: { NOT_FOUND: "Not found" },
    VALIDATION: { FAILED: "Validation failed" },
  },
  SUCCESS_MESSAGES: {
    USER: { STORE_UPDATED: "Store settings saved successfully" },
  },
}));

import { GET, PATCH } from "../route";
import { verifySessionCookie } from "@/lib/firebase/auth-server";

const mockVerify = jest.mocked(verifySessionCookie);

const SELLER_USER = {
  uid: "seller-1",
  role: "seller",
  displayName: "Test Seller",
  storeSlug: null,
  publicProfile: null,
};

function makeRequest(method: string, body?: object) {
  return {
    method,
    cookies: { get: jest.fn().mockReturnValue({ value: "session-token" }) },
    json: async () => body ?? {},
  } as any;
}

describe("GET /api/seller/store", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerify.mockResolvedValue({ uid: "seller-1" } as any);
    mockFindById.mockResolvedValue(SELLER_USER);
  });

  it("returns store profile for authenticated seller", async () => {
    const { successResponse } = require("@/lib/api-response");
    await GET(makeRequest("GET"));
    expect(successResponse).toHaveBeenCalledWith(
      expect.objectContaining({ uid: "seller-1" }),
    );
  });

  it("rejects when session is invalid", async () => {
    mockVerify.mockResolvedValue(null as any);
    const { handleApiError } = require("@/lib/errors/error-handler");
    await GET(makeRequest("GET"));
    expect(handleApiError).toHaveBeenCalled();
  });

  it("rejects when user is not seller or admin", async () => {
    mockFindById.mockResolvedValue({ ...SELLER_USER, role: "user" });
    const { handleApiError } = require("@/lib/errors/error-handler");
    await GET(makeRequest("GET"));
    expect(handleApiError).toHaveBeenCalled();
  });
});

describe("PATCH /api/seller/store", () => {
  const UPDATED_USER = {
    ...SELLER_USER,
    storeSlug: "store-my-shop-test-seller",
    publicProfile: { storeName: "My Shop", isPublic: true },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerify.mockResolvedValue({ uid: "seller-1" } as any);
    mockFindById.mockResolvedValue(SELLER_USER);
    mockUpdate.mockResolvedValue(UPDATED_USER);
  });

  it("updates store and returns updated profile", async () => {
    const { successResponse } = require("@/lib/api-response");
    await PATCH(makeRequest("PATCH", { storeName: "My Shop" }));
    expect(mockUpdate).toHaveBeenCalledWith(
      "seller-1",
      expect.objectContaining({ publicProfile: expect.any(Object) }),
    );
    expect(successResponse).toHaveBeenCalled();
  });

  it("auto-generates storeSlug when storeName provided and no slug exists", async () => {
    await PATCH(makeRequest("PATCH", { storeName: "My Shop" }));
    expect(mockUpdate).toHaveBeenCalledWith(
      "seller-1",
      expect.objectContaining({ storeSlug: expect.stringContaining("store-") }),
    );
  });

  it("does not override existing storeSlug", async () => {
    mockFindById.mockResolvedValue({
      ...SELLER_USER,
      storeSlug: "existing-slug",
    });
    await PATCH(makeRequest("PATCH", { storeName: "New Name" }));
    const callArg = mockUpdate.mock.calls[0]?.[1];
    // Existing slug is preserved — route should not generate a new slug
    expect(callArg?.storeSlug).toBe("existing-slug");
  });

  it("rejects invalid payload with validation error", async () => {
    const { ApiErrors } = require("@/lib/api-response");
    // storeName too short (1 char, min is 2)
    await PATCH(makeRequest("PATCH", { storeName: "A" }));
    expect(ApiErrors.validationError).toHaveBeenCalled();
  });

  it("rejects non-seller user", async () => {
    mockFindById.mockResolvedValue({ ...SELLER_USER, role: "user" });
    const { handleApiError } = require("@/lib/errors/error-handler");
    await PATCH(makeRequest("PATCH", { storeName: "My Shop" }));
    expect(handleApiError).toHaveBeenCalled();
  });
});
