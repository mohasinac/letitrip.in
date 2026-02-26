/**
 * Cart Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { cartService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPost = jest.mocked(apiClient.post);
const mockPatch = jest.mocked(apiClient.patch);
const mockDelete = jest.mocked(apiClient.delete);

describe("cartService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("get() calls GET cart endpoint", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await cartService.get();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.CART.GET);
  });

  it("addItem() calls POST with item data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = { productId: "prod_1", quantity: 2 };
    await cartService.addItem(data);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.CART.ADD_ITEM, data);
  });

  it("updateItem() calls PATCH with itemId and quantity data", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    await cartService.updateItem("item_1", { quantity: 3 });
    expect(mockPatch).toHaveBeenCalledWith(
      API_ENDPOINTS.CART.UPDATE_ITEM("item_1"),
      { quantity: 3 },
    );
  });

  it("removeItem() calls DELETE with item URL", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await cartService.removeItem("item_1");
    expect(mockDelete).toHaveBeenCalledWith(
      API_ENDPOINTS.CART.REMOVE_ITEM("item_1"),
    );
  });

  it("clear() calls DELETE cart clear endpoint", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await cartService.clear();
    expect(mockDelete).toHaveBeenCalledWith(API_ENDPOINTS.CART.CLEAR);
  });
});
