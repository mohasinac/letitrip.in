import { describe, it, expect } from "vitest";
import { validateSieveFilters } from "../sieve-validators";

const ALLOWED = new Set(["status", "brand", "price", "category"]);

describe("validateSieveFilters", () => {
  it("passes through an allowed field clause", () => {
    expect(validateSieveFilters("status==active", ALLOWED)).toBe("status==active");
  });

  it("strips a clause whose field is not in the allowed set", () => {
    expect(validateSieveFilters("internalField==secret", ALLOWED)).toBe("");
  });

  it("strips a malformed clause with no recognizable operator", () => {
    expect(validateSieveFilters("malformed", ALLOWED)).toBe("");
  });

  it("keeps allowed clauses and strips blocked ones in a multi-clause string", () => {
    const result = validateSieveFilters("status==active,internalField==x,brand==pokemon", ALLOWED);
    expect(result).toBe("status==active,brand==pokemon");
  });

  it("strips all clauses when none are in the allowed set", () => {
    expect(validateSieveFilters("foo==bar,baz==qux", ALLOWED)).toBe("");
  });

  it("handles all supported operators: !=", () => {
    expect(validateSieveFilters("status!=inactive", ALLOWED)).toBe("status!=inactive");
  });

  it("handles >= operator", () => {
    expect(validateSieveFilters("price>=1000", ALLOWED)).toBe("price>=1000");
  });

  it("handles <= operator", () => {
    expect(validateSieveFilters("price<=5000", ALLOWED)).toBe("price<=5000");
  });

  it("handles @= operator", () => {
    expect(validateSieveFilters("category@=action", ALLOWED)).toBe("category@=action");
  });

  it("handles @=* operator", () => {
    expect(validateSieveFilters("category@=*action", ALLOWED)).toBe("category@=*action");
  });

  it("trims whitespace around each clause", () => {
    const result = validateSieveFilters(" status==active , brand==hasbro ", ALLOWED);
    expect(result).toBe("status==active,brand==hasbro");
  });

  it("returns empty string when input is empty", () => {
    expect(validateSieveFilters("", ALLOWED)).toBe("");
  });

  it("handles a single allowed clause without dropping trailing comma", () => {
    expect(validateSieveFilters("brand==funko,", ALLOWED)).toBe("brand==funko");
  });

  it("field name with dot notation is validated by its full path", () => {
    const dotSet = new Set(["stats.totalProducts"]);
    expect(validateSieveFilters("stats.totalProducts>=10", dotSet)).toBe("stats.totalProducts>=10");
    expect(validateSieveFilters("stats.totalProducts>=10", ALLOWED)).toBe("");
  });
});
