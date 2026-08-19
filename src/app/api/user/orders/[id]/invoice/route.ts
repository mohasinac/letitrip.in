import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  ApiErrors,
  orderRepository,
} from "@mohasinac/appkit";
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
      if (!order) return ApiErrors.notFound("Not found");
      if (order.userId !== user!.uid && !["admin", "moderator"].includes(user!.role ?? "")) {
        return ApiErrors.forbidden("Not your order");
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
          return new Response(Buffer.from(pdfBase64, "base64"), {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="invoice-${id}.pdf"`,
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
