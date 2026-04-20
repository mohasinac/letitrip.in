"use server";

/**
 * Admin Read Actions
 *
 * Read-only server actions for admin dashboards:
 * stats, analytics, and paginated list queries.
 *
 * Split from admin.actions.ts for maintainability.
 */

import { requireRoleUser } from "@mohasinac/appkit";
import {
  getAdminDashboardStats,
  getAdminAnalytics,
  listAdminOrders,
  listAdminUsers,
  listAdminBids,
  listAdminBlog,
  listAdminPayouts,
  listAdminProducts,
  listAdminStores,
  listAdminSessions,
} from "@mohasinac/appkit";
import type { OrderDocument } from "@mohasinac/appkit";
import type { PayoutDocument } from "@mohasinac/appkit";
import type { UserDocument } from "@mohasinac/appkit";
import type { ProductDocument } from "@mohasinac/appkit";
import type { BlogPostDocument } from "@mohasinac/appkit";
import type { StoreDocument } from "@mohasinac/appkit";
import type { BidDocument } from "@mohasinac/appkit";
import type { FirebaseSieveResult } from "@mohasinac/appkit";

// ─── Dashboard & Analytics ────────────────────────────────────────────────

export async function getAdminDashboardStatsAction() {
  await requireRoleUser(["admin", "moderator"]);
  return getAdminDashboardStats();
}

export async function getAdminAnalyticsAction() {
  await requireRoleUser(["admin", "moderator"]);
  return getAdminAnalytics();
}

// ─── Paginated List Queries ───────────────────────────────────────────────

export async function listAdminOrdersAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<OrderDocument>> {
  await requireRoleUser(["admin", "moderator"]);
  return listAdminOrders(params) as Promise<FirebaseSieveResult<OrderDocument>>;
}

export async function listAdminUsersAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<UserDocument>> {
  await requireRoleUser(["admin", "moderator"]);
  return listAdminUsers(params) as Promise<FirebaseSieveResult<UserDocument>>;
}

export async function listAdminBidsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<BidDocument>> {
  await requireRoleUser(["admin", "moderator"]);
  return listAdminBids(params) as Promise<FirebaseSieveResult<BidDocument>>;
}

export async function listAdminBlogAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<BlogPostDocument>> {
  await requireRoleUser(["admin", "moderator"]);
  return listAdminBlog(params) as Promise<FirebaseSieveResult<BlogPostDocument>>;
}

export async function listAdminPayoutsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<PayoutDocument>> {
  await requireRoleUser(["admin", "moderator"]);
  return listAdminPayouts(params) as Promise<FirebaseSieveResult<PayoutDocument>>;
}

export async function listAdminProductsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<ProductDocument>> {
  await requireRoleUser(["admin", "moderator"]);
  return listAdminProducts(params) as Promise<FirebaseSieveResult<ProductDocument>>;
}

export async function listAdminStoresAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<StoreDocument>> {
  await requireRoleUser(["admin", "moderator"]);
  return listAdminStores(params) as Promise<FirebaseSieveResult<StoreDocument>>;
}

export async function listAdminSessionsAction(params?: {
  userId?: string;
  limit?: number;
}) {
  await requireRoleUser(["admin", "moderator"]);
  return listAdminSessions(params);
}

