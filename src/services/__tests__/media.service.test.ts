/**
 * Media Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { mediaService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockUpload = jest.mocked(apiClient.upload);
const mockPost = jest.mocked(apiClient.post);

describe("mediaService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("upload() calls apiClient.upload with MEDIA.UPLOAD endpoint", async () => {
    mockUpload.mockResolvedValueOnce({
      url: "https://cdn.example.com/img.jpg",
    } as never);
    const formData = new FormData();
    await mediaService.upload(formData);
    expect(mockUpload).toHaveBeenCalledWith(
      API_ENDPOINTS.MEDIA.UPLOAD,
      formData,
    );
  });

  it("crop() calls POST with crop data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = {
      url: "https://cdn.example.com/img.jpg",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    };
    await mediaService.crop(data);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.MEDIA.CROP, data);
  });

  it("trim() calls POST with trim data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = {
      url: "https://cdn.example.com/vid.mp4",
      startTime: 0,
      endTime: 10,
    };
    await mediaService.trim(data);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.MEDIA.TRIM, data);
  });
});
