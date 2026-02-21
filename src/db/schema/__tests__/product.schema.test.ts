/**
 * Product Schema Tests — Phase 1
 *
 * Verifies that the product schema constants are correctly defined,
 * including the newly added pickupAddressId field.
 */

import { PRODUCT_FIELDS } from "../field-names";
import { PRODUCT_COLLECTION, PRODUCT_UPDATABLE_FIELDS } from "../products";

describe("PRODUCT_FIELDS", () => {
  it("PICKUP_ADDRESS_ID equals 'pickupAddressId'", () => {
    expect(PRODUCT_FIELDS.PICKUP_ADDRESS_ID).toBe("pickupAddressId");
  });

  it("core fields are defined", () => {
    expect(PRODUCT_FIELDS.ID).toBe("id");
    expect(PRODUCT_FIELDS.TITLE).toBe("title");
    expect(PRODUCT_FIELDS.PRICE).toBe("price");
    expect(PRODUCT_FIELDS.SELLER_ID).toBe("sellerId");
    expect(PRODUCT_FIELDS.STATUS).toBe("status");
  });
});

describe("PRODUCT_UPDATABLE_FIELDS", () => {
  it("includes 'pickupAddressId'", () => {
    expect(PRODUCT_UPDATABLE_FIELDS).toContain("pickupAddressId");
  });

  it("includes standard seller-editable fields", () => {
    expect(PRODUCT_UPDATABLE_FIELDS).toContain("title");
    expect(PRODUCT_UPDATABLE_FIELDS).toContain("description");
    expect(PRODUCT_UPDATABLE_FIELDS).toContain("price");
    expect(PRODUCT_UPDATABLE_FIELDS).toContain("status");
    expect(PRODUCT_UPDATABLE_FIELDS).toContain("shippingInfo");
    expect(PRODUCT_UPDATABLE_FIELDS).toContain("returnPolicy");
  });
});

describe("PRODUCT_COLLECTION", () => {
  it("equals 'products'", () => {
    expect(PRODUCT_COLLECTION).toBe("products");
  });
});
