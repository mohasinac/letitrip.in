import { withProviders } from "@/providers.config";
import { createRouteHandler, orderRepository, addressRepository } from "@mohasinac/appkit";
import type { FirebaseSieveResult, OrderDocument } from "@mohasinac/appkit";
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

      const [orders, addresses] = await Promise.all([
        orderRepository.listForUser(uid, {}).catch(() => EMPTY_ORDER_RESULT),
        addressRepository.findByUser(uid).catch(() => []),
      ]);

      const payload = {
        exportedAt: new Date().toISOString(),
        profile: {
          uid,
          email: user!.email,
          displayName: user!.displayName,
          photoURL: user!.photoURL,
          phoneNumber: user!.phoneNumber,
          role: user!.role,
          createdAt: user!.createdAt,
          publicProfile: user!.publicProfile,
          stats: user!.stats,
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
