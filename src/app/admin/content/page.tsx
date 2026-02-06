"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components";
import { Heading, Text } from "@/components/typography";
import { AdminTabs } from "@/components/admin";
import { useAuth } from "@/hooks";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

interface ContentStats {
  products: { total: number; published: number; draft: number };
  orders: { total: number; confirmed: number; pending: number };
  reviews: { total: number; approved: number; pending: number };
}

export default function AdminContentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { themed } = THEME_CONSTANTS;
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch content statistics
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes, reviewsRes] = await Promise.all([
        apiClient.get<{ data: any[]; count: number }>(
          API_ENDPOINTS.ADMIN.PRODUCTS.LIST,
        ),
        apiClient.get<{ data: any[]; count: number }>(
          API_ENDPOINTS.ADMIN.ORDERS.LIST,
        ),
        apiClient.get<{ data: any[]; count: number }>(
          API_ENDPOINTS.ADMIN.REVIEWS.LIST,
        ),
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data || [];
      const reviews = reviewsRes.data || [];

      setStats({
        products: {
          total: products.length,
          published: products.filter((p: any) => p.status === "published")
            .length,
          draft: products.filter((p: any) => p.status === "draft").length,
        },
        orders: {
          total: orders.length,
          confirmed: orders.filter((o: any) => o.status === "confirmed").length,
          pending: orders.filter((o: any) => o.status === "pending").length,
        },
        reviews: {
          total: reviews.length,
          approved: reviews.filter((r: any) => r.status === "approved").length,
          pending: reviews.filter((r: any) => r.status === "pending").length,
        },
      });
    } catch (error) {
      console.error("Failed to fetch content stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (
      !authLoading &&
      (!user || (user.role !== "admin" && user.role !== "moderator"))
    ) {
      router.push("/");
    } else if (user && (user.role === "admin" || user.role === "moderator")) {
      fetchStats();
    }
  }, [user, authLoading, router, fetchStats]);

  if (authLoading) {
    return (
      <div className={`min-h-screen ${themed.bgPrimary}`}>
        <AdminTabs />
        <div className="container mx-auto px-4 py-6 md:px-6 max-w-7xl flex items-center justify-center min-h-[400px]">
          <Heading level={3} variant="primary">
            {UI_LABELS.LOADING.CONTENT}
          </Heading>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return null;
  }

  return (
    <div className={`min-h-screen ${themed.bgPrimary}`}>
      <AdminTabs />

      <div className="container mx-auto px-4 py-6 md:px-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading level={2} variant="primary">
              {UI_LABELS.ADMIN.CONTENT.TITLE}
            </Heading>
            <Text className={`${themed.textSecondary} mt-1`}>
              {UI_LABELS.ADMIN.CONTENT.SUBTITLE}
            </Text>
          </div>
          <Button variant="secondary" onClick={fetchStats} disabled={loading}>
            {loading ? UI_LABELS.LOADING.DATA : UI_LABELS.ACTIONS.REFRESH}
          </Button>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Trips */}
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Heading level={3} variant="primary" className="mb-2">
                  {UI_LABELS.ADMIN.CONTENT.PRODUCTS.TITLE}
                </Heading>
                <Text className={themed.textSecondary}>
                  {UI_LABELS.ADMIN.CONTENT.PRODUCTS.SUBTITLE}
                </Text>
              </div>
              <span className="text-3xl">
                {UI_LABELS.ADMIN.CONTENT.PRODUCTS.ICON}
              </span>
            </div>
            {stats && (
              <div className={`mb-4 p-3 rounded-lg ${themed.bgSecondary}`}>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold">
                      {stats.products.total}
                    </div>
                    <Text className={`${themed.textMuted} text-xs`}>Total</Text>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {stats.products.published}
                    </div>
                    <Text className={`${themed.textMuted} text-xs`}>
                      Published
                    </Text>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.products.draft}
                    </div>
                    <Text className={`${themed.textMuted} text-xs`}>Draft</Text>
                  </div>
                </div>
              </div>
            )}
            <Button variant="primary" className="w-full">
              {UI_LABELS.ADMIN.CONTENT.PRODUCTS.VIEW}
            </Button>
          </Card>

          {/* Orders */}
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Heading level={3} variant="primary" className="mb-2">
                  {UI_LABELS.ADMIN.CONTENT.ORDERS.TITLE}
                </Heading>
                <Text className={themed.textSecondary}>
                  {UI_LABELS.ADMIN.CONTENT.ORDERS.SUBTITLE}
                </Text>
              </div>
              <span className="text-3xl">
                {UI_LABELS.ADMIN.CONTENT.ORDERS.ICON}
              </span>
            </div>
            {stats && (
              <div className={`mb-4 p-3 rounded-lg ${themed.bgSecondary}`}>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold">
                      {stats.orders.total}
                    </div>
                    <Text className={`${themed.textMuted} text-xs`}>Total</Text>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {stats.orders.confirmed}
                    </div>
                    <Text className={`${themed.textMuted} text-xs`}>
                      Confirmed
                    </Text>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.orders.pending}
                    </div>
                    <Text className={`${themed.textMuted} text-xs`}>
                      Pending
                    </Text>
                  </div>
                </div>
              </div>
            )}
            <Button variant="primary" className="w-full">
              {UI_LABELS.ADMIN.CONTENT.ORDERS.VIEW}
            </Button>
          </Card>

          {/* Reviews */}
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Heading level={3} variant="primary" className="mb-2">
                  {UI_LABELS.ADMIN.CONTENT.REVIEWS.TITLE}
                </Heading>
                <Text className={themed.textSecondary}>
                  {UI_LABELS.ADMIN.CONTENT.REVIEWS.SUBTITLE}
                </Text>
              </div>
              <span className="text-3xl">
                {UI_LABELS.ADMIN.CONTENT.REVIEWS.ICON}
              </span>
            </div>
            {stats && (
              <div className={`mb-4 p-3 rounded-lg ${themed.bgSecondary}`}>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold">
                      {stats.reviews.total}
                    </div>
                    <Text className={`${themed.textMuted} text-xs`}>Total</Text>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {stats.reviews.approved}
                    </div>
                    <Text className={`${themed.textMuted} text-xs`}>
                      Approved
                    </Text>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.reviews.pending}
                    </div>
                    <Text className={`${themed.textMuted} text-xs`}>
                      Pending
                    </Text>
                  </div>
                </div>
              </div>
            )}
            <Button variant="primary" className="w-full">
              {UI_LABELS.ADMIN.CONTENT.REVIEWS.VIEW}
            </Button>
          </Card>
        </div>

        {/* Coming Soon Notice */}
        <Card className="text-center py-8">
          <span className="text-6xl mb-4 block">
            {UI_LABELS.ADMIN.CONTENT.COMING_SOON.ICON}
          </span>
          <Heading level={3} variant="primary" className="mb-2">
            {UI_LABELS.ADMIN.CONTENT.COMING_SOON.TITLE}
          </Heading>
          <Text className={themed.textSecondary}>
            {UI_LABELS.ADMIN.CONTENT.COMING_SOON.MESSAGE}
          </Text>
        </Card>
      </div>
    </div>
  );
}
