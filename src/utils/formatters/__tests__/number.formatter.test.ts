/**
 * @jest-environment jsdom
 */

import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatFileSize,
  formatCompactNumber,
  formatDecimal,
  formatOrdinal,
  parseFormattedNumber,
} from "../number.formatter";

describe("Number Formatter", () => {
  describe("formatCurrency", () => {
    it("should format USD currency", () => {
      expect(formatCurrency(1234.56, "USD", "en-US")).toBe("$1,234.56");
      expect(formatCurrency(1000, "USD", "en-US")).toBe("$1,000.00");
      expect(formatCurrency(0, "USD", "en-US")).toBe("$0.00");
    });

    it("should format EUR currency", () => {
      expect(formatCurrency(1234.56, "EUR", "de-DE")).toBe("1.234,56 €");
      expect(formatCurrency(1000, "EUR", "de-DE")).toBe("1.000,00 €");
    });

    it("should format GBP currency", () => {
      expect(formatCurrency(1234.56, "GBP", "en-GB")).toBe("£1,234.56");
    });

    it("should handle negative values", () => {
      expect(formatCurrency(-1234.56, "USD", "en-US")).toBe("-$1,234.56");
    });

    it("should handle zero", () => {
      expect(formatCurrency(0, "USD", "en-US")).toBe("$0.00");
    });
  });

  describe("formatNumber", () => {
    it("should format numbers with thousand separators", () => {
      expect(formatNumber(1234567, "en-US")).toBe("1,234,567");
      expect(formatNumber(1000, "en-US")).toBe("1,000");
      expect(formatNumber(123, "en-US")).toBe("123");
    });

    it("should format decimals", () => {
      expect(formatNumber(1234.56, "en-US")).toBe("1,234.56");
      expect(formatNumber(0.123, "en-US")).toBe("0.123");
    });

    it("should handle different locales", () => {
      expect(formatNumber(1234567, "de-DE")).toBe("1.234.567");
      expect(formatNumber(1234.56, "de-DE")).toBe("1.234,56");
    });

    it("should handle zero", () => {
      expect(formatNumber(0, "en-US")).toBe("0");
    });
  });

  describe("formatPercentage", () => {
    it("should format percentages with default decimals", () => {
      expect(formatPercentage(0.1234)).toBe("12%");
      expect(formatPercentage(0.5)).toBe("50%");
      expect(formatPercentage(1)).toBe("100%");
    });

    it("should format percentages with custom decimals", () => {
      expect(formatPercentage(0.1234, 2)).toBe("12.34%");
      expect(formatPercentage(0.5678, 1)).toBe("56.8%");
      expect(formatPercentage(1.2345, 3)).toBe("123.450%");
    });

    it("should handle zero", () => {
      expect(formatPercentage(0)).toBe("0%");
      expect(formatPercentage(0, 2)).toBe("0.00%");
    });
  });

  describe("formatFileSize", () => {
    it("should format bytes", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
      expect(formatFileSize(500)).toBe("500 Bytes");
      expect(formatFileSize(1023)).toBe("1023 Bytes");
    });

    it("should format kilobytes", () => {
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB");
      expect(formatFileSize(10240)).toBe("10 KB");
    });

    it("should format megabytes", () => {
      expect(formatFileSize(1048576)).toBe("1 MB");
      expect(formatFileSize(5242880)).toBe("5 MB");
      expect(formatFileSize(1572864)).toBe("1.5 MB");
    });

    it("should format gigabytes", () => {
      expect(formatFileSize(1073741824)).toBe("1 GB");
      expect(formatFileSize(5368709120)).toBe("5 GB");
    });

    it("should format terabytes", () => {
      expect(formatFileSize(1099511627776)).toBe("1 TB");
      expect(formatFileSize(2199023255552)).toBe("2 TB");
    });
  });

  describe("formatCompactNumber", () => {
    it("should format numbers less than 1000", () => {
      expect(formatCompactNumber(0)).toBe("0");
      expect(formatCompactNumber(123)).toBe("123");
      expect(formatCompactNumber(999)).toBe("999");
    });

    it("should format thousands", () => {
      expect(formatCompactNumber(1000)).toBe("1.0K");
      expect(formatCompactNumber(1500)).toBe("1.5K");
      expect(formatCompactNumber(999999)).toBe("1000.0K");
    });

    it("should format millions", () => {
      expect(formatCompactNumber(1000000)).toBe("1.0M");
      expect(formatCompactNumber(1500000)).toBe("1.5M");
      expect(formatCompactNumber(999999999)).toBe("1000.0M");
    });

    it("should format billions", () => {
      expect(formatCompactNumber(1000000000)).toBe("1.0B");
      expect(formatCompactNumber(5500000000)).toBe("5.5B");
    });
  });

  describe("formatDecimal", () => {
    it("should format with default 2 decimals", () => {
      expect(formatDecimal(1.234)).toBe("1.23");
      expect(formatDecimal(1.235)).toBe("1.24"); // Rounding
      expect(formatDecimal(1)).toBe("1.00");
    });

    it("should format with custom decimals", () => {
      expect(formatDecimal(1.23456, 0)).toBe("1");
      expect(formatDecimal(1.23456, 1)).toBe("1.2");
      expect(formatDecimal(1.23456, 3)).toBe("1.235");
      expect(formatDecimal(1.23456, 5)).toBe("1.23456");
    });

    it("should handle zero", () => {
      expect(formatDecimal(0)).toBe("0.00");
      expect(formatDecimal(0, 0)).toBe("0");
    });
  });

  describe("formatOrdinal", () => {
    it("should format 1st-3rd", () => {
      expect(formatOrdinal(1)).toBe("1st");
      expect(formatOrdinal(2)).toBe("2nd");
      expect(formatOrdinal(3)).toBe("3rd");
    });

    it("should format 4th-20th", () => {
      expect(formatOrdinal(4)).toBe("4th");
      expect(formatOrdinal(10)).toBe("10th");
      expect(formatOrdinal(20)).toBe("20th");
    });

    it("should format 21st-23rd", () => {
      expect(formatOrdinal(21)).toBe("21st");
      expect(formatOrdinal(22)).toBe("22nd");
      expect(formatOrdinal(23)).toBe("23rd");
    });

    it("should format 11th-13th special cases", () => {
      expect(formatOrdinal(11)).toBe("11th");
      expect(formatOrdinal(12)).toBe("12th");
      expect(formatOrdinal(13)).toBe("13th");
      expect(formatOrdinal(111)).toBe("111th");
      expect(formatOrdinal(112)).toBe("112th");
      expect(formatOrdinal(113)).toBe("113th");
    });

    it("should handle large numbers", () => {
      expect(formatOrdinal(101)).toBe("101st");
      expect(formatOrdinal(1000)).toBe("1000th");
      expect(formatOrdinal(1001)).toBe("1001st");
    });
  });

  describe("parseFormattedNumber", () => {
    it("should parse currency", () => {
      expect(parseFormattedNumber("$1,234.56")).toBe(1234.56);
      expect(parseFormattedNumber("€1.234,56")).toBe(1234.56);
      expect(parseFormattedNumber("£1,000.00")).toBe(1000);
    });

    it("should parse percentages", () => {
      expect(parseFormattedNumber("50%")).toBe(50);
      expect(parseFormattedNumber("12.34%")).toBe(12.34);
    });

    it("should parse numbers with separators", () => {
      expect(parseFormattedNumber("1,234,567")).toBe(1234567);
      expect(parseFormattedNumber("1.234.567")).toBe(1234567);
    });

    it("should handle negative numbers", () => {
      expect(parseFormattedNumber("-$1,234.56")).toBe(-1234.56);
      expect(parseFormattedNumber("-50%")).toBe(-50);
    });

    it("should handle plain numbers", () => {
      expect(parseFormattedNumber("1234.56")).toBe(1234.56);
      expect(parseFormattedNumber("0")).toBe(0);
    });
  });
});
