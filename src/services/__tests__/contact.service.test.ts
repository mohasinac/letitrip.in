/**
 * Contact Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { contactService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockPost = jest.mocked(apiClient.post);

describe("contactService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("send() calls POST contact endpoint with message data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = {
      name: "John",
      email: "john@example.com",
      subject: "Help",
      message: "I need help",
    };
    await contactService.send(data);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.CONTACT.SEND, data);
  });
});
