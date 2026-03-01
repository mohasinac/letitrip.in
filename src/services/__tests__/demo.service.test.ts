/**
 * Demo Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { demoService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockPost = jest.mocked(apiClient.post);

describe("demoService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("seed() calls POST to the demo seed endpoint with the payload", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const payload = { scenario: "standard" };
    await demoService.seed(payload);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.DEMO.SEED, payload);
  });

  it("seed() passes undefined payload when called without args", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await demoService.seed(undefined);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.DEMO.SEED, undefined);
  });
});
