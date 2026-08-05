// @vitest-environment node
// Integration test — calls the real Next.js server at TEST_BASE_URL / NEXT_PUBLIC_APP_URL.
// Uses a seeded buyer account to test authenticated user order endpoints.
// Skips if no server URL is configured.
//
// Buyer seed credentials (must match seeded Firestore users):
//   SMOKE_BUYER_EMAIL (default: yugi@duelkingdom.in)
//   SMOKE_BUYER_PASSWORD (default: TempPass123!)

import { describe, it, expect, beforeAll } from "vitest";

const BASE = process.env.TEST_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
const BUYER_EMAIL = process.env.SMOKE_BUYER_EMAIL ?? "yugi@duelkingdom.in";
const BUYER_PASSWORD = process.env.SMOKE_BUYER_PASSWORD ?? "TempPass123!";

let sessionCookie = "";

async function loginAsBuyer(): Promise<string> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: BUYER_EMAIL, password: BUYER_PASSWORD }),
    redirect: "manual",
  });
  if (!res.ok) throw new Error(`Buyer login failed: ${res.status}`);
  const setCookie = res.headers.get("set-cookie") ?? "";
  const match = setCookie.match(/__session=([^;]+)/);
  return match ? `__session=${match[1]}` : "";
}

describe.skipIf(!BASE)("GET /api/user/orders — integration (authenticated buyer)", () => {
  beforeAll(async () => {
    if (!BASE) return;
    sessionCookie = await loginAsBuyer();
  });

  it("returns 401 for unauthenticated GET", async () => {
    const res = await fetch(`${BASE}/api/user/orders`);
    expect([401, 403]).toContain(res.status);
  });

  it("authenticated GET returns orders list with expected shape", async () => {
    if (!sessionCookie) return;
    const res = await fetch(`${BASE}/api/user/orders?pageSize=5`, {
      headers: { Cookie: sessionCookie },
    });
    expect(res.status, "Authenticated orders GET must return 200").toBe(200);
    const json = (await res.json()) as {
      ok: boolean;
      data: { items: { id: string; status: string }[]; total: number };
    };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.data.items)).toBe(true);
    expect(typeof json.data.total).toBe("number");
  });

  it("seeded buyer has at least one order", async () => {
    if (!sessionCookie) return;
    const res = await fetch(`${BASE}/api/user/orders?pageSize=5`, {
      headers: { Cookie: sessionCookie },
    });
    const json = (await res.json()) as { data: { total: number; items: { id: string }[] } };
    expect(json.data.total, "Buyer must have at least one order in seed data").toBeGreaterThan(0);
    for (const order of json.data.items) {
      expect(order.id).toMatch(/^order-/);
    }
  });

  it("filtering by status=pending returns correct subset", async () => {
    if (!sessionCookie) return;
    const res = await fetch(`${BASE}/api/user/orders?status=PENDING&pageSize=5`, {
      headers: { Cookie: sessionCookie },
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { items: { status: string }[] } };
    for (const order of json.data.items) {
      expect(order.status.toUpperCase()).toBe("PENDING");
    }
  });
});
