import { withProviders } from "@/providers.config";
import { addressesRepository } from "@mohasinac/appkit/features/addresses/repository/addresses.repository";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { orderRepository } from "@mohasinac/appkit";
import type { OrderDocument } from "@mohasinac/appkit/features/orders/schemas/firestore";
import type { FirebaseSieveResult } from "@mohasinac/appkit/providers/db-firebase/sieve";
import { safeRead, getBuyerActivityStats } from "@mohasinac/appkit/server";
import { NextResponse } from "next/server";

const EMPTY_ORDER_RESULT: FirebaseSieveResult<OrderDocument> = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 0,
  totalPages: 0,
  hasMore: false,
};

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const uid = user!.uid;

      /*
       * The PROFILE comes from the document, not the session.
       *
       * A data export is the one response where "close enough" is least
       * acceptable — it is what a user receives when they ask what is held about
       * them. Reading `user!` returned the session's view, so a renamed display
       * name, a changed avatar, an edited bio and the whole `publicProfile`
       * sub-object exported as stale values or as `undefined`.
       *
       * Fetched alongside the existing reads rather than after them, so the
       * round-trip count is unchanged (Rule #6).
       */
      const [orders, addresses, profile] = await Promise.all([
        orderRepository.listForUser(uid, {}).catch(() => EMPTY_ORDER_RESULT),
        safeRead(() => addressesRepository.listByOwner("user", uid), {
          route: "/api/user/export",
          key: "addresses.listByOwner",
          fallback: [],
        }),
        safeRead(() => userRepository.findById(uid), {
          route: "/api/user/export",
          key: "userRepository.findById",
          fallback: null,
        }),
      ]);

      const payload = {
        exportedAt: new Date().toISOString(),
        profile: {
          uid,
          email: user!.email,
          displayName: profile?.displayName ?? user!.displayName,
          photoURL: profile?.photoURL ?? user!.photoURL,
          phoneNumber: profile?.phoneNumber ?? user!.phoneNumber,
          role: profile?.role ?? user!.role,
          createdAt: profile?.createdAt ?? user!.createdAt,
          publicProfile: profile?.publicProfile ?? user!.publicProfile,
          // DERIVED. The stored `stats` field has no writer and would have
          // handed the account holder seeded numbers in their own data export
          // — the one place they are most likely to be believed.
          stats: await getBuyerActivityStats(uid),
        },
        addresses,
        orders: orders.items.map((o) => ({
          id: o.id,
          status: o.status,
          total: o.totalPrice,
          currency: o.currency,
          orderDate: o.orderDate instanceof Date ? o.orderDate.toISOString() : o.orderDate,
          items: o.items,
        })),
      };

      return new NextResponse(JSON.stringify(payload, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="letitrip-data-${uid.slice(0, 8)}.json"`,
        },
      });
    },
  }),
);