/**
 * POST /api/admin/orders/[id]/refund
 *
 * Admin-only: issue a partial (net of processing fees) or full refund.
 * Body: { deductFees: boolean; refundNote?: string }
 */

import { z } from "zod";
import { successResponse } from "@/lib/api-response";
import { createApiHandler } from "@/lib/api/api-handler";
import { adminPartialRefundAction } from "@/actions";
import { SUCCESS_MESSAGES } from "@/constants";

const refundSchema = z.object({
  deductFees: z.boolean().default(true),
  refundNote: z.string().max(500).optional(),
});

export const POST = createApiHandler<
  z.infer<typeof refundSchema>,
  { id: string }
>({
  auth: true,
  roles: ["admin"],
  schema: refundSchema,
  handler: async ({ body, params }) => {
    const result = await adminPartialRefundAction({
      orderId: params!.id,
      deductFees: body!.deductFees,
      refundNote: body?.refundNote,
    });
    return successResponse(
      result,
      SUCCESS_MESSAGES.ORDER?.REFUNDED ?? "Refund initiated",
    );
  },
});
