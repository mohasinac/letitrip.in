import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  ApiErrors,
  orderRepository,
} from "@mohasinac/appkit";

/**
 * Invoice PDF endpoint — returns a server-rendered PDF for the order.
 * Heavy PDF generation belongs in a Firebase Function (Hobby 10s ceiling);
 * this route delegates by streaming from the function URL. For unsigned dev
 * environments where the function isn't deployed, we return a plaintext
 * invoice summary so the download flow still works end-to-end.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["user", "seller", "moderator", "admin"],
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const order = await orderRepository.findById(id);
      if (!order) return ApiErrors.notFound("Not found");
      if (order.userId !== user!.uid && !["admin", "moderator"].includes(user!.role ?? "")) {
        return ApiErrors.forbidden("Not your order");
      }
      const fnUrl = process.env.NEXT_PUBLIC_INVOICE_PDF_FUNCTION_URL;
      if (fnUrl) {
        const res = await fetch(`${fnUrl}?orderId=${encodeURIComponent(id)}`, {
          headers: { Accept: "application/pdf" },
        });
        return new Response(res.body, {
          status: res.status,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="invoice-${id}.pdf"`,
          },
        });
      }
      const fallback = [
        `Invoice ${id}`,
        `Buyer: ${order.userId}`,
        `Total: Rs ${((order.totalPrice ?? 0) / 100).toFixed(2)}`,
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
