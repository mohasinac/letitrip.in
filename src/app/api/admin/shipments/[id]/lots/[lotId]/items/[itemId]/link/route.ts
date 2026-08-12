import { withProviders } from "@/providers.config";
import {
  createApiHandler as createRouteHandler,
  successResponse,
  errorResponse,
  shipmentsRepository,
  shipmentLotsRepository,
  shipmentItemsRepository,
  productRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";
import { z } from "zod";
import type { ListingType } from "@mohasinac/appkit";

/**
 * "Create pre-order link" — POST /api/admin/shipments/[id]/lots/[lotId]/items/[itemId]/link
 *
 * Manual, opt-in only (never automatic). Either links an existing product or
 * creates a new pre-order product prefilled from the shipment item/lot, and
 * writes the link both ways: ShipmentItem.linkedProductId + the product's
 * sourceShipmentId/sourceShipmentLotId/sourceShipmentItemId.
 */

const linkBodySchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("link"), productId: z.string().min(1) }),
  z.object({
    mode: z.literal("create"),
    categorySlugs: z.array(z.string()).min(1),
    brandSlug: z.string().optional(),
  }),
]);

const CONSIGNMENT_STORE_ID = "store-letitrip-official";

export const POST = withProviders(
  createRouteHandler<(typeof linkBodySchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:shipments:write",
    schema: linkBodySchema,
    handler: async ({ params, body }) => {
      const { id: shipmentId, lotId, itemId } = params as { id: string; lotId: string; itemId: string };

      const [shipment, lot, item] = await Promise.all([
        shipmentsRepository.findById(shipmentId),
        shipmentLotsRepository.findById(lotId),
        shipmentItemsRepository.findById(itemId),
      ]);
      if (!shipment || !lot || !item) return errorResponse("Shipment, lot, or item not found", 404);

      let productId: string;
      let productSlug: string;
      let listingType: ListingType;

      if (body!.mode === "link") {
        const product = await productRepository.findById(body!.productId);
        if (!product) return errorResponse("Product not found", 404);
        await productRepository.update(product.id, {
          sourceShipmentId: shipmentId,
          sourceShipmentLotId: lotId,
          sourceShipmentItemId: itemId,
        });
        productId = product.id;
        productSlug = product.slug ?? product.id;
        listingType = product.listingType;
      } else {
        const lotImageUrls = lot.images.map((img) => img.url);
        const created = await productRepository.create({
          title: item.title,
          description: item.notes || `Sourced from shipment ${shipment.shipmentNumber}.`,
          categorySlugs: body!.categorySlugs,
          brandSlug: body!.brandSlug,
          price: item.price ?? 0,
          currency: "INR",
          stockQuantity: item.quantity,
          mainImage: item.mainImage ?? lotImageUrls[0] ?? "",
          images: item.images && item.images.length > 0 ? item.images : lotImageUrls,
          status: "published",
          storeId: CONSIGNMENT_STORE_ID,
          featured: false,
          tags: [],
          condition: item.condition,
          listingType: "pre-order",
          preOrderDeliveryDate: shipment.etaDate,
          sourceShipmentId: shipmentId,
          sourceShipmentLotId: lotId,
          sourceShipmentItemId: itemId,
        });
        productId = created.id;
        productSlug = created.slug ?? created.id;
        listingType = created.listingType;
      }

      const updatedItem = await shipmentItemsRepository.updateItem(itemId, {
        linkedProductId: productId,
        linkedProductSlug: productSlug,
        linkedProductListingType: listingType,
      });

      return successResponse({ item: updatedItem, productId, productSlug }, "Item linked to product");
    },
  }),
);
