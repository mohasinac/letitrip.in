/**
 * Session Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { sessionService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPost = jest.mocked(apiClient.post);
const mockDelete = jest.mocked(apiClient.delete);

describe("sessionService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("create() calls POST create-session with idToken", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await sessionService.create({ idToken: "token_abc" });
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.CREATE_SESSION, {
      idToken: "token_abc",
    });
  });

  it("destroy() calls DELETE create-session endpoint", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await sessionService.destroy();
    expect(mockDelete).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.CREATE_SESSION);
  });

  it("getProfile() calls GET user profile endpoint", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await sessionService.getProfile();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.USER.PROFILE);
  });

  it("recordActivity() calls POST session activity with empty object", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await sessionService.recordActivity();
    expect(mockPost).toHaveBeenCalledWith(
      API_ENDPOINTS.AUTH.SESSION_ACTIVITY,
      {},
    );
  });

  it("recordActivity() calls POST with provided data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await sessionService.recordActivity({ page: "/home" });
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.SESSION_ACTIVITY, {
      page: "/home",
    });
  });

  it("validate() calls POST session validate endpoint", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await sessionService.validate();
    expect(mockPost).toHaveBeenCalledWith(
      API_ENDPOINTS.AUTH.SESSION_VALIDATE,
      {},
    );
  });

  it("listMySessions() calls GET user sessions endpoint", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await sessionService.listMySessions();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.USER.SESSIONS);
  });

  it("revokeSession() calls DELETE with session ID", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await sessionService.revokeSession("sess_1");
    expect(mockDelete).toHaveBeenCalledWith(
      API_ENDPOINTS.USER.REVOKE_SESSION("sess_1"),
    );
  });
});
