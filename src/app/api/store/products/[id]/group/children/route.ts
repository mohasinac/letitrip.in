import { withProviders } from "@/providers.config";
import { createApiHandler, ApiErrors, successResponse } from "@mohasinac/appkit";
import { productRepository, storeRepository, isAuctionListing } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

/**
 * POST /api/store/products/[id]/group/children
 * mode "create" — creates a minimal child inheriting parent fields.
 * mode "link"   — links an existing product into the group.
 */
// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const POST = withProviders(createApiHandler({
  roles: [...ROLES_STORE_WRITE],
  handler: async ({ request, user, params }) => {
    const parentDocId = (params as { id: string }).id;

    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const parent = await productRepository.findById(parentDocId);
    if (!parent) return ApiErrors.notFound("Parent product not found");
    if (parent.storeId !== store.id) return ApiErrors.forbidden("Not your product");
    if (!parent.isGroupParent) return ApiErrors.badRequest("Product is not a group parent");
    if (isAuctionListing(parent)) return ApiErrors.badRequest("Auctions cannot be in groups");

    const body = await request.json() as {
      mode: "create" | "link";
      title?: string;
      price?: number;
      condition?: string;
      childId?: string;
    };

    if (body.mode === "create") {
      if (!body.title || !body.price) return ApiErrors.badRequest("title and price required");

      const childSlug = `${parent.slug ?? parent.id}-part-${Date.now().toString(36)}`;
      const newChild = await productRepository.addChildProduct(parent, {
        title: body.title,
        description: "",
        mainImage: "",
        price: body.price,
        condition: (body.condition ?? "new") as "new" | "used" | "refurbished" | "broken" | "graded",
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

    if (body.mode === "link") {
      if (!body.childId) return ApiErrors.badRequest("childId required");

      const child = await productRepository.findById(body.childId);
      if (!child) return ApiErrors.notFound("Listing not found");
      if (isAuctionListing(child)) return ApiErrors.badRequest("Auctions cannot be linked");
      if (child.groupId) return ApiErrors.badRequest("Listing is already in a group");
      if (child.storeId !== store.id) return ApiErrors.forbidden("Not your listing");

      await productRepository.linkChildToGroup(parent, child);
      return successResponse({ linked: true }, "Listing linked to group");
    }

    return ApiErrors.badRequest("Invalid mode — must be 'create' or 'link'");
  },
}));
