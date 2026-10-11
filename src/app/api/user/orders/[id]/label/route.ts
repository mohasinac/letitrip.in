import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  ApiErrors,
  orderRepository,
} from "@mohasinac/appkit";
import { ROLES_AUTHENTICATED } from "@/constants";

/**
 * Shipping label PDF — returned by the shipping provider (Shiprocket) once an
 * order has a tracking number. Falls back to a plain summary if no label URL.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const order = await orderRepository.findById(id);
      if (!order) return ApiErrors.notFound("Not found");
      if (order.userId !== user!.uid && !["admin", "moderator", "seller"].includes(user!.role ?? "")) {
        return ApiErrors.forbidden("Not authorised");
      }
      /*
       * 🛑 No cast. `shippingLabelUrl` is declared on `OrderDocument` as of
       * 2026-10-11; reading it through `(order as { … })` is what let a field
       * on no schema, with no writer, look like a working feature for as long
       * as it did. The route's 404 is still correct for every order today —
       * nothing writes a label yet — but the compiler now owns that fact.
       */
      const labelUrl = order.shippingLabelUrl;
      if (labelUrl) {
        const res = await fetch(labelUrl);
        return new Response(res.body, {
          status: res.status,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="label-${id}.pdf"`,
          },
        });
      }
      return new Response(`No shipping label yet for ${id}.`, {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    },
  }),
);
