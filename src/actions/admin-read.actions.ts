"use server";

/**
 * Admin Read Actions
 *
 * Read-only server actions for admin dashboards:
 * stats, analytics, and paginated list queries.
 *
 * Split from admin.actions.ts for maintainability.
 */

import { requireRole } from "@/lib/firebase/auth-server";
import {
  sessionRepository,
  orderRepository,
  userRepository,
  productRepository,
  blogRepository,
  storeRepository,
  bidRepository,
  payoutRepository,
} from "@/repositories";
import type {
  OrderDocument,
  PayoutDocument,
  UserDocument,
  ProductDocument,
  BlogPostDocument,
  StoreDocument,
  BidDocument,
} from "@/db/schema";
import type { FirebaseSieveResult } from "@/lib/query";
import { formatMonthYear } from "@/utils";

// ─── Dashboard & Analytics ────────────────────────────────────────────────

export async function getAdminDashboardStatsAction() {
  await requireRole(["admin", "moderator"]);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [
    totalUsers,
    activeUsers,
    newUsers,
    disabledUsers,
    adminUsers,
    totalProducts,
    totalOrders,
  ] = await Promise.all([
    userRepository.count().catch(() => 0),
    userRepository.countActive().catch(() => 0),
    userRepository.countNewSince(thirtyDaysAgo).catch(() => 0),
    userRepository.countDisabled().catch(() => 0),
    userRepository.countByRole("admin").catch(() => 0),
    productRepository.count().catch(() => 0),
    orderRepository.count().catch(() => 0),
  ]);
  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      new: newUsers,
      newThisMonth: newUsers,
      disabled: disabledUsers,
      admins: adminUsers,
    },
    products: { total: totalProducts },
    orders: { total: totalOrders },
  };
}

export async function getAdminAnalyticsAction() {
  await requireRole(["admin", "moderator"]);
  const [allOrders, allProducts] = await Promise.all([
    orderRepository.findAll(),
    productRepository.findAll(),
  ]);
  const totalOrders = allOrders.length;
  const totalRevenue = allOrders.reduce(
    (sum, o) => sum + (o.totalPrice ?? 0),
    0,
  );
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthOrders = allOrders.filter(
    (o) => new Date(o.createdAt as any) >= monthStart,
  );
  const newOrdersThisMonth = thisMonthOrders.length;
  const revenueThisMonth = thisMonthOrders.reduce(
    (sum, o) => sum + (o.totalPrice ?? 0),
    0,
  );

  const monthMap = new Map<
    string,
    { month: string; orders: number; revenue: number }
  >();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, { month: formatMonthYear(d), orders: 0, revenue: 0 });
  }
  for (const order of allOrders) {
    const d = new Date(order.createdAt as any);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthMap.has(key)) {
      const e = monthMap.get(key)!;
      e.orders += 1;
      e.revenue += order.totalPrice ?? 0;
    }
  }
  const ordersByMonth = Array.from(monthMap.values());
  const revenueByProduct = new Map<
    string,
    { productId: string; title: string; revenue: number; orders: number }
  >();
  for (const order of allOrders) {
    const ex = revenueByProduct.get(order.productId);
    if (ex) {
      ex.revenue += order.totalPrice ?? 0;
      ex.orders += 1;
    } else
      revenueByProduct.set(order.productId, {
        productId: order.productId,
        title: order.productTitle,
        revenue: order.totalPrice ?? 0,
        orders: 1,
      });
  }
  const topProducts = Array.from(revenueByProduct.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((p) => {
      const prod = allProducts.find((pr) => pr.id === p.productId);
      return { ...p, mainImage: prod?.mainImage ?? "" };
    });
  return {
    summary: {
      totalOrders,
      totalRevenue,
      newOrdersThisMonth,
      revenueThisMonth,
      totalProducts: allProducts.length,
      publishedProducts: allProducts.filter((p) => p.status === "published")
        .length,
    },
    ordersByMonth,
    topProducts,
  };
}

// ─── Paginated List Queries ───────────────────────────────────────────────

export async function listAdminOrdersAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<OrderDocument>> {
  await requireRole(["admin", "moderator"]);
  return orderRepository.listAll({
    filters: params?.filters,
    sorts: params?.sorts ?? "-createdAt",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 50,
  });
}

export async function listAdminUsersAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<UserDocument>> {
  await requireRole(["admin", "moderator"]);
  return userRepository.list({
    filters: params?.filters,
    sorts: params?.sorts ?? "-createdAt",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 50,
  });
}

export async function listAdminBidsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<BidDocument>> {
  await requireRole(["admin", "moderator"]);
  return bidRepository.list({
    filters: params?.filters,
    sorts: params?.sorts ?? "-createdAt",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 50,
  });
}

export async function listAdminBlogAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<BlogPostDocument>> {
  await requireRole(["admin", "moderator"]);
  return blogRepository.listAll({
    filters: params?.filters,
    sorts: params?.sorts ?? "-createdAt",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 50,
  });
}

export async function listAdminPayoutsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<PayoutDocument>> {
  await requireRole(["admin", "moderator"]);
  return payoutRepository.list({
    filters: params?.filters,
    sorts: params?.sorts ?? "-createdAt",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 50,
  });
}

export async function listAdminProductsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<ProductDocument>> {
  await requireRole(["admin", "moderator"]);
  return productRepository.list({
    filters: params?.filters,
    sorts: params?.sorts ?? "-createdAt",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 50,
  });
}

export async function listAdminStoresAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<StoreDocument>> {
  await requireRole(["admin", "moderator"]);
  return storeRepository.listAllStores({
    filters: params?.filters,
    sorts: params?.sorts ?? "-createdAt",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 50,
  });
}

export async function listAdminSessionsAction(params?: {
  userId?: string;
  limit?: number;
}) {
  await requireRole(["admin", "moderator"]);
  return sessionRepository.findAllForAdmin({
    userId: params?.userId,
    limit: params?.limit ?? 100,
  });
}
