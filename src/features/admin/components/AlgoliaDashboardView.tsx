"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Badge,
  Spinner,
  Heading,
  Text,
  Caption,
  Span,
  Ul,
  Li,
} from "@/components";
import { THEME_CONSTANTS, API_ENDPOINTS } from "@/constants";
import { apiClient } from "@/lib/api-client";

const { themed } = THEME_CONSTANTS;

interface ActionResult {
  indexed?: number;
  deleted?: number;
  total?: number;
  cleared?: boolean;
  error?: string;
}

interface ActionState {
  loading: boolean;
  result: ActionResult | null;
  status: "idle" | "success" | "error";
}

const SYNC_ACTIONS = [
  {
    key: "products" as const,
    label: "Sync Products → Algolia",
    emoji: "📦",
    description:
      "Bulk re-index all published products into the Algolia products index.",
    color: "text-blue-700 dark:text-blue-300",
    headerBg:
      "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",
    badgeClass:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    key: "pages" as const,
    label: "Sync Nav Pages → Algolia",
    emoji: "🗺️",
    description:
      "Index static pages, categories, blog posts, and events into the pages_nav index for navigation suggestions.",
    color: "text-violet-700 dark:text-violet-300",
    headerBg:
      "bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800",
    badgeClass:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  },
];

type SyncKey = (typeof SYNC_ACTIONS)[number]["key"];

