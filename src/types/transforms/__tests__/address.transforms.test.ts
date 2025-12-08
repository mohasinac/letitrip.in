/**
 * ADDRESS TRANSFORMATION TESTS
 * Tests for FE/BE transformation functions
 */

import { Timestamp } from "firebase/firestore";
import { AddressBE } from "../../backend/address.types";
import { AddressFormFE } from "../../frontend/address.types";
import {
  toBECreateAddressRequest,
  toFEAddress,
  toFEAddresses,
} from "../address.transforms";

describe("Address Transformations", () => {
  const mockTimestamp = Timestamp.fromDate(new Date("2024-01-15T10:00:00Z"));

  const mockAddressBE: AddressBE = {
    id: "addr-123",
    userId: "user-123",
    fullName: "John Doe",
    phoneNumber: "+919876543210",
    addressLine1: "123 Main Street",
    addressLine2: "Apartment 4B",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    country: "India",
    addressType: "home",
    isDefault: true,
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
  };

  describe("toFEAddress", () => {
    it("should transform backend address to frontend address", () => {
      const result = toFEAddress(mockAddressBE);

      expect(result.id).toBe("addr-123");
      expect(result.userId).toBe("user-123");
      expect(result.fullName).toBe("John Doe");
      expect(result.phoneNumber).toBe("+919876543210");
      expect(result.addressLine1).toBe("123 Main Street");
      expect(result.addressLine2).toBe("Apartment 4B");
      expect(result.city).toBe("Mumbai");
      expect(result.state).toBe("Maharashtra");
      expect(result.postalCode).toBe("400001");
      expect(result.country).toBe("India");
      expect(result.addressType).toBe("home");
      expect(result.isDefault).toBe(true);
    });

    it("should format full address correctly", () => {
      const result = toFEAddress(mockAddressBE);

      expect(result.formattedAddress).toContain("123 Main Street");
      expect(result.formattedAddress).toContain("Apartment 4B");
      expect(result.formattedAddress).toContain("Mumbai");
      expect(result.formattedAddress).toContain("Maharashtra");
      expect(result.formattedAddress).toContain("400001");
      expect(result.formattedAddress).toContain("India");
    });

    it("should format short address correctly", () => {
      const result = toFEAddress(mockAddressBE);

      expect(result.shortAddress).toBe("Mumbai, Maharashtra");
    });

    it("should set type label for home address", () => {
      const result = toFEAddress(mockAddressBE);

      expect(result.typeLabel).toBe("Home");
    });

    it("should set type label for work address", () => {
      const address: AddressBE = {
        ...mockAddressBE,
        addressType: "work",
      };

      const result = toFEAddress(address);

      expect(result.typeLabel).toBe("Work");
    });

    it("should set type label for other address", () => {
      const address: AddressBE = {
        ...mockAddressBE,
        addressType: "other",
      };

      const result = toFEAddress(address);

      expect(result.typeLabel).toBe("Other");
    });

    it("should parse Firestore Timestamp to Date", () => {
      const result = toFEAddress(mockAddressBE);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should parse ISO string dates", () => {
      const address: AddressBE = {
        ...mockAddressBE,
        createdAt: "2024-01-15T10:00:00Z" as any,
        updatedAt: "2024-01-15T10:00:00Z" as any,
      };

      const result = toFEAddress(address);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should handle address without addressLine2", () => {
      const address: AddressBE = {
        ...mockAddressBE,
        addressLine2: "",
      };

      const result = toFEAddress(address);

      expect(result.formattedAddress).not.toContain("Apartment 4B");
      expect(result.formattedAddress).toContain("123 Main Street");
    });

    it("should handle null addressLine2", () => {
      const address: AddressBE = {
        ...mockAddressBE,
        addressLine2: null as any,
      };

      const result = toFEAddress(address);

      expect(result.formattedAddress).toContain("123 Main Street");
      expect(result.formattedAddress).toContain("Mumbai");
    });

    it("should format address with all fields in correct order", () => {
      const result = toFEAddress(mockAddressBE);
      const parts = result.formattedAddress.split(", ");

      expect(parts[0]).toBe("123 Main Street");
      expect(parts[1]).toBe("Apartment 4B");
      expect(parts[2]).toBe("Mumbai");
      expect(parts[3]).toBe("Maharashtra");
      expect(parts[4]).toBe("400001");
      expect(parts[5]).toBe("India");
    });
  });

  describe("toBECreateAddressRequest", () => {
    const mockFormFE: AddressFormFE = {
      fullName: "Jane Smith",
      phoneNumber: "+919999999999",
      addressLine1: "456 Park Avenue",
      addressLine2: "Floor 2",
      city: "Delhi",
      state: "Delhi",
      postalCode: "110001",
      country: "India",
      addressType: "work",
      isDefault: false,
    };

    it("should transform frontend form to backend create request", () => {
      const result = toBECreateAddressRequest(mockFormFE);

      expect(result.fullName).toBe("Jane Smith");
      expect(result.phoneNumber).toBe("+919999999999");
      expect(result.addressLine1).toBe("456 Park Avenue");
      expect(result.addressLine2).toBe("Floor 2");
      expect(result.city).toBe("Delhi");
      expect(result.state).toBe("Delhi");
      expect(result.postalCode).toBe("110001");
      expect(result.country).toBe("India");
      expect(result.addressType).toBe("work");
      expect(result.isDefault).toBe(false);
    });

    it("should handle empty addressLine2", () => {
      const form: AddressFormFE = {
        ...mockFormFE,
        addressLine2: "",
      };

      const result = toBECreateAddressRequest(form);

      expect(result.addressLine2).toBeUndefined();
    });

    it("should handle null addressLine2", () => {
      const form: AddressFormFE = {
        ...mockFormFE,
        addressLine2: null as any,
      };

      const result = toBECreateAddressRequest(form);

      expect(result.addressLine2).toBeUndefined();
    });

    it("should preserve addressType correctly", () => {
      const homeForm: AddressFormFE = {
        ...mockFormFE,
        addressType: "home",
      };

      const result = toBECreateAddressRequest(homeForm);

      expect(result.addressType).toBe("home");
    });

    it("should set isDefault correctly", () => {
      const defaultForm: AddressFormFE = {
        ...mockFormFE,
        isDefault: true,
      };

      const result = toBECreateAddressRequest(defaultForm);

      expect(result.isDefault).toBe(true);
    });
  });

  describe("toFEAddresses (batch)", () => {
    it("should transform array of backend addresses to frontend", () => {
      const addresses: AddressBE[] = [
        mockAddressBE,
        {
          ...mockAddressBE,
          id: "addr-456",
          addressType: "work",
          city: "Bangalore",
          state: "Karnataka",
        },
      ];

      const result = toFEAddresses(addresses);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("addr-123");
      expect(result[0].typeLabel).toBe("Home");
      expect(result[1].id).toBe("addr-456");
      expect(result[1].typeLabel).toBe("Work");
      expect(result[1].shortAddress).toBe("Bangalore, Karnataka");
    });

    it("should handle empty array", () => {
      const result = toFEAddresses([]);

      expect(result).toEqual([]);
    });

    it("should maintain order of addresses", () => {
      const addresses: AddressBE[] = [
        { ...mockAddressBE, id: "addr-1", addressType: "home" },
        { ...mockAddressBE, id: "addr-2", addressType: "work" },
        { ...mockAddressBE, id: "addr-3", addressType: "other" },
      ];

      const result = toFEAddresses(addresses);

      expect(result[0].id).toBe("addr-1");
      expect(result[1].id).toBe("addr-2");
      expect(result[2].id).toBe("addr-3");
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle minimal address data", () => {
      const minimalAddress: AddressBE = {
        id: "addr-min",
        userId: "user-123",
        fullName: "Test User",
        phoneNumber: "+911234567890",
        addressLine1: "Test Street",
        addressLine2: "",
        city: "Test City",
        state: "Test State",
        postalCode: "123456",
        country: "India",
        addressType: "home",
        isDefault: false,
        createdAt: mockTimestamp,
        updatedAt: mockTimestamp,
      };

      const result = toFEAddress(minimalAddress);

      expect(result.id).toBe("addr-min");
      expect(result.formattedAddress).not.toContain(",,");
    });

    it("should handle special characters in address", () => {
      const specialAddress: AddressBE = {
        ...mockAddressBE,
        addressLine1: "123-A, Sector #5",
        addressLine2: "Near ABC Plaza & XYZ Mall",
        fullName: "O'Brien D'Souza",
      };

      const result = toFEAddress(specialAddress);

      expect(result.addressLine1).toBe("123-A, Sector #5");
      expect(result.addressLine2).toBe("Near ABC Plaza & XYZ Mall");
      expect(result.fullName).toBe("O'Brien D'Souza");
    });

    it("should handle very long address fields", () => {
      const longAddress: AddressBE = {
        ...mockAddressBE,
        addressLine1: "A".repeat(200),
        addressLine2: "B".repeat(200),
      };

      const result = toFEAddress(longAddress);

      expect(result.addressLine1).toHaveLength(200);
      expect(result.formattedAddress.length).toBeGreaterThan(400);
    });

    it("should handle different postal code formats", () => {
      const postalCodes = ["400001", "110001", "560001", "600001"];

      postalCodes.forEach((code) => {
        const address: AddressBE = {
          ...mockAddressBE,
          postalCode: code,
        };

        const result = toFEAddress(address);

        expect(result.postalCode).toBe(code);
        expect(result.formattedAddress).toContain(code);
      });
    });

    it("should handle different phone number formats", () => {
      const phoneNumbers = [
        "+919876543210",
        "+91 98765 43210",
        "9876543210",
        "+91-9876543210",
      ];

      phoneNumbers.forEach((phone) => {
        const address: AddressBE = {
          ...mockAddressBE,
          phoneNumber: phone,
        };

        const result = toFEAddress(address);

        expect(result.phoneNumber).toBe(phone);
      });
    });

    it("should handle international addresses", () => {
      const internationalAddress: AddressBE = {
        ...mockAddressBE,
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "USA",
      };

      const result = toFEAddress(internationalAddress);

      expect(result.city).toBe("New York");
      expect(result.state).toBe("NY");
      expect(result.country).toBe("USA");
      expect(result.shortAddress).toBe("New York, NY");
    });

    it("should handle address with unicode characters", () => {
      const unicodeAddress: AddressBE = {
        ...mockAddressBE,
        addressLine1: "१२३ मुंबई रोड",
        city: "मुंबई",
        fullName: "राज कुमार",
      };

      const result = toFEAddress(unicodeAddress);

      expect(result.addressLine1).toBe("१२३ मुंबई रोड");
      expect(result.city).toBe("मुंबई");
      expect(result.fullName).toBe("राज कुमार");
    });
  });

  describe("Address type labels", () => {
    it("should handle all address type labels", () => {
      const types: Array<"home" | "work" | "other"> = ["home", "work", "other"];
      const expectedLabels = ["Home", "Work", "Other"];

      types.forEach((type, index) => {
        const address: AddressBE = {
          ...mockAddressBE,
          addressType: type,
        };

        const result = toFEAddress(address);

        expect(result.typeLabel).toBe(expectedLabels[index]);
      });
    });
  });

  describe("Default address handling", () => {
    it("should correctly identify default address", () => {
      const result = toFEAddress(mockAddressBE);

      expect(result.isDefault).toBe(true);
    });

    it("should correctly identify non-default address", () => {
      const address: AddressBE = {
        ...mockAddressBE,
        isDefault: false,
      };

      const result = toFEAddress(address);

      expect(result.isDefault).toBe(false);
    });
  });
});
