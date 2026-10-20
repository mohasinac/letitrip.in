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
  useStoreListingEntitlements,
  pluginFor,
  Alert,
  Stack,
  Text,
  TextLink,
  ROUTES,
} from "@mohasinac/appkit/client";
import { DigitalContentPoolSlot } from "./DigitalContentPoolSlot";
import type {
  SellerCreateProductViewProps,
  SellerEditProductViewProps,
  ListingType,
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
  isLot,
}: {
  value: string;
  onChange: (v: string) => void;
  extraValues?: string[];
  onExtraValuesChange?: (ids: string[]) => void;
  isLot?: boolean;
}) => (
  <CategoryInlineSelect
    value={value}
    onChange={onChange}
    extraValues={extraValues}
    onExtraValuesChange={onExtraValuesChange}
    /*
     * 🛑 THE CONSUMER UPDATED IN THE SAME COMMIT as the slot prop, which is the
     * whole of Root Cause #20 — and this exact slot has already been broken
     * once that way (its own docstring records `QuickProductForm` breaking when
     * a new prop was made required).
     *
     * LOT -> collections, SINGLE -> leaves. The inversion is deliberate: a lot
     * must file under a non-leaf because a category IS a collection, and naming
     * one model would claim every item in the pile is that model.
     *
     * 🛑 `isLot === undefined` stays UNSCOPED rather than defaulting to leaves.
     * A caller that has not been told is not the same as a caller that said
     * "single", and `assertAssignmentShape` refuses both directions — so a
     * wrong default would walk the seller into a 400 instead of just showing
     * them more rows than they need.
     */
    leavesOnly={isLot === undefined ? undefined : !isLot}
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
  /*
   * 🛑 The entitlement refusal lives HERE, not in the 21 per-type `new` pages.
   *
   * Every one of those pages is reachable by typing its URL — `/store/live/new`
   * renders a complete, usable form regardless of what the store may list — and
   * the nav filter only hides the link. Putting the check in the one shell all
   * of them render means the next per-type page somebody adds inherits it
   * instead of having to remember it.
   *
   * It is an AFFORDANCE, not the boundary. `assertListingTypeAllowed` refuses
   * server-side in both `createSellerProduct` and `sellerUpdateProduct`, so a
   * seller who gets past this still cannot save. What this prevents is the
   * worse experience: filling in a long wizard and being refused at publish.
   */
  const { allowed, isLoading } = useStoreListingEntitlements();
  const listingType = props.listingType ?? "standard";
  /*
   * 🛑 `"bundle"` is a `ProductListingMode` but NOT a `ListingType` — this
   * same shell edits bundles, which stopped being a listing type in SB-UNI-D.
   * Running it through the tier gate would refuse the bundle editor outright,
   * since no capability names a type that is not in the union.
   */
  const isGatedType = listingType !== "bundle";

  /*
   * While the entitlement fetch is in flight, render the form rather than a
   * refusal. The three-state rule from `useCanSeePrices`: "not known yet" must
   * never render as "no", or a seller who IS entitled sees an accusation flash
   * on every page load. The server is the authority either way.
   */
  if (isGatedType && !isLoading && !allowed.has(listingType as ListingType)) {
    return (
      <Alert variant="warning" title="This listing type is not enabled for your store">
        <Stack gap="sm">
          <Text size="sm">
            {/*
              The plugin's own label, not a new map. Every hand-written
              enumeration of this union has drifted (Root Cause #61), and
              `pluralLabel` is already the registry's answer to "what do we
              call this type".
            */}
            {pluginFor(listingType as ListingType).pluralLabel} are an advanced
            listing type. Enable advanced listing types in your store
            preferences first — each one carries its own obligations, which that
            page sets out.
          </Text>
          <TextLink href={String(ROUTES.STORE.PAYOUT_SETTINGS)}>
            Open store preferences
          </TextLink>
        </Stack>
      </Alert>
    );
  }

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
