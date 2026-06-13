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
// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
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
      const labelUrl = (order as { shippingLabelUrl?: string }).shippingLabelUrl;
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
