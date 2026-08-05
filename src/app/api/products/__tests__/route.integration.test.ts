// @vitest-environment node
// Integration test — calls the real Next.js server at TEST_BASE_URL / NEXT_PUBLIC_APP_URL.
// Verifies that seeded products are returned with the correct slug prefixes and shape.
// Skips if no server URL is configured.

import { describe, it, expect, beforeAll } from "vitest";

const BASE = process.env.TEST_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

describe.skipIf(!BASE)("GET /api/products — integration (real Firestore)", () => {
  beforeAll(() => {
    if (!BASE) return;
  });

  it("returns published products with correct slug prefix", async () => {
    const res = await fetch(`${BASE}/api/products?status=published&pageSize=5`);
    expect(res.status, "Products API must return 200").toBe(200);
    const json = (await res.json()) as {
      success: boolean;
      data: { items: { id: string; title: string; listingType: string }[]; total: number };
    };
    expect(json.success, "Response must have success:true").toBe(true);
    expect(json.data.items.length, "Seeded published products must be present").toBeGreaterThan(0);
    for (const item of json.data.items) {
      expect(item.id).toMatch(/^(product-|auction-|preorder-)/);
    }
  });

  it("returns total count >= items count", async () => {
    const res = await fetch(`${BASE}/api/products?status=published&pageSize=5`);
    const json = (await res.json()) as {
      data: { items: unknown[]; total: number; page: number; pageSize: number };
    };
    expect(json.data.total).toBeGreaterThanOrEqual(json.data.items.length);
  });

  it("filters by listingType=auction — returns only auction slugs", async () => {
    const res = await fetch(`${BASE}/api/products?listingType=auction&pageSize=5`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { items: { id: string }[] } };
    for (const item of json.data.items) {
      expect(item.id, `Non-auction slug found: ${item.id}`).toMatch(/^auction-/);
    }
  });

  it("rejects pageSize > 50 with 400", async () => {
    const res = await fetch(`${BASE}/api/products?pageSize=99`);
    expect(res.status, "pageSize > 50 must be rejected").toBe(400);
  });

  it("ids= batch mode returns items for given ids", async () => {
    // Fetch one real id first
    const listRes = await fetch(`${BASE}/api/products?status=published&pageSize=1`);
    const listJson = (await listRes.json()) as { data: { items: { id: string }[] } };
    const firstId = listJson.data.items[0]?.id;
    expect(firstId, "At least one published product must be seeded").toBeTruthy();

    const batchRes = await fetch(`${BASE}/api/products?ids=${firstId}`);
    expect(batchRes.status).toBe(200);
    const batchJson = (await batchRes.json()) as { data: { items: { id: string }[] } };
    expect(batchJson.data.items.some((i) => i.id === firstId)).toBe(true);
  });
});
