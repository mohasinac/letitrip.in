import { withProviders } from "@/providers.config";
/**
 * User Payment Methods API — Collection
 *
 * GET  /api/user/payment-methods  — List saved payment methods
 * POST /api/user/payment-methods  — Save a new payment method (upsert by identifierHash)
 */

import { savedPaymentMethodsRepository } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { z } from "zod";

const saveMethodSchema = z.object({
  type: z.enum(["upi", "card", "bank_account", "wallet"]),
  identifier: z.string().min(1, "Identifier required"),
  displayLabel: z.string().min(1, "Display label required"),
  isDefault: z.boolean().optional(),
});

/**
 * GET /api/user/payment-methods
 *
 * Returns saved payment methods for the authenticated user.
 * The `identifier` field is stripped (displayLabel is safe for rendering).
 * Supports ?type= filter.
 */
export const GET = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user, request }) => {
    const url = new URL(request!.url);
    const typeFilter = url.searchParams.get("type") ?? "";

    let methods = await savedPaymentMethodsRepository.listByUser(user!.uid);

    if (typeFilter) {
      methods = methods.filter((m) => m.type === typeFilter);
    }

    return successResponse(methods);
  },
}));

/**
 * POST /api/user/payment-methods
 *
 * Saves a payment method for the user. Idempotent: if the same identifier
 * hash + userId already exists, it updates `lastUsedAt` and returns the doc.
 * The identifier is encrypted at rest; only `displayLabel` is safe to display.
 */
export const POST = withProviders(createRouteHandler<(typeof saveMethodSchema)["_output"]>({
  auth: true,
  schema: saveMethodSchema,
  handler: async ({ user, body }) => {
    // Check if this identifier is banned before saving
    const hash = savedPaymentMethodsRepository.computeIdentifierHash(body!.type, body!.identifier);
    const existing = await savedPaymentMethodsRepository.listByIdentifierHash(hash);
    const banned = existing.find((m) => m.banStatus === "banned");
    if (banned) {
      return errorResponse("This payment method has been flagged and cannot be used.", 403, { code: "PAYMENT_METHOD_BANNED" });
    }

    const method = await savedPaymentMethodsRepository.upsertForUser(user!.uid, {
      type: body!.type,
      identifier: body!.identifier,
      displayLabel: body!.displayLabel,
      isDefault: body!.isDefault,
    });

    return successResponse(method, "Payment method saved.", 201);
  },
}));
