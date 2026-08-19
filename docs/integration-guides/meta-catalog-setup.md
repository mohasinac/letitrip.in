# Meta Commerce Catalog Sync (per-store)

Lets a seller push their product catalog to Meta's Commerce Manager (for WhatsApp catalog messages and Facebook/Instagram Shops) and import products back the other way. This is configured **per store**, separately from the platform-level WhatsApp credentials used for order notifications.

## 1. Create a Commerce Manager catalog

At [business.facebook.com/commerce](https://business.facebook.com/commerce), create a new catalog for the store (or use an existing one). Note the **Catalog ID** shown in the catalog's settings.

## 2. Generate a catalog-scoped access token

The store owner needs a Meta access token with `catalog_management` permission, scoped to that catalog. This is generated the same way as the platform-level System User token (see the [WhatsApp Business Setup guide](./whatsapp-business-setup.md), step 4) but assigned to the **catalog** asset instead of the WhatsApp Business Account asset.

## 3. Enter credentials in the seller dashboard

**Store → WhatsApp** (seller-facing settings page):

- **Catalog ID**
- **Access Token**

This is a store capability — it must be enabled for the store (`whatsapp_catalog_sync` capability) before the settings page and sync actions are available.

## 4. Push products to the catalog

Once connected, the seller can trigger a sync that batches published `standard`-listing products (up to 50 per API call) to the Meta catalog via the Commerce API `items_batch` endpoint — title, description, price, image, availability, and condition.

## 5. Import products from the catalog

The reverse flow fetches products already in the Meta catalog and creates them as local **draft** listings, deduplicating against existing products by slug/retailer-id matching.

## Notes

- This is unrelated to the platform-level WhatsApp order-notification credentials (Site Settings → WhatsApp tab) — those are for sending order-status messages to buyers, not catalog sync.
- Only published `standard` listings sync — auctions, pre-orders, and other listing types are not included.
