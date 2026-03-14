"use client";

/**
 * useBottomActions
 *
 * Register page-level actions that appear in the `<BottomActions>` mobile bar
 * above the BottomNavbar. Call this hook anywhere inside your feature component
 * or page view. Actions are automatically cleared when the component unmounts.
 *
 * Rules:
 * - Only ONE caller should be active at a time (the current page).
 * - `onClick` handlers are dispatched via a ref — they always receive the latest
 *   closure regardless of when the action key last changed, so wrapping in
 *   `useCallback` is optional but good practice for complex handlers.
 * - Bulk mode activates automatically whenever `bulk.selectedCount > 0`.
 *
 * @example — product detail / auction page
 * ```tsx
 * useBottomActions({
 *   infoLabel: product.isAuction ? `${t("currentBid")}: ₹${currentBid}` : undefined,
 *   actions: [
 *     {
 *       id: "wishlist",
 *       icon: <Heart className="w-4 h-4" />,
 *       label: t("wishlist"),
 *       variant: "ghost",
 *       grow: false,
 *       onClick: handleWishlistToggle,
 *     },
 *     {
 *       id: "cart",
 *       label: t("addToCart"),
 *       variant: "outline",
 *       onClick: handleAddToCart,
 *     },
 *     {
 *       id: "buy",
 *       label: t("buyNow"),
 *       variant: "primary",
 *       onClick: handleBuyNow,
 *     },
 *   ],
 * });
 * ```
 *
 * @example — admin listing page with bulk selection
 * ```tsx
 * useBottomActions({
 *   bulk: {
 *     selectedCount: selectedIds.length,
 *     onClearSelection: () => setSelectedIds([]),
 *     actions: [
 *       {
 *         id: "publish",
 *         label: t("bulkPublish", { count: selectedIds.length }),
 *         variant: "secondary",
 *         onClick: handleBulkPublish,
 *       },
 *       {
 *         id: "delete",
 *         label: t("bulkDelete", { count: selectedIds.length }),
 *         variant: "danger",
 *         grow: false,
 *         onClick: handleBulkDelete,
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @example — cart / checkout page (single primary action)
 * ```tsx
 * useBottomActions({
 *   actions: [
 *     {
 *       id: "checkout",
 *       label: t("proceedToCheckout"),
 *       variant: "primary",
 *       badge: cartCount > 0 ? cartCount : undefined,
 *       onClick: handleCheckout,
 *     },
 *   ],
 * });
 * ```
 */

import { useEffect, useRef } from "react";
import {
  useBottomActionsContext,
  type BottomAction,
  type BottomBulkConfig,
} from "@/contexts/BottomActionsContext";

export interface UseBottomActionsOptions {
  /** Page-level primary actions. Rendered left-to-right, all grow by default. */
  actions?: BottomAction[];
  /**
   * Bulk selection config. Bar switches to "bulk mode" when selectedCount > 0.
   * Pass `undefined` to disable bulk mode.
   */
  bulk?: BottomBulkConfig;
  /**
   * Optional one-line contextual info shown above the action row.
   * Use for dynamic data like "Current bid: ₹1,200" or "2 variants available".
   * Must be pre-translated (built with `useTranslations` before passing here).
   */
  infoLabel?: string;
}

export function useBottomActions(options: UseBottomActionsOptions = {}) {
  const { setActions, setBulkConfig, setInfoLabel, clearAll } =
    useBottomActionsContext();

  // Keep refs to latest option values so effects always dispatch current state.
  const actionsRef = useRef(options.actions ?? []);
  actionsRef.current = options.actions ?? [];

  const bulkRef = useRef(options.bulk);
  bulkRef.current = options.bulk;

  // ─── Serialised keys for structural change detection ─────────────────────
  // We compare shape (id, label, variant, badge, disabled, loading, grow) but
  // NOT the onClick callback — callbacks are dispatched via refs.
  const actionKey = (options.actions ?? [])
    .map(
      ({ id, label, variant, badge, disabled, loading, grow }) =>
        `${id}|${label}|${variant}|${badge}|${disabled}|${loading}|${grow}`,
    )
    .join(",");

  // Bulk key: re-register when the selected count or action list changes.
  const bulkCountKey = options.bulk
    ? `${options.bulk.selectedCount}|${options.bulk.actions.map((a) => `${a.id}|${a.label}|${a.variant}|${a.badge}|${a.disabled}|${a.loading}|${a.grow}`).join(",")}`
    : "";

  // ─── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    setActions(actionsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setActions, actionKey]);

  useEffect(() => {
    setBulkConfig(bulkRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBulkConfig, bulkCountKey]);

  useEffect(() => {
    setInfoLabel(options.infoLabel);
  }, [setInfoLabel, options.infoLabel]);

  // Clear all state when the feature component unmounts (route change).
  useEffect(() => {
    return () => clearAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearAll]);
}
