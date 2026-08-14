import { test, expect } from "@playwright/test";
import { loginAsAdmin, loginAsSeller, gotoAndWait, getCookieHeader, BASE_URL } from "./_setup";

/**
 * Feature A — Procurement Shipments (admin-only).
 *
 * Covers: RBAC block for non-admin, full create->lot->bulk-import->recompute
 * flow, the "saved not dynamic" persisted-totals guarantee, the Projections
 * list, the manual pre-order link, and the linked-item delete guard.
 */
test.describe("Procurement Shipments — Feature A", () => {
  test("non-admin (seller) is redirected away from /admin/shipments", async ({ page }) => {
    await loginAsSeller(page);
    await gotoAndWait(page, "/admin/shipments");
    // makeAdminSectionLayout redirects non-admin roles to /unauthorized
    await expect(page).not.toHaveURL(/\/admin\/shipments$/);
  });

  test("unauthenticated access to the shipments API returns 401", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/admin/shipments`);
    expect([401, 403]).toContain(res.status());
  });

  test("admin shipments list page renders", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoAndWait(page, "/admin/shipments");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("full flow: create shipment, add lot, bulk-import items, totals recompute and persist", async ({ page }) => {
    await loginAsAdmin(page);
    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = getCookieHeader(cookies);

    const shipmentNumber = `SH-TEST-${Date.now()}`;
    const createRes = await page.request.post(`${BASE_URL}/api/admin/shipments`, {
      headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
      data: {
        shipmentNumber,
        supplierName: "Playwright Test Supplier",
        status: "planning",
        customsTotalPaise: 100000,
        shippingTotalPaise: 50000,
        laborHoursSpent: 2,
      },
    });
    expect(createRes.status(), await createRes.text()).toBe(200);
    const shipment = (await createRes.json()).data as { id: string; shipmentNumber: string };
    expect(shipment.shipmentNumber).toBe(shipmentNumber);

    // Duplicate shipmentNumber must 409.
    const dupRes = await page.request.post(`${BASE_URL}/api/admin/shipments`, {
      headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
      data: {
        shipmentNumber,
        supplierName: "Another Supplier",
        status: "planning",
        customsTotalPaise: 0,
        shippingTotalPaise: 0,
      },
    });
    expect(dupRes.status()).toBe(409);

    const lotRes = await page.request.post(`${BASE_URL}/api/admin/shipments/${shipment.id}/lots`, {
      headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
      data: { lotName: "Test Lot A", weightGrams: 4000, purchaseCostPaise: 500000 },
    });
    expect(lotRes.status(), await lotRes.text()).toBe(200);
    const lot = (await lotRes.json()).data as { id: string };

    const bulkRows = Array.from({ length: 10 }, (_, i) => ({
      title: `Bulk Item ${i + 1}`,
      quantity: 1,
      isForSelfUse: false,
      price: 100000,
    }));
    const bulkRes = await page.request.post(
      `${BASE_URL}/api/admin/shipments/${shipment.id}/lots/${lot.id}/items/bulk`,
      { headers: { Cookie: cookieHeader, "Content-Type": "application/json" }, data: bulkRows },
    );
    expect(bulkRes.status(), await bulkRes.text()).toBe(200);
    const bulkBody = (await bulkRes.json()).data as { created: number };
    expect(bulkBody.created).toBe(10);

    // Function cascade is async — poll the lot until totals reflect the import
    // (mainItemsProjectedRevenuePaise should equal 10 * 100000 = 1_000_000).
    let lotAfter: { itemCount: number; mainItemsProjectedRevenuePaise: number; totalLandedCostPaise: number } | null = null;
    for (let attempt = 0; attempt < 15; attempt++) {
      const getLotRes = await page.request.get(`${BASE_URL}/api/admin/shipments/${shipment.id}/lots/${lot.id}`, {
        headers: { Cookie: cookieHeader },
      });
      const body = (await getLotRes.json()).data as typeof lotAfter;
      if (body && body.itemCount === 10) {
        lotAfter = body;
        break;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    expect(lotAfter, "onShipmentItemWrite cascade should populate itemCount within 30s").not.toBeNull();
    expect(lotAfter!.mainItemsProjectedRevenuePaise).toBe(1_000_000);
    // Single lot -> it absorbs 100% of customs/shipping -> landed cost = purchaseCost + customs + shipping.
    expect(lotAfter!.totalLandedCostPaise).toBe(500000 + 100000 + 50000);

    // Reload the shipment — totals must be instantly available from the
    // persisted `totals` field, not recomputed on read ("saved not dynamic").
    const shipmentAfter = await page.request.get(`${BASE_URL}/api/admin/shipments/${shipment.id}`, {
      headers: { Cookie: cookieHeader },
    });
    const shipmentBody = (await shipmentAfter.json()).data as { totals: { totalShipmentCostPaise: number }; totalsComputedAt: string };
    expect(shipmentBody.totalsComputedAt).toBeTruthy();
    expect(shipmentBody.totals.totalShipmentCostPaise).toBe(500000 + 100000 + 50000);

    // Projections list must surface the same persisted lot.
    const projRes = await page.request.get(`${BASE_URL}/api/admin/shipments/projections?pageSize=50`, {
      headers: { Cookie: cookieHeader },
    });
    const projBody = (await projRes.json()).data as { lots: Array<{ id: string }> };
    expect(projBody.lots.some((l) => l.id === lot.id)).toBe(true);

    // Delete must be blocked while nothing is linked? No — nothing is linked
    // yet, so delete should succeed once we clean up.
    const delRes = await page.request.delete(`${BASE_URL}/api/admin/shipments/${shipment.id}`, {
      headers: { Cookie: cookieHeader },
    });
    expect(delRes.status(), await delRes.text()).toBe(200);
  });

  test("deleting a shipment with a linked item is blocked until unlinked", async ({ page }) => {
    await loginAsAdmin(page);
    const cookies = await page.context().cookies([BASE_URL]);
    const cookieHeader = getCookieHeader(cookies);

    const createRes = await page.request.post(`${BASE_URL}/api/admin/shipments`, {
      headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
      data: {
        shipmentNumber: `SH-LINKTEST-${Date.now()}`,
        supplierName: "Link Test Supplier",
        status: "planning",
        customsTotalPaise: 0,
        shippingTotalPaise: 0,
      },
    });
    const shipment = (await createRes.json()).data as { id: string; etaDate?: string };

    const lotRes = await page.request.post(`${BASE_URL}/api/admin/shipments/${shipment.id}/lots`, {
      headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
      data: { lotName: "Link Test Lot", weightGrams: 1000, purchaseCostPaise: 100000 },
    });
    const lot = (await lotRes.json()).data as { id: string };

    const itemRes = await page.request.post(
      `${BASE_URL}/api/admin/shipments/${shipment.id}/lots/${lot.id}/items`,
      {
        headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
        data: { title: "Linkable Item", quantity: 1, isForSelfUse: false, price: 200000 },
      },
    );
    const item = (await itemRes.json()).data as { id: string };

    // Fetch a real category slug to satisfy the create-product schema.
    const categoriesRes = await page.request.get(`${BASE_URL}/api/categories?pageSize=1`);
    const categoriesBody = (await categoriesRes.json()).data as { items?: Array<{ slug: string }> };
    const categorySlug = categoriesBody.items?.[0]?.slug ?? "category-action-figures";

    const linkRes = await page.request.post(
      `${BASE_URL}/api/admin/shipments/${shipment.id}/lots/${lot.id}/items/${item.id}/link`,
      {
        headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
        data: { mode: "create", categorySlugs: [categorySlug] },
      },
    );
    expect(linkRes.status(), await linkRes.text()).toBe(200);
    const linkBody = (await linkRes.json()).data as { productId: string };
    expect(linkBody.productId).toBeTruthy();

    const blockedDelete = await page.request.delete(`${BASE_URL}/api/admin/shipments/${shipment.id}`, {
      headers: { Cookie: cookieHeader },
    });
    expect(blockedDelete.status()).toBe(409);

    // Unlink, then delete succeeds.
    const unlinkRes = await page.request.patch(
      `${BASE_URL}/api/admin/shipments/${shipment.id}/lots/${lot.id}/items/${item.id}`,
      {
        headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
        data: { linkedProductId: null, linkedProductSlug: null, linkedProductListingType: null },
      },
    );
    expect(unlinkRes.status()).toBe(200);

    const okDelete = await page.request.delete(`${BASE_URL}/api/admin/shipments/${shipment.id}`, {
      headers: { Cookie: cookieHeader },
    });
    expect(okDelete.status(), await okDelete.text()).toBe(200);
  });
});
