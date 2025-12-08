import {
  formatPrice,
  formatPriceRange,
  safeToLocaleString,
} from "../price.utils";

describe("formatPrice", () => {
  describe("basic formatting", () => {
    it("formats INR price with symbol by default", () => {
      expect(formatPrice(1234.56)).toBe("₹1,234.56");
    });

    it("formats USD price", () => {
      expect(formatPrice(1234.56, { currency: "USD" })).toBe("$1,234.56");
    });

    it("formats EUR price", () => {
      expect(formatPrice(1234.56, { currency: "EUR" })).toBe("1.234,56€");
    });

    it("formats GBP price", () => {
      expect(formatPrice(1234.56, { currency: "GBP" })).toBe("£1,234.56");
    });

    it("formats price without symbol", () => {
      expect(formatPrice(1234.56, { showSymbol: false })).toBe("1,234.56");
    });

    it("formats price without decimals", () => {
      expect(formatPrice(1234.56, { showDecimals: false })).toBe("₹1,235");
    });

    it("formats price without symbol and decimals", () => {
      expect(
        formatPrice(1234.56, { showSymbol: false, showDecimals: false })
      ).toBe("1,235");
    });
  });

  describe("edge cases", () => {
    it("returns N/A for null", () => {
      expect(formatPrice(null)).toBe("N/A");
    });

    it("returns N/A for undefined", () => {
      expect(formatPrice(undefined)).toBe("N/A");
    });

    it("returns N/A for NaN", () => {
      expect(formatPrice(NaN)).toBe("N/A");
    });

    it("formats zero correctly", () => {
      expect(formatPrice(0)).toBe("₹0.00");
    });

    it("formats negative values", () => {
      expect(formatPrice(-1234.56)).toBe("₹-1,234.56");
    });

    it("formats large numbers", () => {
      expect(formatPrice(1234567890.12)).toBe("₹1,23,45,67,890.12");
    });

    it("formats very small decimals", () => {
      expect(formatPrice(0.01)).toBe("₹0.01");
    });
  });

  describe("locale-specific formatting", () => {
    it("uses Indian number format for INR", () => {
      expect(formatPrice(100000)).toBe("₹1,00,000.00");
    });

    it("uses US number format for USD", () => {
      expect(formatPrice(100000, { currency: "USD" })).toBe("$100,000.00");
    });
  });
});

describe("safeToLocaleString", () => {
  it("formats number with default locale", () => {
    expect(safeToLocaleString(1234.56)).toBe("1,234.56");
  });

  it("formats number with custom locale", () => {
    expect(safeToLocaleString(1234.56, "en-US")).toBe("1,234.56");
  });

  it("formats number without unnecessary decimals", () => {
    expect(safeToLocaleString(1234)).toBe("1,234");
  });

  it("formats number with up to 2 decimals", () => {
    expect(safeToLocaleString(1234.567)).toBe("1,234.57");
  });

  it("returns 0 for null", () => {
    expect(safeToLocaleString(null)).toBe("0");
  });

  it("returns 0 for undefined", () => {
    expect(safeToLocaleString(undefined)).toBe("0");
  });

  it("returns 0 for NaN", () => {
    expect(safeToLocaleString(NaN)).toBe("0");
  });

  it("formats zero correctly", () => {
    expect(safeToLocaleString(0)).toBe("0");
  });

  it("formats negative values", () => {
    expect(safeToLocaleString(-1234.56)).toBe("-1,234.56");
  });

  it("formats large numbers", () => {
    expect(safeToLocaleString(1234567890)).toBe("1,23,45,67,890");
  });
});

describe("formatPriceRange", () => {
  it("formats price range with default currency", () => {
    expect(formatPriceRange(100, 500)).toBe("₹100.00 - ₹500.00");
  });

  it("formats price range with custom currency", () => {
    expect(formatPriceRange(100, 500, "USD")).toBe("$100.00 - $500.00");
  });

  it("formats single price when min equals max", () => {
    expect(formatPriceRange(100, 100)).toBe("₹100.00");
  });

  it("returns N/A when min is null", () => {
    expect(formatPriceRange(null, 500)).toBe("N/A");
  });

  it("returns N/A when max is null", () => {
    expect(formatPriceRange(100, null)).toBe("N/A");
  });

  it("returns N/A when both are null", () => {
    expect(formatPriceRange(null, null)).toBe("N/A");
  });

  it("returns N/A when min is undefined", () => {
    expect(formatPriceRange(undefined, 500)).toBe("N/A");
  });

  it("returns N/A when max is undefined", () => {
    expect(formatPriceRange(100, undefined)).toBe("N/A");
  });

  it("returns N/A when min is NaN", () => {
    expect(formatPriceRange(NaN, 500)).toBe("N/A");
  });

  it("returns N/A when max is NaN", () => {
    expect(formatPriceRange(100, NaN)).toBe("N/A");
  });

  it("formats range with decimal values", () => {
    expect(formatPriceRange(99.99, 499.99)).toBe("₹99.99 - ₹499.99");
  });

  it("formats range with large numbers", () => {
    // Indian locale uses comma grouping in 2,2,3 pattern: 10,000 and 50,000
    const result = formatPriceRange(10000, 50000);
    expect(result).toContain("10,000");
    expect(result).toContain("50,000");
  });

  it("formats range with zero", () => {
    expect(formatPriceRange(0, 100)).toBe("₹0.00 - ₹100.00");
  });
});
