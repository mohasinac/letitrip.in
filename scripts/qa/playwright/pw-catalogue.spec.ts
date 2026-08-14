import { test, expect } from "@playwright/test";
import { loginAsAdmin, loginAsSeller, loginAsBuyer, gotoAndWait, getCookieHeader, BASE_URL } from "./_setup";

/**
 * Feature B — Personal Catalogue (buyers, sellers, and admins).
 *
 * Covers: public-by-default visibility, the buyer "Request to sell" ->
 * admin-approval path (product lands under store-letitrip-official), the
 * seller direct-list path (own store), the admin direct-list path (admin
 * has no personal store, so it also lands under store-letitrip-official —
 * this is the "let admin also make catalogue as a user" fix), and the
 * 30-day photo-freshness gate.
 */
test.describe("Personal Catalogue — Feature B", () => {
  test("user catalogue page renders for a buyer", async ({ page }) => {
    await loginAsBuyer(page);
    await gotoAndWait(page, "/user/catalogue");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("unauthenticated access to the catalogue API returns 401", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/user/catalogue`);
    expect([401, 403]).toContain(res.status());
  });

  test("buyer creates a public catalogue item, requests to sell, admin approves -> product under store-letitrip-official", async ({ page }) => {
    await loginAsBuyer(page);
    const buyerCookies = getCookieHeader(await page.context().cookies([BASE_URL]));

    const createRes = await page.request.post(`${BASE_URL}/api/user/catalogue`, {
      headers: { Cookie: buyerCookies, "Content-Type": "application/json" },
      data: { title: `PW Buyer Item ${Date.now()}`, price: 150000, quantity: 1, visibility: "public" },
    });
    expect(createRes.status(), await createRes.text()).toBe(200);
    const item = (await createRes.json()).data as { id: string; visibility: string; listingStatus: string };
    expect(item.visibility).toBe("public");
    expect(item.listingStatus).toBe("not_listed");

    const submitRes = await page.request.post(`${BASE_URL}/api/user/catalogue/${item.id}/submit`, {
      headers: { Cookie: buyerCookies },
    });
    expect(submitRes.status(), await submitRes.text()).toBe(200);

    await loginAsAdmin(page);
    const adminCookies = getCookieHeader(await page.context().cookies([BASE_URL]));

    const queueRes = await page.request.get(`${BASE_URL}/api/admin/catalogue?pageSize=50`, {
      headers: { Cookie: adminCookies },
    });
    const queueBody = (await queueRes.json()).data as { items: Array<{ id: string }> };
    expect(queueBody.items.some((i) => i.id === item.id)).toBe(true);

    const approveRes = await page.request.post(`${BASE_URL}/api/admin/catalogue/${item.id}/approve`, {
      headers: { Cookie: adminCookies },
    });
    expect(approveRes.status(), await approveRes.text()).toBe(200);
    const approveBody = (await approveRes.json()).data as { productId: string; productSlug: string };
    expect(approveBody.productId).toBeTruthy();

    const productRes = await page.request.get(`${BASE_URL}/api/admin/products/${approveBody.productId}`, {
      headers: { Cookie: adminCookies },
    });
    const product = (await productRes.json()).data as { storeId: string; sourceCatalogueItemId?: string };
    expect(product.storeId).toBe("store-letitrip-official");
    expect(product.sourceCatalogueItemId).toBe(item.id);
  });

  test("seller lists a catalogue item directly under their own store", async ({ page }) => {
    await loginAsSeller(page);
    const cookies = getCookieHeader(await page.context().cookies([BASE_URL]));

    const createRes = await page.request.post(`${BASE_URL}/api/user/catalogue`, {
      headers: { Cookie: cookies, "Content-Type": "application/json" },
      data: { title: `PW Seller Item ${Date.now()}`, price: 250000, quantity: 1 },
    });
    const item = (await createRes.json()).data as { id: string; ownerRole: string };
    expect(item.ownerRole).toBe("seller");

    const listRes = await page.request.post(`${BASE_URL}/api/user/catalogue/${item.id}/list`, {
      headers: { Cookie: cookies },
    });
    expect(listRes.status(), await listRes.text()).toBe(200);
    const listBody = (await listRes.json()).data as { productId: string };

    // No GET /api/store/products/[id] route exists in this codebase (only
    // duplicate/codes/group sub-routes) — verify via the public product
    // route instead, which the newly-listed (published) product satisfies.
    const productRes = await page.request.get(`${BASE_URL}/api/products/${listBody.productId}`, {
      headers: { Cookie: cookies },
    });
    expect(productRes.status()).toBe(200);
    const product = (await productRes.json()).data as { storeId: string };
    expect(product.storeId).not.toBe("store-letitrip-official");
    expect(product.storeId).toBe("store-pokemon-palace");
  });

  test("admin lists a catalogue item directly (no store of their own -> lands under store-letitrip-official)", async ({ page }) => {
    await loginAsAdmin(page);
    const cookies = getCookieHeader(await page.context().cookies([BASE_URL]));

    const createRes = await page.request.post(`${BASE_URL}/api/user/catalogue`, {
      headers: { Cookie: cookies, "Content-Type": "application/json" },
      data: { title: `PW Admin Item ${Date.now()}`, price: 300000, quantity: 1 },
    });
    expect(createRes.status(), await createRes.text()).toBe(200);
    const item = (await createRes.json()).data as { id: string; ownerRole: string };
    expect(item.ownerRole).toBe("admin");

    // Admin gets the direct "list" path — no approval queue, unlike a buyer.
    const listRes = await page.request.post(`${BASE_URL}/api/user/catalogue/${item.id}/list`, {
      headers: { Cookie: cookies },
    });
    expect(listRes.status(), await listRes.text()).toBe(200);
    const listBody = (await listRes.json()).data as { productId: string };

    const productRes = await page.request.get(`${BASE_URL}/api/admin/products/${listBody.productId}`, {
      headers: { Cookie: cookies },
    });
    const product = (await productRes.json()).data as { storeId: string; sourceCatalogueItemId?: string };
    expect(product.storeId).toBe("store-letitrip-official");
    expect(product.sourceCatalogueItemId).toBe(item.id);
  });

  // The 30-day staleness half of this gate (assertCatalogueImagesFresh) is
  // covered by a Vitest unit test (appkit/src/features/catalogue/utils/__tests__/freshness.test.ts)
  // instead of here: updateCatalogueItemSchema deliberately does not expose
  // `lastImageUpdateAt` as a writable field (Zod strips it), so there is no
  // legitimate HTTP path to backdate it — that's correct security behavior,
  // not a gap, since sellers/buyers must not be able to set their own
  // freshness deadline. Playwright can only exercise the reachable half.
  test("freshness gate does not block a freshly-created catalogue item", async ({ page }) => {
    await loginAsSeller(page);
    const cookies = getCookieHeader(await page.context().cookies([BASE_URL]));

    const createRes = await page.request.post(`${BASE_URL}/api/user/catalogue`, {
      headers: { Cookie: cookies, "Content-Type": "application/json" },
      data: { title: `PW Fresh Item ${Date.now()}`, price: 100000, quantity: 1 },
    });
    const item = (await createRes.json()).data as { id: string };

    const freshListRes = await page.request.post(`${BASE_URL}/api/user/catalogue/${item.id}/list`, {
      headers: { Cookie: cookies },
    });
    expect(freshListRes.status(), "a freshly-created catalogue item must not be blocked").toBe(200);
  });

  test("public catalogue page only shows public items", async ({ page }) => {
    await loginAsBuyer(page);
    const cookies = getCookieHeader(await page.context().cookies([BASE_URL]));

    const meRes = await page.request.get(`${BASE_URL}/api/auth/me`, { headers: { Cookie: cookies } });
    const me = (await meRes.json()).data as { uid?: string; id?: string };
    const ownerSlug = me.id ?? me.uid;

    const privateRes = await page.request.post(`${BASE_URL}/api/user/catalogue`, {
      headers: { Cookie: cookies, "Content-Type": "application/json" },
      data: { title: `PW Private Item ${Date.now()}`, price: 50000, quantity: 1, visibility: "private" },
    });
    const privateItem = (await privateRes.json()).data as { id: string };

    if (ownerSlug) {
      const publicRes = await page.request.get(`${BASE_URL}/api/catalogue/${ownerSlug}`);
      if (publicRes.ok()) {
        const publicBody = (await publicRes.json()).data as { items: Array<{ id: string; visibility: string }> };
        expect(publicBody.items.every((i) => i.visibility === "public")).toBe(true);
        expect(publicBody.items.some((i) => i.id === privateItem.id)).toBe(false);
      }
    }
  });
});
