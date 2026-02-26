/**
 * Notification Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { notificationService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPatch = jest.mocked(apiClient.patch);
const mockDelete = jest.mocked(apiClient.delete);

describe("notificationService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("list() calls GET without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await notificationService.list();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFICATIONS.LIST);
  });

  it("list() appends params when provided", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await notificationService.list("page=2&pageSize=20");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.NOTIFICATIONS.LIST}?page=2&pageSize=20`,
    );
  });

  it("getUnreadCount() calls GET unread count endpoint", async () => {
    mockGet.mockResolvedValueOnce({ count: 3 } as never);
    await notificationService.getUnreadCount();
    expect(mockGet).toHaveBeenCalledWith(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT,
    );
  });

  it("markRead() calls PATCH with notification ID", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    await notificationService.markRead("notif_1");
    expect(mockPatch).toHaveBeenCalledWith(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ("notif_1"),
      {},
    );
  });

  it("markAllRead() calls PATCH read-all endpoint", async () => {
    mockPatch.mockResolvedValueOnce({} as never);
    await notificationService.markAllRead();
    expect(mockPatch).toHaveBeenCalledWith(
      API_ENDPOINTS.NOTIFICATIONS.READ_ALL,
      {},
    );
  });

  it("delete() calls DELETE with notification ID", async () => {
    mockDelete.mockResolvedValueOnce({} as never);
    await notificationService.delete("notif_1");
    expect(mockDelete).toHaveBeenCalledWith(
      API_ENDPOINTS.NOTIFICATIONS.DELETE("notif_1"),
    );
  });
});
