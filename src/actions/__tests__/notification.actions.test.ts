import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireAuthUser,
  mockRateLimitByIdentifier,
  mockMarkNotificationRead,
  mockMarkAllNotificationsRead,
  mockDeleteNotification,
  mockListNotifications,
  mockGetUnreadNotificationCount,
} = vi.hoisted(() => ({
  mockRequireAuthUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockMarkNotificationRead: vi.fn(),
  mockMarkAllNotificationsRead: vi.fn(),
  mockDeleteNotification: vi.fn(),
  mockListNotifications: vi.fn(),
  mockGetUnreadNotificationCount: vi.fn(),
}));

vi.mock("@mohasinac/appkit/server", () => ({
  wrapAction: async (fn: () => Promise<unknown>) => {
    try {
      return { ok: true, data: await fn() };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
}));

vi.mock("@mohasinac/appkit", () => ({
  requireAuthUser: mockRequireAuthUser,
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); } },
  markNotificationRead: mockMarkNotificationRead,
  markAllNotificationsRead: mockMarkAllNotificationsRead,
  deleteNotification: mockDeleteNotification,
  listNotifications: mockListNotifications,
  getUnreadNotificationCount: mockGetUnreadNotificationCount,
}));

import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
  deleteNotificationAction,
  listNotificationsAction,
  getUnreadNotificationCountAction,
} from "../notification.actions";

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-buyer-1", email: "buyer@test.com", ...overrides };
}

describe("markNotificationReadAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockMarkNotificationRead.mockResolvedValue(undefined);
  });

  it("unauthenticated → throws", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    await expect(markNotificationReadAction("notif-abc")).rejects.toThrow();
  });

  it("rate limit exceeded → throws", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    await expect(markNotificationReadAction("notif-abc")).rejects.toThrow();
  });

  it("empty id → throws ValidationError('Notification id is required')", async () => {
    await expect(markNotificationReadAction("")).rejects.toThrow(/notification id is required/i);
  });

  it("valid → markNotificationRead called with id (NOT scoped to uid)", async () => {
    await markNotificationReadAction("notif-abc");
    expect(mockMarkNotificationRead).toHaveBeenCalledWith("notif-abc");
  });
});

describe("markAllNotificationsReadAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockMarkAllNotificationsRead.mockResolvedValue(5);
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await markAllNotificationsReadAction();
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded (STRICT preset) → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await markAllNotificationsReadAction();
    expect(result.ok).toBe(false);
  });

  it("valid → markAllNotificationsRead called with user.uid (scoped to current user)", async () => {
    await markAllNotificationsReadAction();
    expect(mockMarkAllNotificationsRead).toHaveBeenCalledWith("user-buyer-1");
  });

  it("returns { ok: true, data: number }", async () => {
    const result = await markAllNotificationsReadAction();
    expect(result.ok).toBe(true);
    expect((result as { data: number }).data).toBe(5);
  });
});

describe("deleteNotificationAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockDeleteNotification.mockResolvedValue(undefined);
  });

  it("unauthenticated → throws", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    await expect(deleteNotificationAction("notif-abc")).rejects.toThrow();
  });

  it("rate limit exceeded → throws", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    await expect(deleteNotificationAction("notif-abc")).rejects.toThrow();
  });

  it("empty id → throws ValidationError", async () => {
    await expect(deleteNotificationAction("")).rejects.toThrow();
  });

  it("valid → deleteNotification called with id", async () => {
    await deleteNotificationAction("notif-abc");
    expect(mockDeleteNotification).toHaveBeenCalledWith("notif-abc");
  });
});

describe("listNotificationsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockListNotifications.mockResolvedValue({ notifications: [], unreadCount: 0 });
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await listNotificationsAction();
    expect(result.ok).toBe(false);
  });

  it("valid → listNotifications called with (uid, limit)", async () => {
    await listNotificationsAction(30);
    expect(mockListNotifications).toHaveBeenCalledWith("user-buyer-1", 30);
  });

  it("limit defaults to 20", async () => {
    await listNotificationsAction();
    expect(mockListNotifications).toHaveBeenCalledWith("user-buyer-1", 20);
  });
});

describe("getUnreadNotificationCountAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockGetUnreadNotificationCount.mockResolvedValue(3);
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await getUnreadNotificationCountAction();
    expect(result.ok).toBe(false);
  });

  it("valid → getUnreadNotificationCount called with uid", async () => {
    await getUnreadNotificationCountAction();
    expect(mockGetUnreadNotificationCount).toHaveBeenCalledWith("user-buyer-1");
  });
});
