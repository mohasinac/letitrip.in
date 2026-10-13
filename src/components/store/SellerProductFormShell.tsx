"use client";
import {
  SellerCreateProductView,
  SellerEditProductView,
  CategoryInlineSelect,
  BrandInlineSelect,
  CategoryTemplatePicker,
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

/*
 * I2 — the one surface where multi-assignment is opted in.
 *
 * 🛑 Without this the whole feature is unreachable: `categoryIds` was in the
 * schema, in the write path and in the repository's rules, and no human could
 * set a second category because this picker was single-select. That is
 * condition 2 of the plan's own definition of "wired" — a route exists, A UI
 * SURFACE REACHES IT, real data flows, failure is visible — and shipping at
 * condition 1 is the `gradingContent` shape: a finished mechanism with nothing
 * passing it.
 */
const renderCategorySelector = ({
  value,
  onChange,
  extraValues,
  onExtraValuesChange,
}: {
  value: string;
  onChange: (v: string) => void;
  extraValues?: string[];
  onExtraValuesChange?: (ids: string[]) => void;
}) => (
  <CategoryInlineSelect
    value={value}
    onChange={onChange}
    extraValues={extraValues}
    onExtraValuesChange={onExtraValuesChange}
  />
);

const renderBrandSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => <BrandInlineSelect value={value} onChange={onChange} />;

/*
 * The description-template picker. Declared once and passed to BOTH shells,
 * because a template that only fills on create means a seller who
 * re-categorises an existing listing is left with the previous category's
 * copy — which is worse than having no template, since the text now describes
 * the wrong thing while looking authored.
 *
 * Typed off the shell's own prop so the slot's shape cannot drift away from
 * the picker's without `tsc` saying so (Root Cause #20).
 */
const renderTemplateSelector: NonNullable<
  SellerCreateProductViewProps["renderTemplateSelector"]
> = (slot) => <CategoryTemplatePicker {...slot} />;

export function StoreCreateProductShell(props: SellerCreateProductViewProps) {
  return (
    <SellerCreateProductView
      {...props}
      renderCategorySelector={renderCategorySelector}
      renderBrandSelector={renderBrandSelector}
      renderTemplateSelector={renderTemplateSelector}
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
      renderTemplateSelector={renderTemplateSelector}
      renderDigitalContentPool={(productId: string) => (
        <DigitalContentPoolSlot productId={productId} canUploadFiles={isStaff} />
      )}
    />
  );
}
