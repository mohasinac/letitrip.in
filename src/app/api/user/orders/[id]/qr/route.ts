import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  ApiErrors,
  orderRepository,
} from "@mohasinac/appkit";

/**
 * QR code PDF/PNG — returns a QR linking to the order's public tracking page.
 * Generated via the QR Firebase Function; falls back to a redirect to a public
 * QR provider URL in dev.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["user", "seller", "moderator", "admin"],
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const order = await orderRepository.findById(id);
      if (!order) return ApiErrors.notFound("Not found");
      if (order.userId !== user!.uid && !["admin", "moderator", "seller"].includes(user!.role ?? "")) {
        return ApiErrors.forbidden("Not authorised");
      }
      const trackUrl = `https://letitrip.in/track/${encodeURIComponent(id)}`;
      const qrServiceUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(trackUrl)}`;
      return Response.redirect(qrServiceUrl, 302);
    },
  }),
);
