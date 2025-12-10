/**
 * Unit Tests for Sieve Parser
 */

import {
  buildSieveQueryString,
  createDefaultSieveQuery,
  mergeSieveQuery,
  parseSieveFromURL,
  parseSieveQuery,
  updateURLWithSieve,
} from "../parser";
import { SieveConfig, SieveQuery } from "../types";

describe("Sieve Parser", () => {
  describe("parsePagination", () => {
    it("should parse valid pagination parameters", () => {
      const params = new URLSearchParams("page=2&pageSize=50");
      const result = parseSieveQuery(params);

      expect(result.query.page).toBe(2);
      expect(result.query.pageSize).toBe(50);
      expect(result.errors).toHaveLength(0);
    });

    it("should use default values when not provided", () => {
      const params = new URLSearchParams("");
      const result = parseSieveQuery(params);

      expect(result.query.page).toBe(1);
      expect(result.query.pageSize).toBe(20);
    });

    it("should reject invalid page number", () => {
      const params = new URLSearchParams("page=-1");
      const result = parseSieveQuery(params);

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: "invalid_pagination",
          field: "page",
        })
      );
    });

    it("should reject non-numeric page", () => {
      const params = new URLSearchParams("page=abc");
      const result = parseSieveQuery(params);

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: "invalid_pagination",
          field: "page",
        })
      );
    });

    it("should cap pageSize at maximum", () => {
      const params = new URLSearchParams("pageSize=1000");
      const result = parseSieveQuery(params);

      expect(result.query.pageSize).toBe(100); // MAX_PAGE_SIZE
    });

    it("should reject invalid pageSize", () => {
      const params = new URLSearchParams("pageSize=0");
      const result = parseSieveQuery(params);

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: "invalid_pagination",
          field: "pageSize",
        })
      );
    });

    it("should use custom max page size from config", () => {
      const params = new URLSearchParams("pageSize=200");
      const config: SieveConfig = { maxPageSize: 50 };
      const result = parseSieveQuery(params, config);

      expect(result.query.pageSize).toBe(50);
    });

    it("should use custom default page size from config", () => {
      const params = new URLSearchParams("");
      const config: SieveConfig = { defaultPageSize: 10 };
      const result = parseSieveQuery(params, config);

      expect(result.query.pageSize).toBe(10);
    });
  });

  describe("parseSorts", () => {
    it("should parse single ascending sort", () => {
      const params = new URLSearchParams("sorts=createdAt");
      const result = parseSieveQuery(params);

      expect(result.query.sorts).toEqual([
        { field: "createdAt", direction: "asc" },
      ]);
    });

    it("should parse single descending sort", () => {
      const params = new URLSearchParams("sorts=-price");
      const result = parseSieveQuery(params);

      expect(result.query.sorts).toEqual([
        { field: "price", direction: "desc" },
      ]);
    });

    it("should parse multiple sorts", () => {
      const params = new URLSearchParams("sorts=-createdAt,price,-stock");
      const result = parseSieveQuery(params);

      expect(result.query.sorts).toEqual([
        { field: "createdAt", direction: "desc" },
        { field: "price", direction: "asc" },
        { field: "stock", direction: "desc" },
      ]);
    });

    it("should handle empty sorts parameter", () => {
      const params = new URLSearchParams("sorts=");
      const result = parseSieveQuery(params);

      expect(result.query.sorts).toEqual([]);
    });

    it("should filter out invalid sortable fields", () => {
      const params = new URLSearchParams("sorts=createdAt,invalidField,price");
      const config: SieveConfig = {
        sortableFields: ["createdAt", "price", "stock"],
      };
      const result = parseSieveQuery(params, config);

      expect(result.query.sorts).toEqual([
        { field: "createdAt", direction: "asc" },
        { field: "price", direction: "asc" },
      ]);
      expect(result.warnings).toContain(
        "Field 'invalidField' is not sortable. Ignored."
      );
    });

    it("should use default sort when none provided", () => {
      const params = new URLSearchParams("");
      const config: SieveConfig = {
        defaultSort: { field: "createdAt", direction: "desc" },
      };
      const result = parseSieveQuery(params, config);

      expect(result.query.sorts).toEqual([
        { field: "createdAt", direction: "desc" },
      ]);
    });

    it("should trim whitespace from sort fields", () => {
      const params = new URLSearchParams("sorts= createdAt , -price ");
      const result = parseSieveQuery(params);

      expect(result.query.sorts).toEqual([
        { field: "createdAt", direction: "asc" },
        { field: "price", direction: "desc" },
      ]);
    });
  });

  describe("parseFilters", () => {
    it("should parse equality filter", () => {
      const params = new URLSearchParams("filters=status==published");
      const result = parseSieveQuery(params);

      expect(result.query.filters).toEqual([
        {
          field: "status",
          operator: "==",
          value: "published",
          isNegated: false,
          isCaseInsensitive: false,
        },
      ]);
    });

    it("should parse inequality filter", () => {
      const params = new URLSearchParams("filters=status!=draft");
      const result = parseSieveQuery(params);

      expect(result.query.filters).toContainEqual(
        expect.objectContaining({
          field: "status",
          operator: "!=",
          value: "draft",
          isNegated: true,
        })
      );
    });

    it("should parse comparison filters", () => {
      const params = new URLSearchParams("filters=price>100,stock<=50");
      const result = parseSieveQuery(params);

      expect(result.query.filters).toEqual([
        expect.objectContaining({
          field: "price",
          operator: ">",
          value: "100",
        }),
        expect.objectContaining({
          field: "stock",
          operator: "<=",
          value: "50",
        }),
      ]);
    });

    it("should parse null check operators", () => {
      const params = new URLSearchParams(
        "filters=deletedAt==null,archivedAt!=null"
      );
      const result = parseSieveQuery(params);

      expect(result.query.filters).toEqual([
        expect.objectContaining({
          field: "deletedAt",
          operator: "==null",
          value: null,
        }),
        expect.objectContaining({
          field: "archivedAt",
          operator: "!=null",
          value: null,
        }),
      ]);
    });

    it("should parse case-insensitive contains", () => {
      const params = new URLSearchParams("filters=name@=test");
      const result = parseSieveQuery(params);

      expect(result.query.filters).toContainEqual(
        expect.objectContaining({
          field: "name",
          operator: "@=",
          value: "test",
          isCaseInsensitive: true,
        })
      );
    });

    it("should parse starts with operator", () => {
      const params = new URLSearchParams("filters=code_=ABC");
      const result = parseSieveQuery(params);

      expect(result.query.filters).toContainEqual(
        expect.objectContaining({
          field: "code",
          operator: "_=",
          value: "ABC",
        })
      );
    });

    it("should parse wildcard operators", () => {
      const params = new URLSearchParams("filters=name@=*test*,code_=*ABC*");
      const result = parseSieveQuery(params);

      expect(result.query.filters).toEqual([
        expect.objectContaining({
          operator: "@=*",
          isCaseInsensitive: true,
        }),
        expect.objectContaining({
          operator: "_=*",
          isCaseInsensitive: true,
        }),
      ]);
    });

    it("should parse ends with operator", () => {
      const params = new URLSearchParams("filters=filename_-=.pdf");
      const result = parseSieveQuery(params);

      expect(result.query.filters).toContainEqual(
        expect.objectContaining({
          field: "filename",
          operator: "_-=",
          value: ".pdf",
        })
      );
    });

    it("should parse negated operators", () => {
      const params = new URLSearchParams("filters=name!@=test,code!_=ABC");
      const result = parseSieveQuery(params);

      expect(result.query.filters).toEqual([
        expect.objectContaining({
          operator: "!@=",
          isNegated: true,
        }),
        expect.objectContaining({
          operator: "!_=",
          isNegated: true,
        }),
      ]);
    });

    it("should handle escaped commas in values", () => {
      const params = new URLSearchParams("filters=name==Test\\, Inc.");
      const result = parseSieveQuery(params);

      expect(result.query.filters).toContainEqual(
        expect.objectContaining({
          field: "name",
          value: "Test, Inc.",
        })
      );
    });

    it("should validate against filterable fields config", () => {
      const params = new URLSearchParams("filters=invalidField==test");
      const config: SieveConfig = {
        filterableFields: [
          { field: "status", operators: ["==", "!="], type: "string" },
        ],
      };
      const result = parseSieveQuery(params, config);

      expect(result.warnings).toContain(
        "Field 'invalidField' is not filterable. Ignored."
      );
    });

    it("should validate operator for field", () => {
      const params = new URLSearchParams("filters=status>100");
      const config: SieveConfig = {
        filterableFields: [
          { field: "status", operators: ["==", "!="], type: "string" },
        ],
      };
      const result = parseSieveQuery(params, config);

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: "invalid_filter",
          field: "status",
        })
      );
    });

    it("should apply field mappings", () => {
      const params = new URLSearchParams("filters=userId==123");
      const config: SieveConfig = {
        fieldMappings: { userId: "user.id" },
      };
      const result = parseSieveQuery(params, config);

      expect(result.query.filters).toContainEqual(
        expect.objectContaining({
          field: "user.id",
        })
      );
    });

    it("should parse boolean values", () => {
      const params = new URLSearchParams("filters=isActive==true");
      const config: SieveConfig = {
        filterableFields: [
          { field: "isActive", operators: ["=="], type: "boolean" },
        ],
      };
      const result = parseSieveQuery(params, config);

      expect(result.query.filters).toContainEqual(
        expect.objectContaining({
          field: "isActive",
          value: true,
        })
      );
    });

    it("should parse number values", () => {
      const params = new URLSearchParams("filters=price>99.99");
      const config: SieveConfig = {
        filterableFields: [
          { field: "price", operators: [">", "<", ">=", "<="], type: "number" },
        ],
      };
      const result = parseSieveQuery(params, config);

      expect(result.query.filters).toContainEqual(
        expect.objectContaining({
          field: "price",
          value: 99.99,
        })
      );
    });

    it("should handle filter without valid operator", () => {
      const params = new URLSearchParams("filters=invalidfilter");
      const result = parseSieveQuery(params);

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: "invalid_filter",
          message: expect.stringContaining("No valid operator found"),
        })
      );
    });

    it("should handle empty filters parameter", () => {
      const params = new URLSearchParams("filters=");
      const result = parseSieveQuery(params);

      expect(result.query.filters).toEqual([]);
    });
  });

  describe("buildSieveQueryString", () => {
    it("should build query string with pagination", () => {
      const query: SieveQuery = {
        page: 2,
        pageSize: 50,
        sorts: [],
        filters: [],
      };

      const result = buildSieveQueryString(query);

      expect(result).toContain("page=2");
      expect(result).toContain("pageSize=50");
    });

    it("should build query string with sorts", () => {
      const query: SieveQuery = {
        page: 1,
        pageSize: 20,
        sorts: [
          { field: "createdAt", direction: "desc" },
          { field: "price", direction: "asc" },
        ],
        filters: [],
      };

      const result = buildSieveQueryString(query);

      expect(result).toContain("sorts=-createdAt%2Cprice");
    });

    it("should build query string with filters", () => {
      const query: SieveQuery = {
        page: 1,
        pageSize: 20,
        sorts: [],
        filters: [
          {
            field: "status",
            operator: "==",
            value: "published",
            isNegated: false,
            isCaseInsensitive: false,
          },
          {
            field: "price",
            operator: ">",
            value: 100,
            isNegated: false,
            isCaseInsensitive: false,
          },
        ],
      };

      const result = buildSieveQueryString(query);

      expect(result).toContain("filters=status%3D%3Dpublished%2Cprice%3E100");
    });

    it("should skip default values", () => {
      const query: SieveQuery = {
        page: 1,
        pageSize: 20,
        sorts: [],
        filters: [],
      };

      const result = buildSieveQueryString(query);

      expect(result).toBe("");
    });

    it("should handle null filter values", () => {
      const query: SieveQuery = {
        page: 1,
        pageSize: 20,
        sorts: [],
        filters: [
          {
            field: "deletedAt",
            operator: "==null",
            value: null,
            isNegated: false,
            isCaseInsensitive: false,
          },
        ],
      };

      const result = buildSieveQueryString(query);

      expect(result).toContain("deletedAt%3D%3Dnull");
    });
  });

  describe("mergeSieveQuery", () => {
    it("should merge pagination updates", () => {
      const current: SieveQuery = {
        page: 1,
        pageSize: 20,
        sorts: [],
        filters: [],
      };

      const result = mergeSieveQuery(current, { page: 3 });

      expect(result).toEqual({
        page: 3,
        pageSize: 20,
        sorts: [],
        filters: [],
      });
    });

    it("should merge sorts", () => {
      const current: SieveQuery = {
        page: 1,
        pageSize: 20,
        sorts: [{ field: "createdAt", direction: "desc" }],
        filters: [],
      };

      const result = mergeSieveQuery(current, {
        sorts: [{ field: "price", direction: "asc" }],
      });

      expect(result.sorts).toEqual([{ field: "price", direction: "asc" }]);
    });

    it("should merge filters", () => {
      const current: SieveQuery = {
        page: 1,
        pageSize: 20,
        sorts: [],
        filters: [
          {
            field: "status",
            operator: "==",
            value: "draft",
            isNegated: false,
            isCaseInsensitive: false,
          },
        ],
      };

      const result = mergeSieveQuery(current, {
        filters: [
          {
            field: "status",
            operator: "==",
            value: "published",
            isNegated: false,
            isCaseInsensitive: false,
          },
        ],
      });

      expect(result.filters).toEqual([
        {
          field: "status",
          operator: "==",
          value: "published",
          isNegated: false,
          isCaseInsensitive: false,
        },
      ]);
    });

    it("should preserve unmodified fields", () => {
      const current: SieveQuery = {
        page: 5,
        pageSize: 50,
        sorts: [{ field: "createdAt", direction: "desc" }],
        filters: [],
      };

      const result = mergeSieveQuery(current, { page: 6 });

      expect(result.pageSize).toBe(50);
      expect(result.sorts).toEqual([{ field: "createdAt", direction: "desc" }]);
    });
  });

  describe("createDefaultSieveQuery", () => {
    it("should create default query without config", () => {
      const result = createDefaultSieveQuery();

      expect(result).toEqual({
        page: 1,
        pageSize: 20,
        sorts: [],
        filters: [],
      });
    });

    it("should use config defaults", () => {
      const config: SieveConfig = {
        defaultPageSize: 10,
        defaultSort: { field: "createdAt", direction: "desc" },
      };

      const result = createDefaultSieveQuery(config);

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        sorts: [{ field: "createdAt", direction: "desc" }],
        filters: [],
      });
    });
  });

  describe("parseSieveFromURL", () => {
    it("should parse complete URL", () => {
      const url = "https://example.com/api/products?page=2&sorts=-price";
      const result = parseSieveFromURL(url);

      expect(result.query.page).toBe(2);
      expect(result.query.sorts).toEqual([
        { field: "price", direction: "desc" },
      ]);
    });

    it("should handle relative URL", () => {
      const url = "/api/products?pageSize=50";
      const result = parseSieveFromURL(url);

      expect(result.query.pageSize).toBe(50);
    });

    it("should handle URL without query string", () => {
      const url = "https://example.com/api/products";
      const result = parseSieveFromURL(url);

      expect(result.query).toEqual({
        page: 1,
        pageSize: 20,
        sorts: [],
        filters: [],
      });
    });
  });

  describe("updateURLWithSieve", () => {
    it("should update URL with sieve query", () => {
      const baseUrl = "/api/products";
      const query: Partial<SieveQuery> = {
        page: 2,
        sorts: [{ field: "price", direction: "desc" }],
      };

      const result = updateURLWithSieve(baseUrl, query);

      expect(result).toContain("page=2");
      expect(result).toContain("sorts=-price");
    });

    it("should preserve non-sieve query parameters", () => {
      const baseUrl = "/api/products?foo=bar";
      const query: Partial<SieveQuery> = { page: 2 };

      const result = updateURLWithSieve(baseUrl, query);

      expect(result).toContain("foo=bar");
      expect(result).toContain("page=2");
    });

    it("should replace existing sieve parameters", () => {
      const baseUrl = "/api/products?page=1&sorts=name";
      const query: Partial<SieveQuery> = {
        page: 3,
        sorts: [{ field: "price", direction: "desc" }],
      };

      const result = updateURLWithSieve(baseUrl, query);

      expect(result).toContain("page=3");
      expect(result).toContain("sorts=-price");
      expect(result).not.toContain("sorts=name");
    });

    it("should handle empty query", () => {
      const baseUrl = "/api/products?page=2";
      const query: Partial<SieveQuery> = {};

      const result = updateURLWithSieve(baseUrl, query);

      // Empty query generates empty string, doesn't clear existing params
      // This preserves existing query parameters
      expect(result).toContain("/api/products");
    });
  });

  describe("Edge Cases", () => {
    it("should handle multiple filters with same field", () => {
      const params = new URLSearchParams("filters=price>100,price<1000");
      const result = parseSieveQuery(params);

      expect(result.query.filters).toHaveLength(2);
      expect(result.query.filters[0].field).toBe("price");
      expect(result.query.filters[1].field).toBe("price");
    });

    it("should handle special characters in filter values", () => {
      const params = new URLSearchParams("filters=name==Test%20%26%20Co");
      const result = parseSieveQuery(params);

      expect(result.query.filters[0].value).toBe("Test & Co");
    });

    it("should handle empty filter value", () => {
      const params = new URLSearchParams("filters=description==");
      const result = parseSieveQuery(params);

      expect(result.query.filters).toContainEqual(
        expect.objectContaining({
          field: "description",
          value: "",
        })
      );
    });

    it("should handle very large page numbers", () => {
      const params = new URLSearchParams("page=999999");
      const result = parseSieveQuery(params);

      expect(result.query.page).toBe(999999);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle decimal page numbers", () => {
      const params = new URLSearchParams("page=1.5");
      const result = parseSieveQuery(params);

      expect(result.query.page).toBe(1); // parseInt truncates
    });

    it("should handle zero page", () => {
      const params = new URLSearchParams("page=0");
      const result = parseSieveQuery(params);

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: "invalid_pagination",
        })
      );
    });
  });
});
