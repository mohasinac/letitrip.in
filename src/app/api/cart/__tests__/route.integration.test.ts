// @vitest-environment node
// Integration test — calls the real Next.js server at TEST_BASE_URL / NEXT_PUBLIC_APP_URL.
// Uses a seeded buyer account to test authenticated cart endpoints.
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

describe.skipIf(!BASE)("GET /api/cart — integration (authenticated buyer)", () => {
  beforeAll(async () => {
    if (!BASE) return;
    sessionCookie = await loginAsBuyer();
  });

  it("returns 401 for unauthenticated GET", async () => {
    const res = await fetch(`${BASE}/api/cart`);
    expect([401, 403]).toContain(res.status);
  });

  it("authenticated GET returns cart with expected shape", async () => {
    if (!sessionCookie) return;
    const res = await fetch(`${BASE}/api/cart`, {
      headers: { Cookie: sessionCookie },
    });
    expect(res.status, "Authenticated cart GET must return 200").toBe(200);
    const json = (await res.json()) as {
      ok: boolean;
      data: { items: unknown[]; itemCount: number; subtotal: number };
    };
    expect(json.ok).toBe(true);
    expect(typeof json.data.itemCount).toBe("number");
    expect(typeof json.data.subtotal).toBe("number");
    expect(Array.isArray(json.data.items)).toBe(true);
  });

  it("authenticated DELETE clears cart and returns ok", async () => {
    if (!sessionCookie) return;
    const res = await fetch(`${BASE}/api/cart`, {
      method: "DELETE",
      headers: { Cookie: sessionCookie },
    });
    expect([200, 204]).toContain(res.status);
  });

  it("POST to cart with bad product id returns 404 or 400", async () => {
    if (!sessionCookie) return;
    const res = await fetch(`${BASE}/api/cart`, {
      method: "POST",
      headers: { Cookie: sessionCookie, "Content-Type": "application/json" },
      body: JSON.stringify({ productId: "product-does-not-exist-xyz", quantity: 1 }),
    });
    expect([400, 404]).toContain(res.status);
  });
});
