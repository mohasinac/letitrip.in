"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
/**
 * Admin Read Actions
 *
 * Read-only server actions for admin dashboards:
 * stats, analytics, and paginated list queries.
 *
 * Split from admin.actions.ts for maintainability.
 */

import { requireRoleUser } from "@mohasinac/appkit/providers/auth-firebase/helpers";
import { getAdminDashboardStats, getAdminAnalytics, listAdminOrders, listAdminUsers, listAdminBids, listAdminBlog, listAdminPayouts, listAdminProducts, listAdminStores, listAdminSessions } from "@mohasinac/appkit/features/admin/actions/admin-read-actions";
import type { OrderDocument } from "@mohasinac/appkit/features/orders/schemas/firestore";
import type { PayoutDocument } from "@mohasinac/appkit/features/payments/schemas/firestore";
import type { UserDocument } from "@mohasinac/appkit/features/auth/schemas/firestore";
import type { ProductDocument } from "@mohasinac/appkit/features/products/schemas/firestore";
import type { BlogPostDocument } from "@mohasinac/appkit/features/blog/schemas/firestore";
import type { StoreDocument } from "@mohasinac/appkit/features/stores/schemas/firestore";
import type { BidDocument } from "@mohasinac/appkit/features/auctions/schemas/firestore";
import type { FirebaseSieveResult } from "@mohasinac/appkit/providers/db-firebase/sieve";

// --- Dashboard & Analytics ------------------------------------------------

export async function getAdminDashboardStatsAction(): Promise<ActionResult<unknown>> {
  return wrapAction(async () => {
    await requireRoleUser(["admin", "moderator"]);
      return getAdminDashboardStats();
  });
}

export async function getAdminAnalyticsAction(): Promise<ActionResult<unknown>> {
  return wrapAction(async () => {
    await requireRoleUser(["admin", "moderator"]);
      return getAdminAnalytics();
  });
}

// --- Paginated List Queries -----------------------------------------------

export async function listAdminOrdersAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<FirebaseSieveResult<OrderDocument>>> {
  return wrapAction(async () => {
    await requireRoleUser(["admin", "moderator"]);
      return listAdminOrders(params) as Promise<FirebaseSieveResult<OrderDocument>>;
  });
}

export async function listAdminUsersAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<FirebaseSieveResult<UserDocument>>> {
  return wrapAction(async () => {
    await requireRoleUser(["admin", "moderator"]);
      return listAdminUsers(params) as Promise<FirebaseSieveResult<UserDocument>>;
  });
}

export async function listAdminBidsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<FirebaseSieveResult<BidDocument>>> {
  return wrapAction(async () => {
    await requireRoleUser(["admin", "moderator"]);
      return listAdminBids(params) as Promise<FirebaseSieveResult<BidDocument>>;
  });
}

export async function listAdminBlogAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<FirebaseSieveResult<BlogPostDocument>>> {
  return wrapAction(async () => {
    await requireRoleUser(["admin", "moderator"]);
      return listAdminBlog(params) as Promise<FirebaseSieveResult<BlogPostDocument>>;
  });
}

export async function listAdminPayoutsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<FirebaseSieveResult<PayoutDocument>>> {
  return wrapAction(async () => {
    await requireRoleUser(["admin", "moderator"]);
      return listAdminPayouts(params) as Promise<FirebaseSieveResult<PayoutDocument>>;
  });
}

export async function listAdminProductsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<FirebaseSieveResult<ProductDocument>>> {
  return wrapAction(async () => {
    await requireRoleUser(["admin", "moderator"]);
      return listAdminProducts(params) as Promise<FirebaseSieveResult<ProductDocument>>;
  });
}

export async function listAdminStoresAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<FirebaseSieveResult<StoreDocument>>> {
  return wrapAction(async () => {
    await requireRoleUser(["admin", "moderator"]);
      return listAdminStores(params) as Promise<FirebaseSieveResult<StoreDocument>>;
  });
}

export async function listAdminSessionsAction(params?: {
  userId?: string;
  limit?: number;
}): Promise<ActionResult<unknown>> {
  return wrapAction(async () => {
    await requireRoleUser(["admin", "moderator"]);
      return listAdminSessions(params);
  });
}

