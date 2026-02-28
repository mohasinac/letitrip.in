const mockList = jest.fn();
const mockCreate = jest.fn();

jest.mock("@/repositories", () => ({
  productRepository: {
    list: (...args: any[]) => mockList(...args),
    create: (...args: any[]) => mockCreate(...args),
  },
}));
jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));
jest.mock("@/lib/api-response", () => ({
  successResponse: jest.fn((data) => ({ status: 200, body: { data } })),
  errorResponse: jest.fn((msg, status) => ({ status, body: { message: msg } })),
}));
jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    VALIDATION: { FAILED: "Validation failed" },
  },
  SUCCESS_MESSAGES: {
    PRODUCT: { CREATED: "Product created" },
  },
}));
jest.mock("@/lib/validation/schemas", () => ({
  validateRequestBody: jest.fn((schema: any, body: any) => ({
    success: true,
    data: body,
    errors: [],
  })),
  formatZodErrors: jest.fn(() => []),
  productCreateSchema: {},
}));

// Mock createApiHandler to pass-through the handler with a fake user context
jest.mock("@/lib/api/api-handler", () => ({
  createApiHandler: (config: { handler: Function }) => async (request: any) =>
    config.handler({
      request,
      user: { uid: "seller-123", email: "s@e.com", displayName: "Seller" },
    }),
}));

jest.mock("@/lib/api/request-helpers", () => ({
  getSearchParams: (req: any) => req.nextUrl.searchParams,
  getNumberParam: (_sp: any, _key: string, def: number) => def,
  getStringParam: (_sp: any, key: string) =>
    key === "sorts" ? "-createdAt" : undefined,
}));

import { GET, POST } from "../route";

function makeRequest(method: string, body?: object, query?: string) {
  const url = `http://localhost/api/seller/products${query ? `?${query}` : ""}`;
  const searchParams = new URLSearchParams(query || "");
  return {
    method,
    nextUrl: { searchParams },
    json: async () => body ?? {},
  } as any;
}

describe("GET /api/seller/products", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls productRepository.list with seller filter and returns success", async () => {
    const { successResponse } = require("@/lib/api-response");
    mockList.mockResolvedValueOnce({
      items: [{ id: "p-1", title: "My Product" }],
      total: 1,
      page: 1,
      pageSize: 25,
      totalPages: 1,
      hasMore: false,
    });
    const req = makeRequest("GET");
    await GET(req);
    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.stringContaining("sellerId==seller-123"),
      }),
    );
    expect(successResponse).toHaveBeenCalledWith(
      expect.objectContaining({ products: expect.any(Array) }),
    );
  });
});

describe("POST /api/seller/products", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates product with seller uid and status=draft", async () => {
    const { successResponse } = require("@/lib/api-response");
    mockCreate.mockResolvedValueOnce({ id: "new-prod", title: "New" });
    const body = {
      title: "Trek Pack",
      description: "Durable pack",
      price: 1999,
      categoryId: "cat-1",
    };
    const req = makeRequest("POST", body);
    await POST(req);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        sellerId: "seller-123",
        status: "draft",
      }),
    );
    expect(successResponse).toHaveBeenCalled();
  });

  it("returns 400 when validation fails", async () => {
    const { errorResponse } = require("@/lib/api-response");
    const { validateRequestBody } = require("@/lib/validation/schemas");
    (validateRequestBody as jest.Mock).mockReturnValueOnce({
      success: false,
      errors: [{ message: "Title required" }],
      data: null,
    });
    const req = makeRequest("POST", {});
    await POST(req);
    expect(errorResponse).toHaveBeenCalledWith(
      "Validation failed",
      400,
      expect.any(Array),
    );
  });
});
