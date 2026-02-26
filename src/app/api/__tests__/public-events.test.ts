/**
 * @jest-environment node
 */

/**
 * Public Events API Tests
 *
 * GET  /api/events               — List active events
 * GET  /api/events/[id]          — Public event detail
 * POST /api/events/[id]/enter    — Submit entry / vote
 * GET  /api/events/[id]/leaderboard — Leaderboard for survey events
 */

import { buildRequest, parseResponse, mockAdminUser } from "./helpers";

// ─── createApiHandler stub ────────────────────────────────────────────────────

jest.mock("@/lib/api/api-handler", () => ({
  createApiHandler: (opts: any) => {
    return async (req: any, ctx?: any) => {
      const { NextResponse } = require("next/server");
      const user = (global as any).__mockPublicEventsUser ?? null;
      // Non-admin auth guard (some public routes have auth: false but still
      // expose user if cookie is present — we only gate when auth: true)
      if (opts.auth && !user) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      }
      let body: any = undefined;
      if (opts.schema) {
        try {
          const rawBody = await req.json().catch(() => ({}));
          const result = opts.schema.safeParse(rawBody);
          if (!result.success) {
            return NextResponse.json(
              { success: false, error: "Validation failed" },
              { status: 422 },
            );
          }
          body = result.data;
        } catch {
          body = undefined;
        }
      }
      try {
        return await opts.handler({ request: req, user, body }, ctx);
      } catch (error: any) {
        const status = error?.statusCode || 500;
        return NextResponse.json(
          { success: false, error: error?.message || "Internal error" },
          { status },
        );
      }
    };
  },
}));

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockEventFindById = jest.fn();
const mockEventListActive = jest.fn();
const mockEntriesListForEvent = jest.fn();
const mockEntriesGetLeaderboard = jest.fn();
const mockEntriesCountUserEntries = jest.fn();
const mockEntriesCreate = jest.fn();

jest.mock("@/repositories", () => ({
  eventRepository: {
    findById: (...args: unknown[]) => mockEventFindById(...args),
    listActive: (...args: unknown[]) => mockEventListActive(...args),
  },
  eventEntryRepository: {
    listForEvent: (...args: unknown[]) => mockEntriesListForEvent(...args),
    getLeaderboard: (...args: unknown[]) => mockEntriesGetLeaderboard(...args),
    countUserEntries: (...args: unknown[]) =>
      mockEntriesCountUserEntries(...args),
    create: (...args: unknown[]) => mockEntriesCreate(...args),
  },
}));

// ─── Route imports (after mocks) ─────────────────────────────────────────────

import { GET as listActiveEvents } from "../events/route";
import { GET as getPublicEvent } from "../events/[id]/route";
import { POST as enterEvent } from "../events/[id]/enter/route";
import { GET as getLeaderboard } from "../events/[id]/leaderboard/route";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BASE = "http://localhost:3000/api/events";

function setUser(user: any) {
  (global as any).__mockPublicEventsUser = user;
}

const now = new Date();
const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

const activeEvent = {
  id: "evt_active",
  type: "poll",
  title: "Spring Poll",
  description: "",
  status: "active",
  createdBy: "admin-uid-001",
  startsAt: { toDate: () => new Date(now.getTime() - 1000) },
  endsAt: { toDate: () => futureDate },
  stats: { totalEntries: 5, approvedEntries: 5, flaggedEntries: 0 },
  pollConfig: {
    allowMultiSelect: false,
    allowComment: false,
    options: [
      { id: "opt_1", label: "Option A" },
      { id: "opt_2", label: "Option B" },
    ],
    resultsVisibility: "after_end",
  },
};

const draftEvent = { ...activeEvent, id: "evt_draft", status: "draft" };

const surveyEvent = {
  ...activeEvent,
  id: "evt_survey",
  type: "survey",
  pollConfig: undefined,
  surveyConfig: {
    requireLogin: true,
    maxEntriesPerUser: 1,
    hasLeaderboard: true,
    hasPointSystem: true,
    pointsLabel: "Stars",
    entryReviewRequired: false,
    formFields: [],
  },
};

// ─── GET /api/events ─────────────────────────────────────────────────────────

describe("GET /api/events", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setUser(null);
    mockEventListActive.mockResolvedValue([activeEvent]);
  });

  it("returns 200 with active events", async () => {
    const req = buildRequest(BASE);
    const res = await listActiveEvents(req);
    const { status, body } = await parseResponse(res);
    expect(status).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("strips createdBy from each event", async () => {
    const req = buildRequest(BASE);
    const res = await listActiveEvents(req);
    const { body } = await parseResponse(res);
    const events = body.data as any[];
    if (events.length > 0) {
      expect(events[0]).not.toHaveProperty("createdBy");
    }
  });
});

