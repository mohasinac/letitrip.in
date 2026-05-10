/**
 * POST /api/store/whatsapp-settings/catalog-sync
 *
 * Syncs the seller's published standard products to their WhatsApp Business Catalog
 * via the Meta Commerce API. Requires the whatsapp_catalog_sync store capability
 * and a connected WhatsApp config (wabaId + catalogId + accessToken all set).
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
import { syncProductsToCatalog } from "@mohasinac/appkit/server";
import type { CatalogSyncProduct } from "@mohasinac/appkit/server";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["seller", "admin"],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return errorResponse("Store not found", 404);

      // RBAC gate
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

      if (!cfg.catalogSyncEnabled) {
        return errorResponse(
          "Catalog sync is disabled. Enable it in your WhatsApp settings.",
          400,
        );
      }

      // Decrypt the per-store access token
      const accessToken = decryptPii(cfg.accessToken) as string | null;
      if (!accessToken) {
        return errorResponse("Access token is missing or corrupted.", 400);
      }

      // Fetch all store products then filter in-app for published standard items
      // (J13: isAuction + isPreOrder must be explicit false — Firestore != does not match absent fields)
      const storeProducts = await productRepository.findByStore(store.storeSlug);
      const publishedStandard = storeProducts.filter(
        (p) => p.status === "published" && !p.isAuction && !p.isPreOrder,
      );

      const products: CatalogSyncProduct[] = publishedStandard.map((p) => ({
        id: p.id,
        title: p.title ?? p.id,
        description: p.description ?? "",
        price: p.price ?? 0,
        currency: "INR",
        imageUrl: (p.images?.[0] ?? p.mainImage ?? "") as string,
        availability: (p.stockQuantity ?? 0) > 0 ? "in stock" : "out of stock",
        condition:
          p.condition === "used" || p.condition === "refurbished"
            ? (p.condition as "used" | "refurbished")
            : "new",
        link: `/products/${p.id}`,
      }));

      if (products.length === 0) {
        return errorResponse("No published standard products found to sync.", 400);
      }

      const syncResult = await syncProductsToCatalog({
        catalogId: cfg.catalogId,
        accessToken,
        products,
      });

      // Persist sync metadata back to the store
      await storeRepository.updateStore(store.storeSlug, {
        whatsappConfig: {
          ...cfg,
          lastCatalogSyncAt: new Date(),
          lastSyncCount: syncResult.successCount,
          lastSyncStatus:
            syncResult.failureCount === 0
              ? "success"
              : syncResult.successCount === 0
                ? "failed"
                : "partial",
        },
      });

      return successResponse(syncResult, `Synced ${syncResult.successCount} products to WhatsApp catalog`);
    },
  }),
);
