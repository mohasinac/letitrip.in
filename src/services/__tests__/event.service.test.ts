/**
 * Public Event Service Unit Tests
 * Tests for publicEventService (Tier 1 public event calls).
 */
import { apiClient } from "@/lib/api-client";
import { publicEventService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockGet = jest.mocked(apiClient.get);
const mockPost = jest.mocked(apiClient.post);

describe("publicEventService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("list() calls GET events without params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await publicEventService.list();
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.EVENTS.LIST);
  });

  it("list() calls GET events with params", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await publicEventService.list("filters=status==active");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.EVENTS.LIST}?filters=status==active`,
    );
  });

  it("getById() calls GET with event detail URL", async () => {
    mockGet.mockResolvedValueOnce({} as never);
    await publicEventService.getById("evt_1");
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.EVENTS.DETAIL("evt_1"));
  });

  it("enter() calls POST with event entry URL and data", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = { type: "poll", selectedOption: "option_a" };
    await publicEventService.enter("evt_1", data);
    expect(mockPost).toHaveBeenCalledWith(
      API_ENDPOINTS.EVENTS.ENTER("evt_1"),
      data,
    );
  });

  it("getLeaderboard() calls GET leaderboard URL", async () => {
    mockGet.mockResolvedValueOnce([] as never);
    await publicEventService.getLeaderboard("evt_1");
    expect(mockGet).toHaveBeenCalledWith(
      API_ENDPOINTS.EVENTS.LEADERBOARD("evt_1"),
    );
  });
});
