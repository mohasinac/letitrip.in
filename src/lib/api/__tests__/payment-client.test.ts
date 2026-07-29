import { describe, test, expect, vi, beforeEach } from "vitest";
import { attachPaymentProof } from "../payment-client";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("payment-client typed wrappers", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  test("attachPaymentProof calls POST /api/orders/:id/payment-proof", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    const result = await attachPaymentProof("order-1", {
      proofUrl: "/media/proof.jpg",
      transactionId: "UTR123",
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/orders/order-1/payment-proof",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ proofUrl: "/media/proof.jpg", transactionId: "UTR123" }),
      }),
    );
    expect(result.ok).toBe(true);
  });

  test("attachPaymentProof returns { ok: false, code } on 409", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ok: false, code: "PROOF_ALREADY_ATTACHED", error: "Already attached" }),
        { status: 409 },
      ),
    );
    const result = await attachPaymentProof("order-1", { proofUrl: "/media/proof.jpg" });
    expect(result.ok).toBe(false);
    expect(result.code).toBe("PROOF_ALREADY_ATTACHED");
  });

  test("attachPaymentProof returns { ok: false } on 403", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: false, error: "Forbidden" }), { status: 403 }),
    );
    const result = await attachPaymentProof("order-1", { proofUrl: "/media/proof.jpg" });
    expect(result.ok).toBe(false);
  });

  test("attachPaymentProof includes mimeType when provided", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    await attachPaymentProof("order-2", {
      proofUrl: "/media/proof.pdf",
      mimeType: "application/pdf",
    });
    const call = mockFetch.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(call.body as string) as { mimeType: string };
    expect(body.mimeType).toBe("application/pdf");
  });
});
