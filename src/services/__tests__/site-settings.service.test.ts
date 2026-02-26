/**
 * Site Settings Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { siteSettingsService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPatch = jest.mocked(apiClient.patch);

describe("siteSettingsService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("get() calls GET site settings endpoint", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await siteSettingsService.get();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.SITE_SETTINGS.GET);
  });

  it("update() calls PATCH with updated settings data", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    const data = { siteName: "LetItRip", contactEmail: "admin@example.com" };
    await siteSettingsService.update(data);
    expect(mockPatch).toHaveBeenCalledWith(
      API_ENDPOINTS.SITE_SETTINGS.UPDATE,
      data,
    );
  });
});
