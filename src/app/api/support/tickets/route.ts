import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  supportRepository,
  orderRepository,
  userRepository,
} from "@mohasinac/appkit";
import { isSoftBanned } from "@mohasinac/appkit/server";

const MAX_OPEN_TICKETS = 2;
const MAX_ORDER_TICKETS = 1;

const createSchema = z.object({
  category: z.enum([
    "order_issue",
    "billing_payment",
    "account",
    "listing_dispute",
    "scam_report",
    "refund_request",
    "auction_dispute",
    "general",
  ]),
  subject: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  orderId: z.string().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request }) => {
      const { searchParams } = new URL(request.url);
      const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
      const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));

      const result = await supportRepository.getUserTickets(user!.uid, page, pageSize);
      return successResponse(result);
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof createSchema)["_output"]>({
    auth: true,
    schema: createSchema,
    handler: async ({ user, body }) => {
      // Soft ban check
      const userDoc = await userRepository.findById(user!.uid);
      if (userDoc && isSoftBanned(userDoc, "create_support_tickets")) {
        const ban = userDoc.softBans?.find((b) => b.action === "create_support_tickets");
        return errorResponse(
          `Your account is restricted from creating support tickets. Reason: ${ban?.reason ?? "Policy violation"}. Contact support if you believe this is an error.`,
          403,
        );
      }

      const { category, subject, description, orderId } = body!;

      // General ticket limit
      if (category !== "order_issue") {
        const activeCount = await supportRepository.countActiveTickets(user!.uid);
        if (activeCount >= MAX_OPEN_TICKETS) {
          return errorResponse(
            `You already have ${MAX_OPEN_TICKETS} open tickets. Please wait for them to be resolved before opening a new one.`,
            422,
          );
        }
      }

      // Order ticket limit
      if (category === "order_issue") {
        if (!orderId) return errorResponse("orderId is required for order_issue tickets", 400);

        const order = await orderRepository.findById(orderId);
        if (!order) return errorResponse("Order not found", 404);
        if (order.userId !== user!.uid) return errorResponse("Order does not belong to you", 403);

        const ineligibleStatuses = ["DELIVERED", "CANCELLED", "REFUNDED"];
        if (ineligibleStatuses.includes(order.status)) {
          return errorResponse("Support tickets can only be opened for active orders.", 400);
        }

        const existing = await supportRepository.getActiveOrderTicket(user!.uid, orderId);
        if (existing) {
          return errorResponse("You already have an open ticket for this order.", 422);
        }
      }

      // Same-category waiting_on_user check
      const waitingTicket = await supportRepository.getActiveCategoryTicket(user!.uid, category);
      if (waitingTicket && waitingTicket.status === "waiting_on_user") {
        return errorResponse(
          "You have an unanswered question from support for this topic. Please respond to your existing ticket first.",
          422,
        );
      }

      const ticket = await supportRepository.createTicket({
        userId: user!.uid,
        userEmail: user!.email ?? "",
        userDisplayName: user!.displayName ?? "User",
        category,
        subject,
        description,
        orderId,
      });

      return successResponse(ticket, "Ticket created", 201);
    },
  }),
);
