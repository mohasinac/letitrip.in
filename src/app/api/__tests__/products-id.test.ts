/**
 * @jest-environment node
 */

/**
 * Product Detail API Integration Tests — GET, PATCH, DELETE /api/products/[id]
 *
 * Focuses on the status transition validation gate added in Phase 7.5.
 */

import {
  buildRequest,
  parseResponse,
  mockSellerUser,
  mockAdminUser,
} from "./helpers";

// ============================================
// Mocks
// ============================================

const mockFindById = jest.fn();
const mockUpdate = jest.fn();

jest.mock("@/repositories", () => ({
  productRepository: {
    findById: (...args: unknown[]) => mockFindById(...args),
    findByIdOrSlug: (...args: unknown[]) => mockFindById(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}));

const mockRequireAuthFromRequest = jest.fn();

jest.mock("@/lib/security/authorization", () => ({
  requireAuthFromRequest: (...args: unknown[]) =>
    mockRequireAuthFromRequest(...args),
  getUserFromRequest: jest.fn(),
}));

jest.mock("@/lib/validation/schemas", () => ({
  validateRequestBody: (_schema: unknown, body: any) => {
    // Pass-through: valid if body has at least one key
    if (body && Object.keys(body).length > 0) {
      return { success: true, data: body };
    }
    return {
      success: false,
      errors: { format: () => [{ path: ["body"], message: "Empty body" }] },
    };
  },
  formatZodErrors: (errors: any) => errors?.format?.() || [],
  productUpdateSchema: {},
}));

jest.mock("@/lib/errors", () => ({
  AppError: class AppError extends Error {
    constructor(
      message: string,
      public statusCode: number = 500,
    ) {
      super(message);
      this.name = "AppError";
    }
  },
  AuthenticationError: class AuthenticationError extends Error {
    statusCode = 401;
    constructor(message: string) {
      super(message);
      this.name = "AuthenticationError";
    }
  },
  AuthorizationError: class AuthorizationError extends Error {
    statusCode = 403;
    constructor(message: string) {
      super(message);
      this.name = "AuthorizationError";
    }
  },
  NotFoundError: class NotFoundError extends Error {
    statusCode = 404;
    constructor(message: string) {
      super(message);
      this.name = "NotFoundError";
    }
  },
}));

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

// Import AFTER mocks — use real PRODUCT_STATUS_TRANSITIONS constant
import { GET, PATCH, DELETE } from "../products/[id]/route";

// ============================================
// Shared mock product factory
// ============================================

function makeProduct(status: string, sellerId = "seller-uid-001") {
  return {
    id: "prod-1",
    title: "Test Product",
    sellerId,
    status,
    price: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

const mockParams = { params: Promise.resolve({ id: "prod-1" }) };

// ============================================
// GET /api/products/[id]
// ============================================

describe("Product Detail API - GET /api/products/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindById.mockResolvedValue(makeProduct("published"));
  });

  it("returns the product when found", async () => {
    const req = buildRequest("/api/products/prod-1");
    const res = await GET(req, mockParams);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe("prod-1");
  });

  it("returns 404 when product not found", async () => {
    mockFindById.mockResolvedValue(null);

    const req = buildRequest("/api/products/prod-1");
    const res = await GET(req, mockParams);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(404);
    expect(body.success).toBe(false);
  });
});

// ============================================
// PATCH /api/products/[id] — general
// ============================================

describe("Product Detail API - PATCH /api/products/[id]", () => {
  const seller = mockSellerUser();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuthFromRequest.mockResolvedValue(seller);
    mockFindById.mockResolvedValue(makeProduct("draft", seller.uid));
    mockUpdate.mockImplementation((_id: string, data: any) =>
      Promise.resolve({ id: "prod-1", ...data }),
    );
  });

  it("requires authentication", async () => {
    const req = buildRequest("/api/products/prod-1", {
      method: "PATCH",
      body: { title: "Updated" },
    });
    await PATCH(req, mockParams);
    expect(mockRequireAuthFromRequest).toHaveBeenCalled();
  });

  it("returns 401 when not authenticated", async () => {
    const { AuthenticationError } = require("@/lib/errors");
    mockRequireAuthFromRequest.mockRejectedValue(
      new AuthenticationError("Not authenticated"),
    );

    const req = buildRequest("/api/products/prod-1", {
      method: "PATCH",
      body: { title: "Updated" },
    });
    const res = await PATCH(req, mockParams);
    expect(res.status).toBe(401);
  });

  it("returns 404 when product not found", async () => {
    mockFindById.mockResolvedValue(null);

    const req = buildRequest("/api/products/prod-1", {
      method: "PATCH",
      body: { title: "Updated" },
    });
    const res = await PATCH(req, mockParams);
    const { status } = await parseResponse(res);
    expect(status).toBe(404);
  });

  it("returns 403 when non-owner tries to update", async () => {
    const { AuthorizationError } = require("@/lib/errors");
    // Product owned by different seller
    mockFindById.mockResolvedValue(makeProduct("draft", "other-seller-uid"));

    const req = buildRequest("/api/products/prod-1", {
      method: "PATCH",
      body: { title: "Updated" },
    });
    const res = await PATCH(req, mockParams);
    const { status } = await parseResponse(res);
    expect(status).toBe(403);
  });

  it("updates non-status fields without transition check", async () => {
    const req = buildRequest("/api/products/prod-1", {
      method: "PATCH",
      body: { title: "New Title" },
    });
    const res = await PATCH(req, mockParams);
    const { status } = await parseResponse(res);

    expect(status).toBe(200);
    expect(mockUpdate).toHaveBeenCalled();
  });
});

