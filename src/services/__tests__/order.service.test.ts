/**
 * Order Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { orderService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPost = jest.mocked(apiClient.post);

describe("orderService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("list() calls GET orders without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await orderService.list();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.ORDERS.LIST);
  });

  it("list() appends params when provided", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await orderService.list("filters=status==delivered&page=1");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.ORDERS.LIST}?filters=status==delivered&page=1`,
    );
  });

  it("getById() calls GET with order ID", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await orderService.getById("order_1");
    expect(mockGet).toHaveBeenCalledWith(
      API_ENDPOINTS.ORDERS.GET_BY_ID("order_1"),
    );
  });

  it("track() calls GET with order tracking URL", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await orderService.track("order_1");
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.ORDERS.TRACK("order_1"));
  });

  it("cancel() calls POST with order cancel URL", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await orderService.cancel("order_1");
    expect(mockPost).toHaveBeenCalledWith(
      API_ENDPOINTS.ORDERS.CANCEL("order_1"),
      {},
    );
  });
});
