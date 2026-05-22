/**
 * POST /api/store/whatsapp-settings/catalog-import
 *
 * Imports products from the seller's WhatsApp Business Catalog into LetItRip
 * as draft standard products. Products whose WA description contains a valid
 * LetItRip slug (starts with "product-") are skipped (already synced).
 * New products are created as drafts with listingType:"standard".
 */

import { withProviders } from "@/providers.config";
import {
  storeRepository,
  productRepository,
  decryptPii,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";
import type { ProductCreateInput } from "@mohasinac/appkit";

const META_GRAPH_BASE = "https://graph.facebook.com/v20.0";
const SLUG_PREFIX = "product-";

interface MetaCatalogItem {
  id: string;
  name?: string;
  price?: string;
  currency?: string;
  image_url?: string;
  description?: string;
  retailer_id?: string;
}

interface MetaCatalogResponse {
  data?: MetaCatalogItem[];
  paging?: { next?: string };
  error?: { message: string };
}

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["seller", "admin"],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return errorResponse("Store not found", 404);

      const capabilities = store.capabilities ?? [];
      if (!capabilities.includes("whatsapp_catalog_sync")) {
        return errorResponse(
          "WhatsApp catalog sync is not enabled for your store.",
          403,
        );
      }

      const cfg = store.whatsappConfig;
      if (!cfg?.connected || !cfg.catalogId || !cfg.accessToken) {
        return errorResponse(
          "WhatsApp Business account is not connected. Save your credentials first.",
          400,
        );
      }

      const accessToken = decryptPii(cfg.accessToken) as string | null;
      if (!accessToken) {
        return errorResponse("Access token is missing or corrupted.", 400);
      }

      // Fetch items from Meta Commerce Catalog
      const url = `${META_GRAPH_BASE}/${cfg.catalogId}/products?fields=name,price,currency,image_url,description,retailer_id&limit=250`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: { message: string } };
        return errorResponse(
          `Failed to fetch WhatsApp catalog: ${err.error?.message ?? res.statusText}`,
          502,
        );
      }

      const catalog = (await res.json()) as MetaCatalogResponse;
      const items = catalog.data ?? [];

      if (items.length === 0) {
        return successResponse(
          { imported: 0, skipped: 0, total: 0 },
          "No items found in your WhatsApp catalog.",
        );
      }

      let imported = 0;
      let skipped = 0;

      for (const item of items) {
        // If WA description contains a valid LetItRip slug, the product is already synced
        const waDescription = (item.description ?? "").trim();
        if (waDescription.startsWith(SLUG_PREFIX)) {
          const existingProduct = await productRepository.findBySlug(waDescription);
          if (existingProduct) {
            skipped++;
            continue;
          }
        }

        // Also check retailer_id for existing product match
        if (item.retailer_id?.startsWith(SLUG_PREFIX)) {
          const existingProduct = await productRepository.findBySlug(item.retailer_id);
          if (existingProduct) {
            skipped++;
            continue;
          }
        }

        // Parse price — Meta returns "<amount> <currency>" e.g. "450.00 INR"
        let priceInPaise = 0;
        if (item.price) {
          const priceStr = item.price.replace(/[^0-9.]/g, "");
          priceInPaise = Math.round((parseFloat(priceStr) || 0) * 100);
        }

        const productInput: ProductCreateInput = {
          title: item.name ?? `WhatsApp Import ${item.id}`,
          description: "",
          slug: "",
          listingType: "standard",
          status: "draft",
          price: priceInPaise,
          currency: "INR",
          mainImage: item.image_url ?? "",
          images: [],
          stockQuantity: 1,
          condition: "new",
          storeId: store.id,
          storeName: store.storeName,
          tags: ["whatsapp-import"],
          categorySlugs: [],
          featured: false,
        };

        await productRepository.create(productInput);
        imported++;
      }

      return successResponse(
        { imported, skipped, total: items.length },
        `Imported ${imported} products from WhatsApp catalog (${skipped} already synced).`,
      );
    },
  }),
);
