/**
 * FAQ Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { faqService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPost = jest.mocked(apiClient.post);
const mockPatch = jest.mocked(apiClient.patch);
const mockDelete = jest.mocked(apiClient.delete);

describe("faqService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("list() calls GET faqs without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await faqService.list();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.FAQS.LIST);
  });

  it("list() calls GET faqs with params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await faqService.list("filters=published==true");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.FAQS.LIST}?filters=published==true`,
    );
  });

  it("listPublic() calls GET faqs with published filter and default limit", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await faqService.listPublic();
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.FAQS.LIST}?filters=published==true&sorts=order&pageSize=8`,
    );
  });

  it("listPublic() includes category in filter when provided", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await faqService.listPublic("shipping", 5);
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.FAQS.LIST}?filters=published==true,category==shipping&sorts=order&pageSize=5`,
    );
  });

  it("getById() calls GET with faq URL", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await faqService.getById("faq_1");
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.FAQS.GET_BY_ID("faq_1"));
  });

  it("create() calls POST with faq data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = { question: "Q?", answer: "A." };
    await faqService.create(data);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.FAQS.CREATE, data);
  });

  it("update() calls PATCH with id and data", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    await faqService.update("faq_1", { answer: "Updated" });
    expect(mockPatch).toHaveBeenCalledWith(API_ENDPOINTS.FAQS.UPDATE("faq_1"), {
      answer: "Updated",
    });
  });

  it("delete() calls DELETE with faq URL", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await faqService.delete("faq_1");
    expect(mockDelete).toHaveBeenCalledWith(API_ENDPOINTS.FAQS.DELETE("faq_1"));
  });

  it("vote() calls POST vote endpoint with helpful vote", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await faqService.vote("faq_1", { vote: "helpful" });
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.FAQS.VOTE("faq_1"), {
      vote: "helpful",
    });
  });

  it("vote() calls POST vote endpoint with not-helpful vote", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await faqService.vote("faq_1", { vote: "not-helpful" });
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.FAQS.VOTE("faq_1"), {
      vote: "not-helpful",
    });
  });
});
