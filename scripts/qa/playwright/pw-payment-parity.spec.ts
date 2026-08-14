import { test, expect } from "@playwright/test";
import { loginAsAdmin, getCookieHeader, BASE_URL } from "./_setup";

/**
 * Feature C — Payment Detail Parity.
 *
 * Targets known, deterministic seed-data order IDs (orders-seed-data.ts)
 * rather than fabricating a full checkout, since no admin order-creation
 * route exists:
 *   order-1-20260729-cash01 — manual/cash, pending, proof already attached
 *                             by seed data (paymentProofUrl/paymentTransactionId set).
 *   order-1-20260729-cash02 — manual/cash, already paid — a genuinely
 *                             pre-Feature-C order (seed data predates
 *                             `paymentRecord`), used to prove the legacy
 *                             fallback path still renders sensibly.
 *
 * A real COD order isn't seeded, so COD coverage exercises the guard logic
 * (rejecting markCodCollected on a non-COD order) against the same cash
 * order rather than the full happy path — documented, not silently skipped.
 */
const MANUAL_PENDING_ORDER_ID = "order-1-20260729-cash01";
const MANUAL_PAID_LEGACY_ORDER_ID = "order-1-20260729-cash02";

test.describe("Payment Detail Parity — Feature C", () => {
  test("unauthenticated payment-verify request is rejected", async ({ page }) => {
    const res = await page.request.patch(`${BASE_URL}/api/admin/orders/${MANUAL_PENDING_ORDER_ID}/payment-verify`);
    expect([401, 403]).toContain(res.status());
  });

  test("admin verifies a manual/cash payment -> paymentRecord populated with method=manual, verificationMethod=manual_review", async ({ page }) => {
    await loginAsAdmin(page);
    const cookies = getCookieHeader(await page.context().cookies([BASE_URL]));

    const verifyRes = await page.request.patch(
      `${BASE_URL}/api/admin/orders/${MANUAL_PENDING_ORDER_ID}/payment-verify`,
      { headers: { Cookie: cookies } },
    );
    expect(verifyRes.status(), await verifyRes.text()).toBe(200);

    const orderRes = await page.request.get(`${BASE_URL}/api/admin/orders/${MANUAL_PENDING_ORDER_ID}`, {
      headers: { Cookie: cookies },
    });
    expect(orderRes.status()).toBe(200);
    const order = (await orderRes.json()).data as {
      paymentStatus: string;
      paymentRecord?: {
        method: string;
        verificationMethod: string;
        transactionId?: string;
        verifiedBy?: string;
        amountPaise: number;
      };
    };
    expect(order.paymentStatus).toBe("paid");
    expect(order.paymentRecord, "paymentRecord must be populated after manual verification").toBeTruthy();
    expect(order.paymentRecord!.method).toBe("manual");
    expect(order.paymentRecord!.verificationMethod).toBe("manual_review");
    expect(order.paymentRecord!.transactionId).toBe("UPI-DEMO-20260728-PROOF");
    expect(order.paymentRecord!.verifiedBy).toBeTruthy();

    // Idempotent — verifying an already-paid order again is a no-op, not an error.
    const secondVerify = await page.request.patch(
      `${BASE_URL}/api/admin/orders/${MANUAL_PENDING_ORDER_ID}/payment-verify`,
      { headers: { Cookie: cookies } },
    );
    expect(secondVerify.status(), await secondVerify.text()).toBe(200);
  });

  test("a pre-Feature-C order with no paymentRecord still returns a well-formed response (legacy fallback path)", async ({ page }) => {
    await loginAsAdmin(page);
    const cookies = getCookieHeader(await page.context().cookies([BASE_URL]));

    const orderRes = await page.request.get(`${BASE_URL}/api/admin/orders/${MANUAL_PAID_LEGACY_ORDER_ID}`, {
      headers: { Cookie: cookies },
    });
    expect(orderRes.status()).toBe(200);
    const order = (await orderRes.json()).data as {
      paymentStatus: string;
      paymentMethod?: string;
      paymentTransactionId?: string;
      paymentRecord?: unknown;
    };
    // Seed data predates paymentRecord — legacy fields must still be present
    // so OrderPaymentSummary's legacyFallback() has something to render.
    expect(order.paymentStatus).toBe("paid");
    expect(order.paymentMethod).toBeTruthy();
  });

  test("markCodCollected is rejected on a non-COD (cash) order", async ({ page }) => {
    await loginAsAdmin(page);
    const cookies = getCookieHeader(await page.context().cookies([BASE_URL]));

    const res = await page.request.patch(`${BASE_URL}/api/store/orders/${MANUAL_PAID_LEGACY_ORDER_ID}`, {
      headers: { Cookie: cookies, "Content-Type": "application/json" },
      data: { markCodCollected: true },
    });
    expect(res.status(), await res.text()).toBe(400);
  });
});
