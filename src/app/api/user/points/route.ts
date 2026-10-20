import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { pointsRepository } from "@mohasinac/appkit/server";
import { withProviders } from "@/providers.config";

/**
 * The signed-in buyer's points balance and recent entries.
 *
 * GET /api/user/points
 *
 * 🛑 Scoped to `user.uid` from the session, with no id accepted from the
 * caller. A points balance is financial-shaped data about one person, and an
 * endpoint that takes a userId is one missing ownership check away from
 * publishing everyone's. There is no admin variant here on purpose — admin
 * adjustments belong on an admin route with its own permission.
 *
 * ## 🛑 Why this does NOT delegate to `listingProcessor`
 *
 * `audit-listing-delegation` flags the `listForUser` call, and its suggested
 * fix — `executor: listingProcessorFirstExecutor` — does not apply here.
 *
 * That option belongs to `BaseRepository.list(model, opts)`, the Sieve path.
 * `listForUser` is not that: it is a hand-written Firestore query taking
 * `(userId, limit)`, with no `opts` bag to put an executor in. Passing one
 * would not compile, and widening the signature to accept it would be the
 * first half of a change whose second half does not exist — **there is no
 * `points` lister in the Function's `LISTERS`**, so a delegated call would
 * have nothing to delegate TO.
 *
 * So this is one of the routes CLAUDE.md names explicitly: *"twelve of the 59
 * also need a new lister in the Function before they can delegate at all,
 * which means a Functions deploy before anything can be tested."* Doing it
 * properly is: add the lister, deploy Functions, then convert and verify —
 * and the audit's own header is an ARGUMENT against doing that in bulk,
 * because the only failure mode is silent semantic divergence that is
 * verifiable solely in production. On a ledger, a query that quietly returns
 * a different row set is the worst possible thing to discover there.
 *
 * The cost this audit exists to prevent is also not present. It guards
 * unbounded reads billed against the 10s ceiling; this is ONE equality on an
 * indexed field, ordered, hard-capped at 50 documents, for a single signed-in
 * user — about as far inside Rule #6's budget as a list read gets.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const uid = user!.uid;
      /*
       * Balance and entries in parallel — two independent reads, and the
       * balance comes from the mirror (one document) rather than summing the
       * ledger, so this stays inside Rule #6's round-trip budget even for a
       * buyer with a long history.
       */
      const [balance, entries] = await Promise.all([
        pointsRepository.getBalance(uid),
        // audit-listing-delegation-ok: not a Sieve list() — `listForUser` is a raw bounded query (userId == uid, orderBy createdAt desc, limit 50) that accepts no executor, and no `points` lister exists in the Function, so delegating needs a new lister + a Functions deploy before it could even be tested. See the note below.
        pointsRepository.listForUser(uid, 50),
      ]);

      return successResponse({
        balance,
        /*
         * `adminReason` is stripped. It is written for operators and its own
         * schema comment says it is never shown to the buyer — projecting the
         * whole document would publish it the moment anyone adds one
         * (Root Cause #70: a response built by spreading a document is
         * public-by-default).
         */
        entries: entries.map((e) => ({
          id: e.id,
          kind: e.kind,
          amount: e.amount,
          description: e.description,
          orderId: e.orderId,
          createdAt: e.createdAt,
        })),
      });
    },
  }),
);
