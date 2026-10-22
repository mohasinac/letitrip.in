import { withProviders } from "@/providers.config";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { supportRepository } from "@mohasinac/appkit/features/support/repository/support.repository";
import { supportTicketCreateSchema } from "@mohasinac/appkit/features/support/schemas/ticket-create-form";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { orderRepository } from "@mohasinac/appkit";
import { isSoftBanned } from "@mohasinac/appkit/server";
import { isIntegrationEnabled, withIntegrationEnabled } from "@/lib/integration-gate";

const MAX_OPEN_TICKETS = 2;
/*
 * 🛑 `_MAX_ORDER_TICKETS = 1` DELETED — F1 #22. Declared, underscore-prefixed
 * so lint stayed quiet, and read by nothing: it implied "one ticket per order"
 * was enforced somewhere, and nothing enforced it anywhere. Capping tickets per
 * order is a product decision (a buyer with a second, unrelated problem on one
 * order would be blocked by it), so the fix is to remove the claim rather than
 * to invent the rule it describes.
 */

/*
 * The SHARED schema, not a local one. This route's own copy agreed on the four
 * field rules and was missing the fifth: an `order_issue` ticket needs an
 * `orderId`. Only `/user/support/new` enforced that, and its sibling drawer
 * enforced nothing — so the same ticket was acceptable or not depending on
 * which surface the user opened. The shared schema carries the refine.
 */
const createSchema = supportTicketCreateSchema;

const __GET__g = withProviders(
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

/*
 * 🛑 The READ is gated too, not only the write.
 *
 * The owner chose the widest reading of "support off": the whole buyer-facing
 * ticket surface disappears. Gating only the POST would leave a buyer looking
 * at their ticket list with no way to reply — worse than not showing it, and
 * not what the switch says it does.
 *
 * This is a BUYER route (`auth: true`, scoped to `user.uid` by
 * `getUserTickets`). Staff read tickets through `/api/admin/support-tickets`,
 * which is NOT gated — so an open ticket stays workable by staff while
 * invisible to the buyer, which is what makes the employee pay-per-ticket
 * basis survive the switch.
 *
 * Fails OPEN on an unreadable settings document (`failClosed: false` on the
 * support descriptor): taking support away because Firestore hiccupped is the
 * worse error.
 */
export const GET = withIntegrationEnabled("support", __GET__g);

export const POST = withProviders(
  createRouteHandler<(typeof createSchema)["_output"]>({
    auth: true,
    schema: createSchema,
    handler: async ({ user, body }) => {
      const { category, subject, description, orderId } = body!;

      /*
       * 🛑 THE SUPPORT KILL SWITCH, enforced on the WRITE.
       *
       * `siteSettings.support.enabled === false` hides the whole buyer-facing
       * support surface — but hiding nav is decorative on its own: the page is
       * a client component, so a bookmarked URL still loads and could still
       * POST. The switch has to stop the FUNCTION, which is here.
       *
       * 🛑 `unban_request` is EXEMPT, and that exemption is the important part.
       * It is the formal appeal channel (ST-5) and already bypasses both the
       * soft-ban guard and the ticket cap for exactly one reason: a user must
       * never be locked out of appealing. Letting an integration toggle do what
       * a soft ban is explicitly forbidden from doing would make the appeal
       * channel closable by accident.
       *
       * Fails OPEN on an unreadable settings document — refusing support
       * because Firestore hiccupped is worse than briefly allowing a ticket
       * nobody wanted, and it matches `guardSend`'s choice on the same read.
       * That direction comes off the support descriptor's `failClosed: false`
       * rather than being decided here.
       *
       * 🛑 Inside the handler, NOT the `withIntegrationEnabled` wrapper the GET
       * uses — the exemption depends on `category`, which only exists after the
       * body is parsed. So this is the one place the guard is called directly,
       * and it still resolves through the same expression.
       *
       * 503 here, where the wrapper answers 404: this caller has been let
       * through the surface and is mid-action, so "temporarily unavailable" is
       * the honest answer and names a next step. A 404 would read as "that
       * form is broken".
       */
      if (category !== "unban_request" && !(await isIntegrationEnabled("support"))) {
        return errorResponse(
          "Support is temporarily unavailable. Please check the Help Center for answers in the meantime.",
          503,
          { code: "SUPPORT_DISABLED" },
        );
      }
      // ST-5 — `unban_request` is the formal appeal channel. It bypasses the
      // create_support_tickets soft-ban guard AND the active-ticket limit so
      // a soft-banned user (or one already at the ticket cap) can still file
      // an appeal.
      const isUnbanRequest = category === "unban_request";

      // Soft ban check (skipped for unban_request appeals)
      if (!isUnbanRequest) {
        const userDoc = await userRepository.findById(user!.uid);
        if (userDoc && isSoftBanned(userDoc, "create_support_tickets")) {
          const ban = userDoc.softBans?.find((b) => b.action === "create_support_tickets");
          return errorResponse(
            `Your account is restricted from creating support tickets. Reason: ${ban?.reason ?? "Policy violation"}. Open an "Appeal a ban" ticket if you believe this is an error.`,
            403,
          );
        }
      }

      // General ticket limit (skipped for unban_request appeals)
      if (category !== "order_issue" && !isUnbanRequest) {
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