// ============================================
// PATCH — Status Transition Validation (Phase 7.5)
// ============================================

describe("Product Detail API - PATCH status transitions", () => {
  const seller = mockSellerUser();
  const admin = mockAdminUser();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdate.mockImplementation((_id: string, data: any) =>
      Promise.resolve({ id: "prod-1", ...data }),
    );
  });

  // ── Valid seller transitions ──────────────────────────────────────

  it.each([
    ["draft", "published"],
    ["draft", "discontinued"],
    ["published", "draft"],
    ["published", "out_of_stock"],
    ["published", "discontinued"],
    ["out_of_stock", "published"],
    ["out_of_stock", "draft"],
    ["out_of_stock", "discontinued"],
    ["sold", "discontinued"],
    ["discontinued", "draft"],
  ])(
    "allows seller to transition from %s to %s",
    async (fromStatus, toStatus) => {
      mockRequireAuthFromRequest.mockResolvedValue(seller);
      mockFindById.mockResolvedValue(makeProduct(fromStatus, seller.uid));

      const req = buildRequest("/api/products/prod-1", {
        method: "PATCH",
        body: { status: toStatus },
      });
      const res = await PATCH(req, mockParams);
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith(
        "prod-1",
        expect.objectContaining({ status: toStatus }),
      );
    },
  );

  // ── Invalid seller transitions ───────────────────────────────────

  it.each([
    ["sold", "draft"],
    ["sold", "published"],
    ["sold", "out_of_stock"],
    ["discontinued", "published"],
    ["discontinued", "out_of_stock"],
    ["discontinued", "sold"],
  ])(
    "blocks seller from transitioning %s → %s (422)",
    async (fromStatus, toStatus) => {
      mockRequireAuthFromRequest.mockResolvedValue(seller);
      mockFindById.mockResolvedValue(makeProduct(fromStatus, seller.uid));

      const req = buildRequest("/api/products/prod-1", {
        method: "PATCH",
        body: { status: toStatus },
      });
      const res = await PATCH(req, mockParams);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(422);
      expect(body.success).toBe(false);
      expect(mockUpdate).not.toHaveBeenCalled();
    },
  );

  // ── Admin bypass ─────────────────────────────────────────────────

  it("allows admin to make any status transition (bypass)", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(admin);
    // sold → draft is normally invalid for sellers, but admin can do it
    mockFindById.mockResolvedValue(makeProduct("sold", "some-seller-uid"));

    const req = buildRequest("/api/products/prod-1", {
      method: "PATCH",
      body: { status: "draft" },
    });
    const res = await PATCH(req, mockParams);
    const { status } = await parseResponse(res);

    expect(status).toBe(200);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("allows moderator to make any status transition (bypass)", async () => {
    mockRequireAuthFromRequest.mockResolvedValue({
      ...seller,
      role: "moderator",
    });
    mockFindById.mockResolvedValue(makeProduct("sold", seller.uid));

    const req = buildRequest("/api/products/prod-1", {
      method: "PATCH",
      body: { status: "published" },
    });
    const res = await PATCH(req, mockParams);
    const { status } = await parseResponse(res);

    expect(status).toBe(200);
  });

  // ── No-op same-status update ─────────────────────────────────────

  it("allows updating to current status (no-op, not a transition)", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(seller);
    mockFindById.mockResolvedValue(makeProduct("published", seller.uid));

    const req = buildRequest("/api/products/prod-1", {
      method: "PATCH",
      body: { status: "published" }, // same status — should pass
    });
    const res = await PATCH(req, mockParams);
    const { status } = await parseResponse(res);

    expect(status).toBe(200);
  });
});

// ============================================
// DELETE /api/products/[id]
// ============================================

describe("Product Detail API - DELETE /api/products/[id]", () => {
  const seller = mockSellerUser();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuthFromRequest.mockResolvedValue(seller);
    mockFindById.mockResolvedValue(makeProduct("published", seller.uid));
    mockUpdate.mockResolvedValue({ id: "prod-1", status: "discontinued" });
  });

  it("soft-deletes the product (sets status to discontinued)", async () => {
    const req = buildRequest("/api/products/prod-1", { method: "DELETE" });
    const res = await DELETE(req, mockParams);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      "prod-1",
      expect.objectContaining({ status: "discontinued" }),
    );
  });

  it("returns 403 when non-owner tries to delete", async () => {
    mockFindById.mockResolvedValue(makeProduct("published", "other-seller"));

    const req = buildRequest("/api/products/prod-1", { method: "DELETE" });
    const res = await DELETE(req, mockParams);
    const { status } = await parseResponse(res);

    expect(status).toBe(403);
  });

  it("returns 404 when product not found", async () => {
    mockFindById.mockResolvedValue(null);

    const req = buildRequest("/api/products/prod-1", { method: "DELETE" });
    const res = await DELETE(req, mockParams);
    const { status } = await parseResponse(res);

    expect(status).toBe(404);
  });
});
