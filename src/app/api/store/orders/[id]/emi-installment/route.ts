import { withProviders } from "@/providers.config";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_STORE_WRITE } from "@/constants";
import { markEmiInstallmentPaidAction } from "@/actions/seller.actions";
import { markEmiInstallmentPaidSchema } from "@mohasinac/appkit/features/seller/schemas/order-forms";

export const PATCH = withProviders(
  createRouteHandler<(typeof markEmiInstallmentPaidSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    /*
     * `installmentIndex` is required, so the old `allowEmpty: true` +
     * `.catch(() => ({}))` only ever deferred the same rejection to the
     * action — marking an installment paid with no index was never valid.
     */
    schema: markEmiInstallmentPaidSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const result = await markEmiInstallmentPaidAction(id, body!);
      if (!result.ok) return errorResponse(result.error ?? "Failed to mark installment paid", 400);
      return successResponse(result.data);
    },
  }),
);