export function AlgoliaDashboardView() {
  const [syncStates, setSyncStates] = useState<Record<SyncKey, ActionState>>({
    products: { loading: false, result: null, status: "idle" },
    pages: { loading: false, result: null, status: "idle" },
  });
  const [clearStates, setClearStates] = useState<Record<SyncKey, ActionState>>({
    products: { loading: false, result: null, status: "idle" },
    pages: { loading: false, result: null, status: "idle" },
  });
  const [confirmClear, setConfirmClear] = useState<SyncKey | null>(null);

  if (process.env.NODE_ENV !== "development") {
    return (
      <div className={`${THEME_CONSTANTS.flex.center} min-h-screen p-8`}>
        <Card>
          <div className="p-8 text-center">
            <Heading level={2} className="mb-2">
              🔒 Access Denied
            </Heading>
            <Text variant="secondary">
              This page is only available in development mode.
            </Text>
          </div>
        </Card>
      </div>
    );
  }

  const callDev = async (
    action: "sync" | "clear",
    target: SyncKey,
    setStates: React.Dispatch<
      React.SetStateAction<Record<SyncKey, ActionState>>
    >,
    errorLabel: string,
  ) => {
    setStates((prev) => ({
      ...prev,
      [target]: { loading: true, result: null, status: "idle" },
    }));
    try {
      const result = await apiClient.post<ActionResult>(
        API_ENDPOINTS.DEMO.ALGOLIA,
        { action, target },
      );
      setStates((prev) => ({
        ...prev,
        [target]: {
          loading: false,
          result: result ?? {},
          status: "success",
        },
      }));
    } catch (err: unknown) {
      setStates((prev) => ({
        ...prev,
        [target]: {
          loading: false,
          result: {
            error: err instanceof Error ? err.message : `${errorLabel} failed`,
          },
          status: "error",
        },
      }));
    }
  };

  const handleSync = (key: SyncKey) =>
    callDev("sync", key, setSyncStates, "Sync");

  const handleClear = async (key: SyncKey) => {
    setConfirmClear(null);
    await callDev("clear", key, setClearStates, "Clear");
  };

  const anyLoading =
    Object.values(syncStates).some((s) => s.loading) ||
    Object.values(clearStates).some((s) => s.loading);

  return (
    <div className={`min-h-screen p-4 sm:p-8 ${themed.bgSecondary}`}>
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <div
          className={`rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/40 dark:to-yellow-950/30 border ${themed.border}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Heading level={1} className="text-2xl sm:text-3xl font-bold">
              🔍 Algolia Dashboard
            </Heading>
            <Badge variant="warning">Dev Only</Badge>
          </div>
          <Text variant="secondary" className="mb-4">
            Manually trigger Algolia index syncs. The Firebase trigger
            auto-syncs products on write, but use these buttons when records
            appear out of sync or after bulk changes.
          </Text>
          <div className="flex flex-wrap gap-2">
            {SYNC_ACTIONS.map((action) => {
              const state = syncStates[action.key];
              return (
                <Span
                  key={action.key}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${action.badgeClass}`}
                >
                  {action.emoji} {action.label.split(" → ")[0]}
                  {state.status === "success" &&
                    state.result?.indexed !== undefined && (
                      <> · {state.result.indexed} indexed</>
                    )}
                </Span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sync Cards */}
      <div className="max-w-3xl mx-auto grid gap-6 sm:grid-cols-2 mb-8">
        {SYNC_ACTIONS.map((action) => {
          const syncState = syncStates[action.key];
          const clearState = clearStates[action.key];
          const isPendingConfirm = confirmClear === action.key;
          return (
            <Card key={action.key}>
              <div className="p-5">
                {/* Card Header */}
                <div className={`rounded-lg px-4 py-3 mb-4 ${action.headerBg}`}>
                  <Text className={`font-semibold ${action.color}`}>
                    {action.emoji} {action.label}
                  </Text>
                </div>

                <Caption className="mb-4 block">{action.description}</Caption>

                <Button
                  variant="primary"
                  className="w-full mb-2"
                  onClick={() => handleSync(action.key)}
                  disabled={syncState.loading || anyLoading}
                >
                  {syncState.loading ? (
                    <span className={`${THEME_CONSTANTS.flex.center} gap-2`}>
                      <Spinner size="sm" /> Syncing…
                    </span>
                  ) : (
                    `${action.emoji} Run Sync`
                  )}
                </Button>

                {/* Clear with inline confirm */}
                {!isPendingConfirm ? (
                  <Button
                    variant="outline"
                    className="w-full text-red-500 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => setConfirmClear(action.key)}
                    disabled={clearState.loading || anyLoading}
                  >
                    {clearState.loading ? (
                      <span className={`${THEME_CONSTANTS.flex.center} gap-2`}>
                        <Spinner size="sm" /> Clearing…
                      </span>
                    ) : (
                      "🗑 Clear Index"
                    )}
                  </Button>
                ) : (
                  <div className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 px-3 py-3">
                    <Caption className="text-red-700 dark:text-red-300 font-medium mb-2 block">
                      ⚠️ This removes ALL records. Are you sure?
                    </Caption>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        className="flex-1 bg-red-600 hover:bg-red-700 border-red-600"
                        onClick={() => handleClear(action.key)}
                      >
                        Yes, clear it
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setConfirmClear(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Sync result */}
                {syncState.status !== "idle" && !syncState.loading && (
                  <div className="mt-3">
                    <ActionResultDisplay
                      result={syncState.result}
                      status={syncState.status}
                      label="Sync"
                    />
                  </div>
                )}

                {/* Clear result */}
                {clearState.status !== "idle" && !clearState.loading && (
                  <div className="mt-3">
                    <ActionResultDisplay
                      result={clearState.result}
                      status={clearState.status}
                      label="Clear"
                    />
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <div className="max-w-3xl mx-auto">
        <Card>
          <div className="p-5">
            <Text className="font-semibold mb-3">
              ℹ️ How Algolia sync works
            </Text>
            <Ul>
              <Li>
                <Caption>
                  <strong>Products index</strong> — auto-synced via the{" "}
                  <code className="text-xs bg-zinc-100 dark:bg-slate-800 px-1 rounded">
                    onProductWrite
                  </code>{" "}
                  Firebase trigger on every Firestore write.
                </Caption>
              </Li>
              <Li>
                <Caption>
                  <strong>pages_nav index</strong> — must be synced manually
                  when new categories, blog posts, or events are added. There is
                  no automatic trigger for this index.
                </Caption>
              </Li>
              <Li>
                <Caption>
                  Running a sync is safe and idempotent — it overwrites existing
                  records with fresh data. No records are deleted unless a
                  product is unpublished.
                </Caption>
              </Li>
              <Li>
                <Caption>
                  The search overlay uses{" "}
                  <code className="text-xs bg-zinc-100 dark:bg-slate-800 px-1 rounded">
                    NEXT_PUBLIC_ALGOLIA_*
                  </code>{" "}
                  keys (read-only). Syncs use the admin write key (server-side
                  only).
                </Caption>
              </Li>
            </Ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ActionResultDisplay({
  result,
  status,
  label,
}: {
  result: ActionResult | null;
  status: "success" | "error";
  label: string;
}) {
  if (!result) return null;

  if (status === "error") {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
        <Caption className="text-red-700 dark:text-red-300 font-medium">
          ❌ {result.error ?? `${label} failed`}
        </Caption>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 space-y-1">
      <Caption className="text-emerald-700 dark:text-emerald-300 font-medium">
        ✅ {label} complete
      </Caption>
      {result.indexed !== undefined && (
        <Caption className="text-emerald-600 dark:text-emerald-400">
          {result.indexed} records indexed
          {result.total !== undefined && ` of ${result.total}`}
        </Caption>
      )}
      {result.cleared && (
        <Caption className="text-emerald-600 dark:text-emerald-400">
          Index cleared — all records removed
        </Caption>
      )}
      {result.deleted !== undefined && result.deleted > 0 && (
        <Caption className="text-emerald-600 dark:text-emerald-400">
          {result.deleted} records deleted
        </Caption>
      )}
    </div>
  );
}
