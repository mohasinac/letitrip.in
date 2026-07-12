import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireAuthUser,
  mockRateLimitByIdentifier,
  mockGetChatRooms,
  mockCreateOrGetChatRoom,
  mockSendChatMessage,
  mockDeleteChatRoom,
  MOCK_FEATURE_FLAGS,
} = vi.hoisted(() => ({
  mockRequireAuthUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockGetChatRooms: vi.fn(),
  mockCreateOrGetChatRoom: vi.fn(),
  mockSendChatMessage: vi.fn(),
  mockDeleteChatRoom: vi.fn(),
  MOCK_FEATURE_FLAGS: { CHAT_ENABLED: true },
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
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); this.name = "AuthorizationError"; } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); this.name = "ValidationError"; } },
  getChatRooms: mockGetChatRooms,
  createOrGetChatRoom: mockCreateOrGetChatRoom,
  sendChatMessage: mockSendChatMessage,
  deleteChatRoom: mockDeleteChatRoom,
  FEATURE_FLAGS: MOCK_FEATURE_FLAGS,
}));

import {
  getChatRoomsAction,
  createOrGetChatRoomAction,
  sendChatMessageAction,
  deleteChatRoomAction,
} from "../chat.actions";

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-buyer-1", email: "buyer@test.com", ...overrides };
}

describe("getChatRoomsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockGetChatRooms.mockResolvedValue({ rooms: [] });
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await getChatRoomsAction();
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await getChatRoomsAction();
    expect(result.ok).toBe(false);
  });

  it("valid → getChatRooms called with (uid, FEATURE_FLAGS.CHAT_ENABLED)", async () => {
    await getChatRoomsAction();
    expect(mockGetChatRooms).toHaveBeenCalledWith("user-buyer-1", MOCK_FEATURE_FLAGS.CHAT_ENABLED);
  });

  it("returns { ok: true, data: ChatRoomsResult }", async () => {
    const result = await getChatRoomsAction();
    expect(result.ok).toBe(true);
  });
});

describe("createOrGetChatRoomAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCreateOrGetChatRoom.mockResolvedValue({ roomId: "chat-123", isNew: true });
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await createOrGetChatRoomAction({ orderId: "order-1", ownerId: "store-1" });
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await createOrGetChatRoomAction({ orderId: "order-1", ownerId: "store-1" });
    expect(result.ok).toBe(false);
  });

  it("missing orderId → { ok: false } (schema min1)", async () => {
    const result = await createOrGetChatRoomAction({ orderId: "", ownerId: "store-1" });
    expect(result.ok).toBe(false);
  });

  it("missing ownerId → { ok: false } (schema min1)", async () => {
    const result = await createOrGetChatRoomAction({ orderId: "order-1", ownerId: "" });
    expect(result.ok).toBe(false);
  });

  it("valid → createOrGetChatRoom called with (uid, FEATURE_FLAGS.CHAT_ENABLED, parsedData)", async () => {
    await createOrGetChatRoomAction({ orderId: "order-1", ownerId: "store-1" });
    expect(mockCreateOrGetChatRoom).toHaveBeenCalledWith(
      "user-buyer-1",
      MOCK_FEATURE_FLAGS.CHAT_ENABLED,
      { orderId: "order-1", ownerId: "store-1" },
    );
  });

  it("returns { ok: true, data: CreateRoomResult }", async () => {
    const result = await createOrGetChatRoomAction({ orderId: "order-1", ownerId: "store-1" });
    expect(result.ok).toBe(true);
  });
});

describe("sendChatMessageAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockSendChatMessage.mockResolvedValue({ messageId: "msg-1", timestamp: Date.now() });
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await sendChatMessageAction("chat-1", "Hello");
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await sendChatMessageAction("chat-1", "Hello");
    expect(result.ok).toBe(false);
  });

  it("valid → sendChatMessage called with (uid, chatId, message)", async () => {
    await sendChatMessageAction("chat-1", "Hello");
    expect(mockSendChatMessage).toHaveBeenCalledWith("user-buyer-1", "chat-1", "Hello");
  });
});

describe("deleteChatRoomAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockDeleteChatRoom.mockResolvedValue({ deleted: true });
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await deleteChatRoomAction("chat-1");
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await deleteChatRoomAction("chat-1");
    expect(result.ok).toBe(false);
  });

  it("valid → deleteChatRoom called with (uid, chatId)", async () => {
    await deleteChatRoomAction("chat-1");
    expect(mockDeleteChatRoom).toHaveBeenCalledWith("user-buyer-1", "chat-1");
  });
});
