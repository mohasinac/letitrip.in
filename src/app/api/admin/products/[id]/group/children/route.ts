import { withProviders } from "@/providers.config";
import { z } from "zod";
import { ApiErrors, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler as createApiHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { isAuctionListing } from "@mohasinac/appkit/features/products/utils/listing-type";
import { ROLES_ADMIN_ONLY } from "@/constants";

/*
 * A discriminated union, which is the whole point here.
 *
 * The cast declared `mode: "create" | "link"` with `title`/`price`/`childId`
 * all optional, so the handler had to re-check "which fields does this mode
 * need" by hand — and a caller sending `mode: "create"` with `price: "20"`
 * (a string, as every HTML form produces) got `price` written straight onto a
 * product document, where every money computation then does string
 * concatenation instead of arithmetic.
 *
 * `condition` was `(body.condition ?? "new") as ProductCondition`, which
 * accepted ANY string and cast it into a closed union — the enum below is what
 * makes that cast unnecessary rather than merely hidden.
 */
const addChildSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("create"),
    title: z.string().trim().min(1, "title is required").max(200),
    price: z.number().positive("price must be greater than zero"),
    condition: z
      .enum(["new", "used", "refurbished", "broken", "graded"])
      .optional(),
  }),
  z.object({
    mode: z.literal("link"),
    childId: z.string().trim().min(1, "childId is required"),
  }),
]);

/** POST /api/admin/products/[id]/group/children — add child (admin, no ownership check) */
export const POST = withProviders(createApiHandler<(typeof addChildSchema)["_output"]>({
  roles: [...ROLES_ADMIN_ONLY],
  permission: "admin:products:write",
  schema: addChildSchema,
  handler: async ({ body, params }) => {
    const parentDocId = (params as { id: string }).id;
    const parent = await productRepository.findById(parentDocId);
    if (!parent) return ApiErrors.notFound("Parent product not found");
    if (!parent.isGroupParent) return ApiErrors.badRequest("Product is not a group parent");
    if (isAuctionListing(parent)) return ApiErrors.badRequest("Auctions cannot be in groups");

    const input = body!;

    if (input.mode === "create") {
      const childSlug = `${parent.slug ?? parent.id}-part-${Date.now().toString(36)}`;
      const newChild = await productRepository.addChildProduct(parent, {
        title: input.title,
        description: "",
        mainImage: "",
        price: input.price,
        condition: input.condition ?? "new",
        slug: childSlug,
        storeId: parent.storeId,
        storeName: parent.storeName,
        categorySlugs: parent.categorySlugs ?? [],
        brand: parent.brand,
        tags: parent.tags ?? [],
        images: [],
        stockQuantity: 1,
        status: "published",
        listingType: "standard",
        currency: parent.currency ?? "INR",
        featured: false,
        shippingInfo: parent.shippingInfo,
        returnPolicy: parent.returnPolicy,
      });
      return successResponse({ child: newChild }, undefined, 201);
    }

    if (input.mode === "link") {
      const child = await productRepository.findById(input.childId);
      if (!child) return ApiErrors.notFound("Listing not found");
      if (isAuctionListing(child)) return ApiErrors.badRequest("Auctions cannot be linked");
      if (child.groupId) return ApiErrors.badRequest("Listing is already in a group");

      await productRepository.linkChildToGroup(parent, child);
      return successResponse({ linked: true }, "Listing linked to group");
    }

    /*
     * Unreachable: the discriminated union admits exactly two modes, so an
     * unknown one is a 400 from the schema before the handler runs. Kept as
     * the exhaustiveness backstop rather than deleted, so adding a third mode
     * to the schema without a branch here fails loudly instead of silently
     * returning a 200 that did nothing.
     */
    return ApiErrors.badRequest("Invalid mode — must be 'create' or 'link'");
  },
}));
