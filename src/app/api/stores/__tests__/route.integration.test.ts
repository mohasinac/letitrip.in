// @vitest-environment node
// Integration test — calls the real Next.js server at TEST_BASE_URL / NEXT_PUBLIC_APP_URL.
// Verifies that seeded stores are returned with the correct shape and that filtering works.
// Skips if no server URL is configured.

import { describe, it, expect } from "vitest";

const BASE = process.env.TEST_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

describe.skipIf(!BASE)("GET /api/stores — integration (real Firestore)", () => {
  it("returns active stores with correct slug prefix and required fields", async () => {
    const res = await fetch(`${BASE}/api/stores?pageSize=5`);
    expect(res.status, "Stores API must return 200").toBe(200);
    const json = (await res.json()) as {
      success: boolean;
      data: {
        items: { id: string; storeName: string; status: string }[];
        total: number;
      };
    };
    expect(json.success, "Response must have success:true").toBe(true);
    expect(json.data.items.length, "Seeded active stores must be present").toBeGreaterThan(0);
    for (const store of json.data.items) {
      expect(store.id).toMatch(/^store-/);
      expect(store.status).toBe("active");
      expect(typeof store.storeName).toBe("string");
    }
  });

  it("seeded letitrip-official store is present in results", async () => {
    const res = await fetch(`${BASE}/api/stores?pageSize=20`);
    const json = (await res.json()) as { data: { items: { id: string }[] } };
    const ids = json.data.items.map((s) => s.id);
    expect(ids).toContain("store-letitrip-official");
  });

  it("text search by storeName returns matching results or empty", async () => {
    const res = await fetch(`${BASE}/api/stores?q=palace`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { success: boolean; data: { items: unknown[] } };
    expect(json.success).toBe(true);
  });

  it("filters by storeCategory=trading-cards", async () => {
    const res = await fetch(`${BASE}/api/stores?category=trading-cards&pageSize=5`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      data: { items: { id: string; storeCategory: string }[] };
    };
    for (const store of json.data.items) {
      expect(store.storeCategory, `Store ${store.id} category mismatch`).toBe("trading-cards");
    }
  });

  it("total is greater than or equal to items count", async () => {
    const res = await fetch(`${BASE}/api/stores?pageSize=3`);
    const json = (await res.json()) as { data: { items: unknown[]; total: number } };
    expect(json.data.total).toBeGreaterThanOrEqual(json.data.items.length);
  });
});
