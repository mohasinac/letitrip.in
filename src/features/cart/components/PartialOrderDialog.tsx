"use client";

/**
 * PartialOrderDialog
 *
 * Shown in two scenarios:
 * 1. Pre-placement (preflight mode): some cart items are out of stock.
 *    Lets the buyer skip them and continue with available items, or go back to cart.
 * 2. Post-placement (info mode): order was placed but some items were unavailable
 *    at the moment the Firestore transaction ran.
 *    Informs the buyer and lets them navigate to their order or back to cart.
 */

import { useTranslations } from "next-intl";
import { Heading, Text } from "@mohasinac/appkit/ui";
import { SideDrawer, Button } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import type { UnavailableItem } from "@/hooks";

const { spacing, flex, themed } = THEME_CONSTANTS;

interface PartialOrderDialogProps {
  isOpen: boolean;
  /** Items that cannot be fulfilled. */
  unavailableItems: UnavailableItem[];
  /** How many items CAN be ordered (or were ordered in post-placement mode). */
  availableCount: number;
  /**
   * If provided, the dialog is in "post-placement" (info-only) mode:
   * the order has already been created with the available items.
   */
  placedOrderId?: string;
  /** Continue / place order for available items only. */
  onContinue: () => void;
  /** Navigate back to cart so the buyer can remove unavailable items manually. */
  onViewCart: () => void;
  onClose: () => void;
}

export function PartialOrderDialog({
  isOpen,
  unavailableItems,
  availableCount,
  placedOrderId,
  onContinue,
  onViewCart,
  onClose,
}: PartialOrderDialogProps) {
  const t = useTranslations("checkout");

  const isPostPlacement = !!placedOrderId;
  const allUnavailable = availableCount === 0;

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={t("partialOrderTitle")}
      mode="view"
    >
      <div className={spacing.stack}>
        {/* Description */}
        <Text variant="secondary">
          {allUnavailable
            ? t("partialOrderAllUnavailable")
            : isPostPlacement
              ? t("partialOrderDesc", {
                  count: unavailableItems.length,
                  ordered: availableCount,
                })
              : t("partialOrderAvailableDesc", {
                  count: unavailableItems.length,
                  available: availableCount,
                })}
        </Text>

        {/* Unavailable item list */}
        <div className={`rounded-xl border ${themed.border} overflow-hidden`}>
          {unavailableItems.map((item, i) => (
            <div
              key={item.productId}
              className={`px-4 py-3 ${i > 0 ? `border-t ${themed.border}` : ""} ${themed.bgSecondary}`}
            >
              <Text size="sm" weight="medium">
                {item.productTitle}
              </Text>
              <Text size="xs" variant="secondary">
                {t("partialOrderItemsUnavailable", {
                  requested: item.requestedQty,
                  available: item.availableQty,
                })}
              </Text>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className={`${flex.start} gap-3`}>
          {isPostPlacement ? (
            /* Post-placement: just go to order or cart */
            <>
              <Button variant="outline" onClick={onViewCart}>
                {t("partialOrderViewCart")}
              </Button>
              <Button variant="primary" onClick={onContinue}>
                {t("partialOrderItemsOrdered")}
              </Button>
            </>
          ) : allUnavailable ? (
            /* All items OOS — only option is back to cart */
            <Button variant="primary" onClick={onViewCart}>
              {t("partialOrderViewCart")}
            </Button>
          ) : (
            /* Pre-placement: skip OOS items and continue */
            <>
              <Button variant="outline" onClick={onViewCart}>
                {t("partialOrderViewCart")}
              </Button>
              <Button variant="primary" onClick={onContinue}>
                {t("partialOrderContinue")}
              </Button>
            </>
          )}
        </div>
      </div>
    </SideDrawer>
  );
}
