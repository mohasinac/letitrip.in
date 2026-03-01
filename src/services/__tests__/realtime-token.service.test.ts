/**
 * Realtime Token Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { realtimeTokenService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockPost = jest.mocked(apiClient.post);

describe("realtimeTokenService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("getToken() calls POST to REALTIME.TOKEN with empty body", async () => {
    const mockResponse = {
      customToken: "tok_abc",
      expiresAt: Date.now() + 3_600_000,
    };
    mockPost.mockResolvedValueOnce(mockResponse as never);

    const result = await realtimeTokenService.getToken();

    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.REALTIME.TOKEN, {});
    expect(result).toEqual(mockResponse);
  });
});
