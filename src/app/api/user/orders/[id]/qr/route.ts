import { withProviders } from "@/providers.config";
import { ApiErrors } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { SEO_CONFIG } from "@/constants/seo";
import { orderRepository } from "@mohasinac/appkit";
import { ROLES_AUTHENTICATED } from "@/constants";

/**
 * QR code PDF/PNG — returns a QR linking to the order's public tracking page.
 * Generated via the QR Firebase Function; falls back to a redirect to a public
 * QR provider URL in dev.
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
      // Apex hardcoded here meant every PRINTED QR encoded a URL that 308-redirects
      // — a redirect a paper label cannot be re-issued to avoid.
      const trackUrl = `${SEO_CONFIG.siteUrl}/track/${encodeURIComponent(id)}`;
      const qrServiceUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(trackUrl)}`;
      return Response.redirect(qrServiceUrl, 302);
    },
  }),
);
