"use client";
import {
  SellerCreateProductView,
  SellerEditProductView,
  CategoryInlineSelect,
  BrandInlineSelect,
  useSession,
  /*
   * 🛑 From "/client", not the bare entry. This file is "use client" and is
   * reachable from src/components/index.ts, so a bare "@mohasinac/appkit"
   * import drags the server graph — and firebase-admin's static top-level
   * import — into the client bundle. Root Cause #6: Turbopack follows the whole
   * chain and the build fails with child_process/fs in a client chunk.
   * The predicates are exported from BOTH entries precisely for this.
   */
  isAdminUser,
  isModeratorUser,
  isEmployeeUser,
} from "@mohasinac/appkit/client";
import { DigitalContentPoolSlot } from "./DigitalContentPoolSlot";
import type {
  SellerCreateProductViewProps,
  SellerEditProductViewProps,
} from "@mohasinac/appkit/client";

const renderCategorySelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => <CategoryInlineSelect value={value} onChange={onChange} />;

const renderBrandSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => <BrandInlineSelect value={value} onChange={onChange} />;

export function StoreCreateProductShell(props: SellerCreateProductViewProps) {
  return (
    <SellerCreateProductView
      {...props}
      renderCategorySelector={renderCategorySelector}
      renderBrandSelector={renderBrandSelector}
    />
  );
}

export function StoreEditProductShell(props: SellerEditProductViewProps) {
  /*
   * The pool manager is only mounted in EDIT mode (a pool is keyed on a product
   * id), and the shell itself gates it on listingType === "digital-code".
   *
   * `canUploadFiles` is a UI affordance only — the server re-checks the same
   * rule at BOTH sign and finalize, so hiding the button is convenience, not the
   * boundary. Images (the QR case) are open to sellers; any other file type is
   * staff-only, because those bytes are later streamed to a buyer.
   */
  const { user } = useSession();
  // Predicates, never a role-string compare — audit-inline-role-check is
  // strict-zero on the latter, and the predicates are what keep "who counts as
  // staff" in one place.
  const isStaff =
    !!user && (isAdminUser(user) || isModeratorUser(user) || isEmployeeUser(user));
  return (
    <SellerEditProductView
      {...props}
      renderCategorySelector={renderCategorySelector}
      renderBrandSelector={renderBrandSelector}
      renderDigitalContentPool={(productId: string) => (
        <DigitalContentPoolSlot productId={productId} canUploadFiles={isStaff} />
      )}
    />
  );
}