// ─── GET /api/events/[id] ────────────────────────────────────────────────────

describe("GET /api/events/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setUser(null);
  });

  it("returns 200 for an active event", async () => {
    mockEventFindById.mockResolvedValue(activeEvent);
    const req = buildRequest(`${BASE}/evt_active`);
    const res = await getPublicEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(200);
  });

  it("returns 404 for a draft event (not public)", async () => {
    mockEventFindById.mockResolvedValue(draftEvent);
    const req = buildRequest(`${BASE}/evt_draft`);
    const res = await getPublicEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(404);
  });

  it("returns 404 when event does not exist", async () => {
    mockEventFindById.mockResolvedValue(null);
    const req = buildRequest(`${BASE}/nonexistent`);
    const res = await getPublicEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(404);
  });

  it("strips createdBy from the response", async () => {
    mockEventFindById.mockResolvedValue(activeEvent);
    const req = buildRequest(`${BASE}/evt_active`);
    const res = await getPublicEvent(req);
    const { body } = await parseResponse(res);
    expect(body.data).not.toHaveProperty("createdBy");
  });
});

// ─── POST /api/events/[id]/enter ─────────────────────────────────────────────

describe("POST /api/events/[id]/enter", () => {
  const pollVoteBody = { pollVotes: ["opt_1"] };

  beforeEach(() => {
    jest.clearAllMocks();
    setUser(null);
  });

  it("returns 404 when event is inactive (draft)", async () => {
    mockEventFindById.mockResolvedValue(draftEvent);
    const req = buildRequest(`${BASE}/evt_draft/enter`, {
      method: "POST",
      body: pollVoteBody,
    });
    const res = await enterEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(404);
  });

  it("returns 400 when event deadline has passed", async () => {
    const expiredEvent = {
      ...activeEvent,
      endsAt: { toDate: () => new Date(now.getTime() - 60000) }, // past
    };
    mockEventFindById.mockResolvedValue(expiredEvent);
    const req = buildRequest(`${BASE}/evt_active/enter`, {
      method: "POST",
      body: pollVoteBody,
    });
    const res = await enterEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(400);
  });

  it("returns 400 when poll vote has no options selected", async () => {
    mockEventFindById.mockResolvedValue(activeEvent);
    const req = buildRequest(`${BASE}/evt_active/enter`, {
      method: "POST",
      body: { pollVotes: [] },
    });
    const res = await enterEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(400);
  });

  it("returns 400 when poll vote references invalid option ID", async () => {
    mockEventFindById.mockResolvedValue(activeEvent);
    const req = buildRequest(`${BASE}/evt_active/enter`, {
      method: "POST",
      body: { pollVotes: ["opt_invalid"] },
    });
    const res = await enterEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(400);
  });

  it("returns 400 when survey requires login but no user", async () => {
    mockEventFindById.mockResolvedValue(surveyEvent);
    const req = buildRequest(`${BASE}/evt_survey/enter`, {
      method: "POST",
      body: { formResponses: {} },
    });
    const res = await enterEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(400);
  });
});

// ─── GET /api/events/[id]/leaderboard ────────────────────────────────────────

describe("GET /api/events/[id]/leaderboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setUser(null);
  });

  it("returns 404 for a draft event", async () => {
    mockEventFindById.mockResolvedValue(draftEvent);
    const req = buildRequest(`${BASE}/evt_draft/leaderboard`);
    const res = await getLeaderboard(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(404);
  });

  it("returns 400 when event type does not support leaderboard", async () => {
    mockEventFindById.mockResolvedValue(activeEvent); // poll — no leaderboard
    const req = buildRequest(`${BASE}/evt_active/leaderboard`);
    const res = await getLeaderboard(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(400);
  });

  it("returns 200 with leaderboard for survey events", async () => {
    mockEventFindById.mockResolvedValue(surveyEvent);
    mockEntriesGetLeaderboard.mockResolvedValue([
      {
        userId: "u1",
        userEmail: "u1@ex.com",
        points: 100,
        rank: 1,
        ipAddress: "1.2.3.4",
      },
    ]);
    const req = buildRequest(`${BASE}/evt_survey/leaderboard`);
    const res = await getLeaderboard(req);
    const { status, body } = await parseResponse(res);
    expect(status).toBe(200);
    expect(body.data).toHaveProperty("leaderboard");
    // Sensitive fields stripped
    if (body.data.leaderboard.length > 0) {
      expect(body.data.leaderboard[0]).not.toHaveProperty("userEmail");
      expect(body.data.leaderboard[0]).not.toHaveProperty("ipAddress");
    }
  });
});
