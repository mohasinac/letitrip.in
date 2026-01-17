"use client";

import type { CartItemFE as CartItemType } from "@/types/frontend/cart.types";
import {
  CartItem as CartItemBase,
  type CartItemData,
  ConfirmDialog,
  MobileSwipeActions,
  Price,
  createDeleteAction,
} from "@letitrip/react-library";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface CartItemProps {
  item: CartItemType & {
    originalPrice?: number;
    stockCount?: number;
  };
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
  disabled?: boolean;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  disabled = false,
}: CartItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleRemove = async () => {
    try {
      await onRemove(item.id);
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Failed to remove item. Please try again.");
    }
  };

  const showToastFn = (message: string, type: "success" | "error") => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const defaultIcons = {
    minus: <Minus className="h-4 w-4 text-gray-600" />,
    plus: <Plus className="h-4 w-4 text-gray-600" />,
    loader: <Loader2 className="h-4 w-4 animate-spin text-blue-600" />,
    trash: <Trash2 className="h-4 w-4" />,
  };

  // Swipe-to-delete action for mobile
  const deleteAction = createDeleteAction(() => setShowDeleteDialog(true));

  const cartItemContent = (
    <CartItemBase
      item={item as CartItemData}
      onUpdateQuantity={onUpdateQuantity}
      onRemove={onRemove}
      disabled={disabled}
      LinkComponent={Link as any}
      ImageComponent={Image as any}
      PriceComponent={Price}
      showToast={showToastFn}
      onOpenDeleteDialog={() => setShowDeleteDialog(true)}
      icons={defaultIcons}
    />
  );

  return (
    <>
      {/* Mobile: Swipe to delete */}
      <div className="sm:hidden">
        <MobileSwipeActions rightActions={[deleteAction]}>
          {cartItemContent}
        </MobileSwipeActions>
      </div>

      {/* Desktop: Regular display */}
      <div className="hidden sm:block">{cartItemContent}</div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleRemove}
        title="Remove from Cart"
        description={`Are you sure you want to remove "${item.productName}" from your cart?`}
        confirmLabel="Remove"
        variant="danger"
      />
    </>
  );
}
