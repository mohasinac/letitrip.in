/**
 * AlgoliaDashboardView — Thin Adapter
 *
 * Tier 2 — feature component.
 * Dev-only Algolia sync dashboard.
 * Uses appkit AlgoliaDashboardView shell + letitrip sync mutations.
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlgoliaDashboardView as AppkitAlgoliaDashboardView } from "@mohasinac/appkit/features/admin";
import { Card, useToast } from "@/components";
import { Text, Span, Badge, Button } from "@mohasinac/appkit/ui";
import { useAlgoliaSync } from "@/features/admin/hooks";

export function AlgoliaDashboardView() {
  const { showToast } = useToast();
  const t = useTranslations("algoliaDashboard");

  const [syncStates, setSyncStates] = useState<
    Record<string, "idle" | "loading" | "success" | "error">
  >({
    products: "idle",
    pages: "idle",
    categories: "idle",
    stores: "idle",
  });

  const [syncResults, setSyncResults] = useState<
    Record<string, { indexed?: number; error?: string }>
  >({});

  const syncMutation = useAlgoliaSync();

  const handleSync = async (
    index: "products" | "pages" | "categories" | "stores",
  ) => {
    setSyncStates((prev) => ({ ...prev, [index]: "loading" }));
    try {
      const result = await syncMutation.mutateAsync({
        action: "sync",
        target: index,
      });
      setSyncStates((prev) => ({ ...prev, [index]: "success" }));
      setSyncResults((prev) => ({ ...prev, [index]: result }));
      showToast(`✅ Indexed ${result?.indexed ?? 0} ${index}`, "success");
    } catch (err: unknown) {
      setSyncStates((prev) => ({ ...prev, [index]: "error" }));
      setSyncResults((prev) => ({
        ...prev,
        [index]: {
          error: err instanceof Error ? err.message : `${index} sync failed`,
        },
      }));
      showToast(
        err instanceof Error ? err.message : `${index} sync failed`,
        "error",
      );
    }
  };

  // Dev-only check (non-negotiable)
  if (process.env.NODE_ENV !== "development") {
    return (
      <Card>
        <div className="p-6 text-center">
          <Text className="text-neutral-600 dark:text-neutral-400">
            {t("devOnlyWarning")}
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <AppkitAlgoliaDashboardView
      renderStatus={() => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["products", "pages", "categories", "stores"].map((index) => (
            <Card key={index}>
              <div className="p-4 text-center">
                <Text className="text-sm font-medium capitalize mb-2">
                  {index}
                </Text>
                <Badge
                  variant={
                    syncStates[index] === "success"
                      ? "success"
                      : syncStates[index] === "error"
                        ? "danger"
                        : "default"
                  }
                >
                  {syncStates[index]}
                </Badge>
                {syncResults[index]?.indexed && (
                  <Text className="text-xs mt-2 text-neutral-600">
                    {syncResults[index].indexed} indexed
                  </Text>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      renderActions={() => (
        <Card>
          <div className="p-4 sm:p-6">
            <Text className="text-sm font-medium mb-4">{t("syncActions")}</Text>
            <div className="flex flex-wrap gap-3">
              {["products", "pages", "categories", "stores"].map((index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() =>
                    handleSync(
                      index as "products" | "pages" | "categories" | "stores",
                    )
                  }
                  disabled={syncStates[index] === "loading"}
                >
                  {syncStates[index] === "loading"
                    ? `Syncing ${index}…`
                    : `Sync ${index}`}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}
      renderLogs={() => (
        <Card>
          <div className="p-4 sm:p-6">
            <Text className="text-sm font-medium mb-4">{t("syncLogs")}</Text>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(syncResults).map(([index, result]) => (
                <div key={index} className="text-xs font-mono">
                  <Span className="text-neutral-500">{index}: </Span>
                  {result.indexed ? (
                    <Span className="text-green-600">
                      ✓ {result.indexed} indexed
                    </Span>
                  ) : result.error ? (
                    <Span className="text-red-600">✗ {result.error}</Span>
                  ) : (
                    <Span className="text-neutral-500">pending</Span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    />
  );
}
