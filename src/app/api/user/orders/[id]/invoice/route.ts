import { withProviders } from "@/providers.config";
import { ApiErrors } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { orderRepository } from "@mohasinac/appkit";
/* Phase 7 — the stored bytes. From `@mohasinac/appkit/server` because
 * `_internal/*` is not a published subpath; `server.ts` is the sanctioned
 * door for these (the same wall `cancelOrderWithRefund` hit). */
import { readStoredInvoice, storeRenderedInvoice } from "@mohasinac/appkit/server";
import { ROLES_AUTHENTICATED } from "@/constants";

/**
 * Invoice PDF endpoint — returns a server-rendered PDF for the order.
 * Heavy PDF generation belongs in a Firebase Function (Hobby 10s ceiling);
 * this route delegates to the `invoicePdf` Function (functions/src/invoice-pdf.ts),
 * which returns { pdfBase64 } JSON (the shared bindHttps adapter only supports
 * JSON responses). For unsigned dev environments where the function isn't
 * deployed / configured, we return a plaintext invoice summary so the
 * download flow still works end-to-end.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const order = await orderRepository.findById(id);
      /*
       * 🛑 404 FOR BOTH "does not exist" AND "not yours" — NEVER 403.
       *
       * An order id is short and guessable, so 403 vs 404 is a membership
       * oracle: 403 confirms an order with that id EXISTS, and an attacker can
       * enumerate the id space without ever seeing a byte of order data.
       *
       * This route answered `403 {"code":"FORBIDDEN","error":"Not your order"}`
       * while its own sibling GET /api/user/orders/[id] answered 404 for the
       * identical condition — measured live against a real foreign order. Two
       * endpoints over the same record disagreeing is the tell; the stricter
       * one is right.
       *
       * The two branches are deliberately collapsed into one indistinguishable
       * response. Keeping them separate but both 404 would still leak through
       * timing and message text.
       */
      const mayRead =
        !!order &&
        (order.userId === user!.uid || ["admin", "moderator"].includes(user!.role ?? ""));
      if (!mayRead) return ApiErrors.notFound("Not found");

      /*
       * ── PHASE 7: serve the STORED bytes when they exist ──────────────────
       *
       * 🛑 Stored rather than re-rendered, because two renders can disagree —
       * a changed template, a different library version, a settings read that
       * moved — and the buyer's copy must be byte-identical to ours. An
       * invoice that renders differently on each download is not a document.
       *
       * The filename uses the INVOICE NUMBER when there is one, so a buyer's
       * downloads folder and their accountant's spreadsheet say the same
       * thing.
       */
      const invoiceFilename = order.invoiceNumber
        ? `${order.invoiceNumber.replace(/\//g, "-")}.pdf`
        : `invoice-${id}.pdf`;

      const stored = await readStoredInvoice(order.invoiceStoragePath);
      if (stored) {
        return new Response(new Uint8Array(stored), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${invoiceFilename}"`,
            // An invoice is one buyer's name, address and phone — never
            // cacheable by anything between us and them.
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }

      const fnUrl = process.env.NEXT_PUBLIC_INVOICE_PDF_FUNCTION_URL;
      const secret = process.env.LETITRIP_INTERNAL_SECRET;
      if (fnUrl && secret) {
        const res = await fetch(fnUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-internal-secret": secret },
          body: JSON.stringify({ orderId: id }),
        });
        if (res.ok) {
          const { pdfBase64 } = (await res.json()) as { pdfBase64: string };
          const bytes = Buffer.from(pdfBase64, "base64");
          /*
           * 🛑 Store what we just rendered, but ONLY for a numbered order.
           *
           * An un-numbered order is still pending payment; persisting a PDF
           * for it would freeze a pre-payment snapshot as "the invoice" and
           * then the real issuance would find a path already set and never
           * replace it.
           *
           * Fire-and-forget: the buyer gets their download either way, and a
           * storage failure here is a performance regression (the next
           * download re-renders), not a correctness one. Awaiting it would
           * put a bucket write on the critical path of a download, against
           * Rule #6's 10s ceiling.
           */
          if (order.invoiceNumber && !order.invoiceStoragePath) {
            void storeRenderedInvoice(order.id, bytes).catch(() => undefined);
          }
          return new Response(bytes, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${invoiceFilename}"`,
              "Cache-Control": "private, no-store",
              "X-Content-Type-Options": "nosniff",
            },
          });
        }
      }
      const fallback = [
        `Invoice ${id}`,
        `Buyer: ${order.userId}`,
        `Total: Rs ${(order.totalPrice ?? 0).toFixed(2)}`,
        `Status: ${order.status}`,
        `Created: ${new Date(order.orderDate ?? Date.now()).toLocaleString()}`,
      ].join("\n");
      return new Response(fallback, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `inline; filename="invoice-${id}.txt"`,
        },
      });
    },
  }),
);
