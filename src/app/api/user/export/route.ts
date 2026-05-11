import { withProviders } from "@/providers.config";
import { createRouteHandler, orderRepository, addressRepository } from "@mohasinac/appkit";
import { NextResponse } from "next/server";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const uid = user!.uid;

      const [orders, addresses] = await Promise.all([
        orderRepository.listForUser(uid, {}).catch(() => ({ data: [], total: 0 })),
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
        addresses: Array.isArray(addresses) ? addresses : [],
        orders: ((orders as any).data ?? []).map((o: any) => ({
          id: o.id,
          status: o.orderStatus,
          total: o.total,
          currency: o.currency,
          createdAt: o.createdAt,
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
