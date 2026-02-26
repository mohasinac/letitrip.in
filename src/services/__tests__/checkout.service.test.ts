/**
 * Checkout Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { checkoutService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockPost = jest.mocked(apiClient.post);

describe("checkoutService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("placeOrder() calls POST checkout/place-order with data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = { addressId: "addr_1", items: [] };
    await checkoutService.placeOrder(data);
    expect(mockPost).toHaveBeenCalledWith(
      API_ENDPOINTS.CHECKOUT.PLACE_ORDER,
      data,
    );
  });

  it("createPaymentOrder() calls POST payment/create-order with data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = { amount: 500, currency: "INR" };
    await checkoutService.createPaymentOrder(data);
    expect(mockPost).toHaveBeenCalledWith(
      API_ENDPOINTS.PAYMENT.CREATE_ORDER,
      data,
    );
  });

  it("verifyPayment() calls POST payment/verify with data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = { razorpay_payment_id: "pay_1", razorpay_signature: "sig" };
    await checkoutService.verifyPayment(data);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.PAYMENT.VERIFY, data);
  });
});
