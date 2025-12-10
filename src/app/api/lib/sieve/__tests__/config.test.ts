/**
 * Unit Tests for Sieve Config Module
 * Comprehensive testing of resource configurations
 */

import {
  auctionsSieveConfig,
  categoriesSieveConfig,
  getAllSieveConfigs,
  getSieveConfig,
  ordersSieveConfig,
  productsSieveConfig,
  reviewsSieveConfig,
  shopsSieveConfig,
  usersSieveConfig,
} from "../config";
import { SieveConfig } from "../types";

describe("Sieve Config Module", () => {
  describe("Resource Configurations", () => {
    describe("productsSieveConfig", () => {
      it("should have correct resource name", () => {
        expect(productsSieveConfig.resource).toBe("products");
      });

      it("should have sortable fields", () => {
        expect(productsSieveConfig.sortableFields).toContain("createdAt");
        expect(productsSieveConfig.sortableFields).toContain("price");
        expect(productsSieveConfig.sortableFields).toContain("name");
        expect(productsSieveConfig.sortableFields).toContain("rating");
      });

      it("should have filterable fields", () => {
        const fields = productsSieveConfig.filterableFields.map((f) => f.field);

        expect(fields).toContain("status");
        expect(fields).toContain("price");
        expect(fields).toContain("categoryId");
        expect(fields).toContain("shopId");
        expect(fields).toContain("name");
      });

      it("should define operators for each filterable field", () => {
        productsSieveConfig.filterableFields.forEach((field) => {
          expect(field.operators).toBeDefined();
          expect(field.operators.length).toBeGreaterThan(0);
        });
      });

      it("should have default sort", () => {
        expect(productsSieveConfig.defaultSort).toBeDefined();
        expect(productsSieveConfig.defaultSort.field).toBe("createdAt");
        expect(productsSieveConfig.defaultSort.direction).toBe("desc");
      });

      it("should have pagination limits", () => {
        expect(productsSieveConfig.maxPageSize).toBe(50);
        expect(productsSieveConfig.defaultPageSize).toBe(20);
      });

      it("should allow equality operators on status", () => {
        const statusField = productsSieveConfig.filterableFields.find(
          (f) => f.field === "status"
        );

        expect(statusField?.operators).toContain("==");
        expect(statusField?.operators).toContain("!=");
      });

      it("should allow comparison operators on price", () => {
        const priceField = productsSieveConfig.filterableFields.find(
          (f) => f.field === "price"
        );

        expect(priceField?.operators).toContain(">");
        expect(priceField?.operators).toContain(">=");
        expect(priceField?.operators).toContain("<");
        expect(priceField?.operators).toContain("<=");
      });

      it("should allow string operators on name", () => {
        const nameField = productsSieveConfig.filterableFields.find(
          (f) => f.field === "name"
        );

        expect(nameField?.operators).toContain("@=");
        expect(nameField?.operators).toContain("_=");
        expect(nameField?.operators).toContain("@=*");
      });

      it("should define correct field types", () => {
        const statusField = productsSieveConfig.filterableFields.find(
          (f) => f.field === "status"
        );
        expect(statusField?.type).toBe("string");

        const priceField = productsSieveConfig.filterableFields.find(
          (f) => f.field === "price"
        );
        expect(priceField?.type).toBe("number");

        const featuredField = productsSieveConfig.filterableFields.find(
          (f) => f.field === "featured"
        );
        expect(featuredField?.type).toBe("boolean");
      });
    });

    describe("auctionsSieveConfig", () => {
      it("should have correct resource name", () => {
        expect(auctionsSieveConfig.resource).toBe("auctions");
      });

      it("should have auction-specific sortable fields", () => {
        expect(auctionsSieveConfig.sortableFields).toContain("startTime");
        expect(auctionsSieveConfig.sortableFields).toContain("endTime");
        expect(auctionsSieveConfig.sortableFields).toContain("currentBid");
        expect(auctionsSieveConfig.sortableFields).toContain("bidCount");
      });

      it("should have auction-specific filterable fields", () => {
        const fields = auctionsSieveConfig.filterableFields.map((f) => f.field);

        expect(fields).toContain("currentBid");
        expect(fields).toContain("startTime");
        expect(fields).toContain("endTime");
        expect(fields).toContain("type");
      });

      it("should default sort by endTime ascending", () => {
        expect(auctionsSieveConfig.defaultSort.field).toBe("endTime");
        expect(auctionsSieveConfig.defaultSort.direction).toBe("asc");
      });

      it("should allow date operators on time fields", () => {
        const startTimeField = auctionsSieveConfig.filterableFields.find(
          (f) => f.field === "startTime"
        );

        expect(startTimeField?.type).toBe("date");
        expect(startTimeField?.operators).toContain(">");
        expect(startTimeField?.operators).toContain("<");
      });
    });

    describe("ordersSieveConfig", () => {
      it("should have correct resource name", () => {
        expect(ordersSieveConfig.resource).toBe("orders");
      });

      it("should have order-specific sortable fields", () => {
        expect(ordersSieveConfig.sortableFields).toContain("total");
        expect(ordersSieveConfig.sortableFields).toContain("paymentStatus");
      });

      it("should have order-specific filterable fields", () => {
        const fields = ordersSieveConfig.filterableFields.map((f) => f.field);

        expect(fields).toContain("paymentStatus");
        expect(fields).toContain("orderNumber");
        expect(fields).toContain("userId");
      });

      it("should default sort by createdAt descending", () => {
        expect(ordersSieveConfig.defaultSort.field).toBe("createdAt");
        expect(ordersSieveConfig.defaultSort.direction).toBe("desc");
      });

      it("should have higher max page size for orders", () => {
        expect(ordersSieveConfig.maxPageSize).toBe(100);
      });

      it("should allow search on order number", () => {
        const orderNumberField = ordersSieveConfig.filterableFields.find(
          (f) => f.field === "orderNumber"
        );

        expect(orderNumberField?.operators).toContain("==");
        expect(orderNumberField?.operators).toContain("@=");
      });
    });

    describe("usersSieveConfig", () => {
      it("should have correct resource name", () => {
        expect(usersSieveConfig?.resource).toBe("users");
      });

      it("should have user-specific fields", () => {
        if (!usersSieveConfig) return;

        expect(usersSieveConfig.sortableFields).toContain("createdAt");

        const fields = usersSieveConfig.filterableFields.map((f) => f.field);
        expect(fields.length).toBeGreaterThan(0);
      });
    });

    describe("shopsSieveConfig", () => {
      it("should have correct resource name", () => {
        expect(shopsSieveConfig?.resource).toBe("shops");
      });

      it("should have shop-specific fields", () => {
        if (!shopsSieveConfig) return;

        expect(shopsSieveConfig.sortableFields).toContain("createdAt");

        const fields = shopsSieveConfig.filterableFields.map((f) => f.field);
        expect(fields.length).toBeGreaterThan(0);
      });
    });

    describe("categoriesSieveConfig", () => {
      it("should have correct resource name", () => {
        expect(categoriesSieveConfig?.resource).toBe("categories");
      });
    });

    describe("reviewsSieveConfig", () => {
      it("should have correct resource name", () => {
        expect(reviewsSieveConfig?.resource).toBe("reviews");
      });
    });
  });

  describe("getSieveConfig", () => {
    it("should return products config", () => {
      const config = getSieveConfig("products");

      expect(config).toBeDefined();
      expect(config?.resource).toBe("products");
    });

    it("should return auctions config", () => {
      const config = getSieveConfig("auctions");

      expect(config).toBeDefined();
      expect(config?.resource).toBe("auctions");
    });

    it("should return orders config", () => {
      const config = getSieveConfig("orders");

      expect(config).toBeDefined();
      expect(config?.resource).toBe("orders");
    });

    it("should return users config", () => {
      const config = getSieveConfig("users");

      expect(config).toBeDefined();
      expect(config?.resource).toBe("users");
    });

    it("should return shops config", () => {
      const config = getSieveConfig("shops");

      expect(config).toBeDefined();
      expect(config?.resource).toBe("shops");
    });

    it("should return categories config", () => {
      const config = getSieveConfig("categories");

      expect(config).toBeDefined();
      expect(config?.resource).toBe("categories");
    });

    it("should return reviews config", () => {
      const config = getSieveConfig("reviews");

      expect(config).toBeDefined();
      expect(config?.resource).toBe("reviews");
    });

    it("should return undefined for unknown resource", () => {
      const config = getSieveConfig("unknown");

      expect(config).toBeUndefined();
    });

    it("should be case-sensitive", () => {
      const config = getSieveConfig("PRODUCTS");

      expect(config).toBeUndefined();
    });
  });

  describe("getAllSieveConfigs", () => {
    it("should return all config objects", () => {
      const allConfigs = getAllSieveConfigs();

      expect(allConfigs.length).toBeGreaterThan(0);
      expect(allConfigs).toContain(productsSieveConfig);
      expect(allConfigs).toContain(auctionsSieveConfig);
      expect(allConfigs).toContain(ordersSieveConfig);
    });

    it("should return configs with unique resources", () => {
      const allConfigs = getAllSieveConfigs();
      const resources = allConfigs.map((c) => c.resource);
      const uniqueResources = new Set(resources);

      expect(uniqueResources.size).toBe(resources.length);
    });
  });

  describe("Configuration Consistency", () => {
    const allConfigs: SieveConfig[] = getAllSieveConfigs();

    it("should have unique resource names", () => {
      const resourceNames = allConfigs.map((c) => c.resource);
      const uniqueNames = new Set(resourceNames);

      expect(uniqueNames.size).toBe(resourceNames.length);
    });

    it("should have default sort defined", () => {
      allConfigs.forEach((config) => {
        expect(config.defaultSort).toBeDefined();
        expect(config.defaultSort.field).toBeTruthy();
        expect(["asc", "desc"]).toContain(config.defaultSort.direction);
      });
    });

    it("should have pagination limits defined", () => {
      allConfigs.forEach((config) => {
        expect(config.maxPageSize).toBeDefined();
        expect(config.maxPageSize).toBeGreaterThan(0);
        expect(config.defaultPageSize).toBeDefined();
        expect(config.defaultPageSize).toBeGreaterThan(0);
        expect(config.defaultPageSize!).toBeLessThanOrEqual(
          config.maxPageSize!
        );
      });
    });

    it("should have at least one sortable field", () => {
      allConfigs.forEach((config) => {
        expect(config.sortableFields.length).toBeGreaterThan(0);
      });
    });

    it("should have at least one filterable field", () => {
      allConfigs.forEach((config) => {
        expect(config.filterableFields.length).toBeGreaterThan(0);
      });
    });

    it("should have createdAt in sortable fields", () => {
      allConfigs.forEach((config) => {
        expect(config.sortableFields).toContain("createdAt");
      });
    });

    it("should have common filterable fields", () => {
      // Most configs have status field
      const productsHasStatus = productsSieveConfig.filterableFields.some(
        (f) => f.field === "status"
      );
      const auctionsHasStatus = auctionsSieveConfig.filterableFields.some(
        (f) => f.field === "status"
      );
      const ordersHasStatus = ordersSieveConfig.filterableFields.some(
        (f) => f.field === "status"
      );

      expect(productsHasStatus).toBe(true);
      expect(auctionsHasStatus).toBe(true);
      expect(ordersHasStatus).toBe(true);
    });

    it("should have valid field types", () => {
      const validTypes = ["string", "number", "boolean", "date"];

      allConfigs.forEach((config) => {
        config.filterableFields.forEach((field) => {
          expect(validTypes).toContain(field.type);
        });
      });
    });

    it("should have at least one operator per filterable field", () => {
      allConfigs.forEach((config) => {
        config.filterableFields.forEach((field) => {
          expect(field.operators.length).toBeGreaterThan(0);
        });
      });
    });

    it("should not have duplicate sortable fields", () => {
      allConfigs.forEach((config) => {
        const fields = config.sortableFields;
        const uniqueFields = new Set(fields);

        expect(uniqueFields.size).toBe(fields.length);
      });
    });

    it("should not have duplicate filterable fields", () => {
      allConfigs.forEach((config) => {
        const fields = config.filterableFields.map((f) => f.field);
        const uniqueFields = new Set(fields);

        expect(uniqueFields.size).toBe(fields.length);
      });
    });
  });

  describe("Real Code Issues Found", () => {
    it("PATTERN: Default sort should be in sortable fields", () => {
      const testConfigs = getAllSieveConfigs();
      testConfigs.forEach((config) => {
        expect(config.sortableFields).toContain(config.defaultSort.field);
      });
    });

    it("PATTERN: Comparison operators only on number/date fields", () => {
      const comparisonOps = [">", ">=", "<", "<="];
      const testConfigs = getAllSieveConfigs();

      testConfigs.forEach((config) => {
        config.filterableFields.forEach((field) => {
          const hasComparison = field.operators.some((op) =>
            comparisonOps.includes(op)
          );

          if (hasComparison) {
            expect(["number", "date"]).toContain(field.type);
          }
        });
      });
    });

    it("PATTERN: String operators only on string fields", () => {
      const stringOps = ["@=", "_=", "@=*", "_=*", "!@=", "!_="];
      const testConfigs = getAllSieveConfigs();

      testConfigs.forEach((config) => {
        config.filterableFields.forEach((field) => {
          const hasStringOp = field.operators.some((op) =>
            stringOps.includes(op)
          );

          if (hasStringOp) {
            expect(field.type).toBe("string");
          }
        });
      });
    });

    it("SAFETY: Max page size prevents unbounded queries", () => {
      const testConfigs = getAllSieveConfigs();
      testConfigs.forEach((config) => {
        expect(config.maxPageSize).toBeLessThanOrEqual(1000);
      });
    });

    it("FEATURE: Different resources have different pagination limits", () => {
      expect(productsSieveConfig.maxPageSize).toBe(50);
      expect(auctionsSieveConfig.maxPageSize).toBe(50);
      expect(ordersSieveConfig.maxPageSize).toBe(100);
    });

    it("CONSISTENCY: Default page sizes are reasonable", () => {
      const testConfigs = getAllSieveConfigs();
      testConfigs.forEach((config) => {
        expect(config.defaultPageSize).toBeGreaterThan(0);
        expect(config.defaultPageSize).toBeLessThanOrEqual(100);
      });
    });

    it("PATTERN: ID fields only allow equality operators", () => {
      const testConfigs = getAllSieveConfigs();
      testConfigs.forEach((config) => {
        config.filterableFields.forEach((field) => {
          if (field.field.endsWith("Id")) {
            expect(field.operators).toContain("==");
            expect(field.operators).not.toContain(">");
            expect(field.operators).not.toContain("@=");
          }
        });
      });
    });

    it("PATTERN: Status fields always allow == and !=", () => {
      const testConfigs = getAllSieveConfigs();
      testConfigs.forEach((config) => {
        const statusField = config.filterableFields.find(
          (f) => f.field === "status"
        );

        if (statusField) {
          expect(statusField.operators).toContain("==");
          expect(statusField.operators).toContain("!=");
        }
      });
    });
  });
});
