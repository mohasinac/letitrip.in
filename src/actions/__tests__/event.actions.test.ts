import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireRoleUser,
  mockRequireAuthUser,
  mockRateLimitByIdentifier,
  mockCreateEvent,
  mockUpdateEvent,
  mockDeleteEvent,
  mockChangeEventStatus,
  mockEnterEvent,
} = vi.hoisted(() => ({
  mockRequireRoleUser: vi.fn(),
  mockRequireAuthUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockCreateEvent: vi.fn(),
  mockUpdateEvent: vi.fn(),
  mockDeleteEvent: vi.fn(),
  mockChangeEventStatus: vi.fn(),
  mockEnterEvent: vi.fn(),
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
  requireRoleUser: mockRequireRoleUser,
  requireAuthUser: mockRequireAuthUser,
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); } },
  createEvent: mockCreateEvent,
  updateEvent: mockUpdateEvent,
  deleteEvent: mockDeleteEvent,
  changeEventStatus: mockChangeEventStatus,
  enterEvent: mockEnterEvent,
  adminUpdateEventEntry: vi.fn().mockResolvedValue(undefined),
  listPublicEvents: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  getPublicEventById: vi.fn().mockResolvedValue(null),
  getEventLeaderboard: vi.fn().mockResolvedValue([]),
  adminListEvents: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  adminGetEventById: vi.fn().mockResolvedValue(null),
  adminGetEventEntries: vi.fn().mockResolvedValue([]),
  adminGetEventStats: vi.fn().mockResolvedValue({}),
  resolveDate: (v: unknown) => (v instanceof Date ? v : new Date(String(v))),
}));

vi.mock("@/constants", () => ({
  EVENT_FIELDS: {
    STATUS_VALUES: {
      DRAFT: "draft",
      PUBLISHED: "published",
      ACTIVE: "active",
      ENDED: "ended",
    },
  },
}));

import {
  createEventAction,
  updateEventAction,
  deleteEventAction,
  changeEventStatusAction,
  enterEventAction,
} from "../event.actions";

function makeAdmin(overrides: Record<string, unknown> = {}) {
  return { uid: "user-admin-1", email: "admin@letitrip.in", role: "admin", ...overrides };
}

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-buyer-1", email: "buyer@test.com", ...overrides };
}

function makeEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: "event-summer-holo-sale-2026",
    title: "Summer Holo Sale",
    type: "sale",
    status: "draft",
    ...overrides,
  };
}

function makeCreateInput(overrides: Record<string, unknown> = {}) {
  return {
    type: "sale",
    title: "Summer Holo Sale",
    ...overrides,
  };
}

describe("createEventAction — auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCreateEvent.mockResolvedValue(makeEvent());
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await createEventAction(makeCreateInput() as any);
    expect(result.ok).toBe(false);
  });

  it("role 'seller' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await createEventAction(makeCreateInput() as any);
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await createEventAction(makeCreateInput() as any);
    expect(result.ok).toBe(false);
  });
});

describe("createEventAction — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCreateEvent.mockResolvedValue(makeEvent());
  });

  it("invalid type → { ok: false }", async () => {
    const result = await createEventAction({ ...makeCreateInput(), type: "invalid_type" } as any);
    expect(result.ok).toBe(false);
  });

  it("missing title → { ok: false }", async () => {
    const result = await createEventAction({ ...makeCreateInput(), title: "" } as any);
    expect(result.ok).toBe(false);
  });
});

describe("createEventAction — success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCreateEvent.mockResolvedValue(makeEvent());
  });

  it("valid → createEvent called with (adminUid, parsedData)", async () => {
    await createEventAction(makeCreateInput() as any);
    expect(mockCreateEvent).toHaveBeenCalledWith(
      "user-admin-1",
      expect.objectContaining({ type: "sale", title: "Summer Holo Sale" }),
    );
  });

  it("returns { ok: true, data: EventDocument }", async () => {
    const result = await createEventAction(makeCreateInput() as any);
    expect(result.ok).toBe(true);
  });
});

describe("updateEventAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockUpdateEvent.mockResolvedValue(makeEvent({ title: "Updated Title" }));
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await updateEventAction("event-summer-holo-sale-2026", { title: "Updated" } as any);
    expect(result.ok).toBe(false);
  });

  it("empty id → { ok: false }", async () => {
    const result = await updateEventAction("", { title: "Updated" } as any);
    expect(result.ok).toBe(false);
  });

  it("valid → updateEvent called with (adminUid, id, parsedData)", async () => {
    await updateEventAction("event-summer-holo-sale-2026", { title: "Updated Title" } as any);
    expect(mockUpdateEvent).toHaveBeenCalledWith(
      "user-admin-1",
      "event-summer-holo-sale-2026",
      expect.objectContaining({ title: "Updated Title" }),
    );
  });
});

describe("deleteEventAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockDeleteEvent.mockResolvedValue(undefined);
  });

  it("role 'user' → throws", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    await expect(deleteEventAction("event-summer-holo-sale-2026")).rejects.toThrow();
  });

  it("empty id → throws", async () => {
    await expect(deleteEventAction("")).rejects.toThrow();
  });

  it("valid → deleteEvent called with (adminUid, id)", async () => {
    await deleteEventAction("event-summer-holo-sale-2026");
    expect(mockDeleteEvent).toHaveBeenCalledWith("user-admin-1", "event-summer-holo-sale-2026");
  });
});

describe("changeEventStatusAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockChangeEventStatus.mockResolvedValue(makeEvent({ status: "published" }));
  });

  it("role 'seller' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await changeEventStatusAction({ id: "event-abc", status: "published" });
    expect(result.ok).toBe(false);
  });

  it("empty id → { ok: false }", async () => {
    const result = await changeEventStatusAction({ id: "", status: "published" });
    expect(result.ok).toBe(false);
  });

  it("invalid status → { ok: false }", async () => {
    const result = await changeEventStatusAction({ id: "event-abc", status: "invalid" as any });
    expect(result.ok).toBe(false);
  });

  it("valid → changeEventStatus called with (adminUid, id, status)", async () => {
    await changeEventStatusAction({ id: "event-abc", status: "published" });
    expect(mockChangeEventStatus).toHaveBeenCalledWith("user-admin-1", "event-abc", "published");
  });
});

describe("enterEventAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockEnterEvent.mockResolvedValue({ entryId: "entry-001" });
  });

  it("unauthenticated is allowed (event type may allow anonymous)", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    // Should not throw — enterEventAction catches auth errors
    const result = await enterEventAction("event-summer-holo-sale-2026", {});
    expect(result.ok).toBe(true);
  });

  it("valid authenticated → enterEvent called with eventId + input + user context", async () => {
    await enterEventAction("event-summer-holo-sale-2026", { pollVotes: ["option-1"] });
    expect(mockEnterEvent).toHaveBeenCalledWith(
      "event-summer-holo-sale-2026",
      expect.objectContaining({ pollVotes: ["option-1"] }),
      expect.objectContaining({ uid: "user-buyer-1" }),
    );
  });

  it("returns { ok: true, data: { entryId } }", async () => {
    const result = await enterEventAction("event-summer-holo-sale-2026", {});
    expect(result.ok).toBe(true);
    expect((result as { data: { entryId: string } }).data.entryId).toBe("entry-001");
  });
});
