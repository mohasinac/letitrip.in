"use client";

import { useState, useCallback } from "react";
import { useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import {
  API_ENDPOINTS,
  UI_LABELS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  THEME_CONSTANTS,
} from "@/constants";
import {
  Card,
  Button,
  DataTable,
  AdminPageHeader,
  ConfirmDeleteModal,
  getNewsletterTableColumns,
} from "@/components";
import type { NewsletterSubscriberDocument } from "@/db/schema";

const LABELS = UI_LABELS.ADMIN.NEWSLETTER;
const { themed, spacing } = THEME_CONSTANTS;

const STATUS_TABS = [
  { key: "", label: LABELS.FILTER_ALL },
  { key: "active", label: LABELS.FILTER_ACTIVE },
  { key: "unsubscribed", label: LABELS.FILTER_UNSUBSCRIBED },
];

interface NewsletterStats {
  total: number;
  active: number;
  unsubscribed: number;
  sources: Record<string, number>;
}

interface NewsletterResponse {
  subscribers: NewsletterSubscriberDocument[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
  stats: NewsletterStats;
}

export default function AdminNewsletterPage() {
  const { showSuccess, showError } = useMessage();

  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] =
    useState<NewsletterSubscriberDocument | null>(null);

  const queryKey = ["admin", "newsletter", statusFilter];
  const { data, isLoading, error, refetch } = useApiQuery<NewsletterResponse>({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams({
        pageSize: "200",
        sorts: "-createdAt",
      });
      if (statusFilter) params.set("filters", `status==${statusFilter}`);
      return apiClient.get(`${API_ENDPOINTS.ADMIN.NEWSLETTER}?${params}`);
    },
  });

  const toggleMutation = useApiMutation<
    unknown,
    { id: string; status: "active" | "unsubscribed" }
  >({
    mutationFn: ({ id, status }) =>
      apiClient.patch(API_ENDPOINTS.ADMIN.NEWSLETTER_BY_ID(id), { status }),
  });

  const deleteMutation = useApiMutation<unknown, string>({
    mutationFn: (id) =>
      apiClient.delete(API_ENDPOINTS.ADMIN.NEWSLETTER_BY_ID(id)),
  });

  const subscribers = data?.subscribers ?? [];
  const stats = data?.stats;

  const handleToggleStatus = useCallback(
    async (subscriber: NewsletterSubscriberDocument) => {
      const newStatus =
        subscriber.status === "active" ? "unsubscribed" : "active";
      try {
        await toggleMutation.mutate({ id: subscriber.id, status: newStatus });
        showSuccess(
          newStatus === "unsubscribed"
            ? SUCCESS_MESSAGES.NEWSLETTER.UNSUBSCRIBED
            : SUCCESS_MESSAGES.NEWSLETTER.RESUBSCRIBED,
        );
        refetch();
      } catch {
        showError(ERROR_MESSAGES.NEWSLETTER.UPDATE_FAILED);
      }
    },
    [toggleMutation, showSuccess, showError, refetch],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutate(deleteTarget.id);
      showSuccess(SUCCESS_MESSAGES.NEWSLETTER.DELETED);
      setDeleteTarget(null);
      refetch();
    } catch {
      showError(ERROR_MESSAGES.NEWSLETTER.DELETE_FAILED);
    }
  }, [deleteTarget, deleteMutation, showSuccess, showError, refetch]);

  const { columns } = getNewsletterTableColumns(handleToggleStatus, (s) =>
    setDeleteTarget(s),
  );

  return (
    <div className={spacing.stack}>
      <AdminPageHeader
        title={LABELS.TITLE}
        subtitle={`${LABELS.SUBTITLE} — ${stats?.total ?? subscribers.length} total`}
      />

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <p
              className={`text-xs font-medium uppercase tracking-wide ${themed.textSecondary} mb-1`}
            >
              {LABELS.TOTAL_SUBSCRIBERS}
            </p>
            <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p
              className={`text-xs font-medium uppercase tracking-wide ${themed.textSecondary} mb-1`}
            >
              {LABELS.ACTIVE_SUBSCRIBERS}
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {stats.active}
            </p>
            <p className={`text-xs ${themed.textSecondary} mt-0.5`}>
              {stats.total > 0
                ? `${Math.round((stats.active / stats.total) * 100)}% of total`
                : "0%"}
            </p>
          </Card>
          <Card className="p-4">
            <p
              className={`text-xs font-medium uppercase tracking-wide ${themed.textSecondary} mb-1`}
            >
              {LABELS.UNSUBSCRIBED}
            </p>
            <p className="text-2xl font-bold text-gray-500 dark:text-gray-400 tabular-nums">
              {stats.unsubscribed}
            </p>
          </Card>
        </div>
      )}

      {/* Source breakdown (shown when no active filter) */}
      {stats && !statusFilter && Object.keys(stats.sources).length > 0 && (
        <Card className="p-4">
          <p
            className={`text-xs font-medium uppercase tracking-wide ${themed.textSecondary} mb-3`}
          >
            {LABELS.SOURCE_BREAKDOWN}
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.sources)
              .sort(([, a], [, b]) => b - a)
              .map(([src, count]) => (
                <span
                  key={src}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${themed.bgSecondary} ${themed.textPrimary}`}
                >
                  {src}: <strong>{count}</strong>
                </span>
              ))}
          </div>
        </Card>
      )}

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.key}
            variant={statusFilter === tab.key ? "primary" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={subscribers}
          loading={isLoading}
          emptyMessage={
            error ? ERROR_MESSAGES.NEWSLETTER.FETCH_FAILED : LABELS.EMPTY
          }
          emptyTitle={LABELS.EMPTY_SUBTITLE}
          keyExtractor={(s: NewsletterSubscriberDocument) => s.id}
        />
      </Card>

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          void handleDeleteConfirm();
        }}
        isDeleting={deleteMutation.isLoading}
      />
    </div>
  );
}
