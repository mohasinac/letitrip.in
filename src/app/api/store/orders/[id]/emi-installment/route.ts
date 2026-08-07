import { withProviders } from "@/providers.config";
import { createRouteHandler, successResponse, errorResponse, parseJsonBody } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";
import { markEmiInstallmentPaidAction } from "@/actions/seller.actions";

export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ request, params }) => {
      const id = (params as { id: string }).id;
      const body = await parseJsonBody(request, { allowEmpty: true }).catch(() => ({}));
      const result = await markEmiInstallmentPaidAction(id, body as never);
      if (!result.ok) return errorResponse(result.error ?? "Failed to mark installment paid", 400);
      return successResponse(result.data);
    },
  }),
);
