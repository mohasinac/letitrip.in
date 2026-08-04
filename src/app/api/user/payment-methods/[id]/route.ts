import { withProviders } from "@/providers.config";
/**
 * User Payment Methods API — Individual method
 *
 * DELETE /api/user/payment-methods/[id]  — Remove a saved payment method
 * PUT    /api/user/payment-methods/[id]  — Request unban via banStatus:"unban_requested"
 */

import { savedPaymentMethodsRepository } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * DELETE /api/user/payment-methods/[id]
 */
export const DELETE = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user, request }) => {
    const { id } = await (request as unknown as RouteContext).params;
    const method = await savedPaymentMethodsRepository.findById(id);
    if (!method || method.userId !== user!.uid) {
      return errorResponse("Payment method not found", 404);
    }
    if (method.banStatus === "banned") {
      return errorResponse("Banned payment methods cannot be deleted — contact support.", 403);
    }
    await savedPaymentMethodsRepository.deleteForUser(user!.uid, id);
    return successResponse(null, "Payment method removed.");
  },
}));

/**
 * PUT /api/user/payment-methods/[id]
 *
 * Users may request an unban by sending { banStatus: "unban_requested", unbanRequestNote: "..." }.
 */
export const PUT = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user, request }) => {
    const { id } = await (request as unknown as RouteContext).params;
    const method = await savedPaymentMethodsRepository.findById(id);
    if (!method || method.userId !== user!.uid) {
      return errorResponse("Payment method not found", 404);
    }

    const body = await request!.json().catch(() => ({})) as Record<string, unknown>;
    const { banStatus, unbanRequestNote } = body as { banStatus?: string; unbanRequestNote?: string };

    if (banStatus !== "unban_requested" || method.banStatus !== "banned") {
      return errorResponse("Invalid request", 400);
    }

    const updated = await savedPaymentMethodsRepository.update(id, {
      banStatus: "unban_requested",
      ...(typeof unbanRequestNote === "string" && unbanRequestNote.trim()
        ? { unbanRequestNote: unbanRequestNote.trim(), unbanRequestedAt: new Date() }
        : {}),
    } as Parameters<typeof savedPaymentMethodsRepository.update>[1]);

    return successResponse(updated, "Unban request submitted.");
  },
}));
