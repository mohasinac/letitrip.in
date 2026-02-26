/**
 * Coupon Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { couponService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPost = jest.mocked(apiClient.post);
const mockPatch = jest.mocked(apiClient.patch);
const mockDelete = jest.mocked(apiClient.delete);

describe("couponService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("list() calls GET admin coupons without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await couponService.list();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.COUPONS);
  });

  it("list() calls GET admin coupons with sieve query", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await couponService.list("?filters=type==percentage");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.ADMIN.COUPONS}?filters=type==percentage`,
    );
  });

  it("create() calls POST with coupon data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = { code: "SAVE10", type: "percentage", discount: 10 };
    await couponService.create(data);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.COUPONS, data);
  });

  it("update() calls PATCH with id and data", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    await couponService.update("coup_1", { discount: 20 });
    expect(mockPatch).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.COUPON_BY_ID("coup_1"),
      { discount: 20 },
    );
  });

  it("delete() calls DELETE with coupon URL", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await couponService.delete("coup_1");
    expect(mockDelete).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.COUPON_BY_ID("coup_1"),
    );
  });

  it("validate() calls POST validate endpoint with code and orderTotal", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await couponService.validate({ code: "SAVE10", orderTotal: 1000 });
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.COUPONS.VALIDATE, {
      code: "SAVE10",
      orderTotal: 1000,
    });
  });

  it("validate() calls POST validate endpoint with code only", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await couponService.validate({ code: "SAVE10" });
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.COUPONS.VALIDATE, {
      code: "SAVE10",
    });
  });
});
