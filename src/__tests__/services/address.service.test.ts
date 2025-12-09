import { logError } from "@/lib/firebase-error-logger";
import { addressService } from "@/services/address.service";
import { apiService } from "@/services/api.service";
import { AddressBE } from "@/types/backend/address.types";
import { AddressFE, AddressFormFE } from "@/types/frontend/address.types";

// Mock dependencies
jest.mock("@/services/api.service");
jest.mock("@/lib/firebase-error-logger");

describe("AddressService", () => {
  const mockApiService = apiService as jest.Mocked<typeof apiService>;
  const mockLogError = logError as jest.MockedFunction<typeof logError>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // MOCK DATA
  // ============================================================================

  const mockAddressBE: AddressBE = {
    id: "addr_123",
    userId: "user_456",
    addressLine1: "123 Test Street",
    addressLine2: "Apt 4B",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    country: "India",
    countryCode: "IN",
    stateCode: "MH",
    phone: "+919876543210",
    isDefault: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const mockAddressFE: AddressFE = {
    id: "addr_123",
    userId: "user_456",
    addressLine1: "123 Test Street",
    addressLine2: "Apt 4B",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    country: "India",
    countryCode: "IN",
    stateCode: "MH",
    phone: "+919876543210",
    isDefault: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const mockAddressFormFE: AddressFormFE = {
    addressLine1: "123 Test Street",
    addressLine2: "Apt 4B",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    country: "India",
    countryCode: "IN",
    stateCode: "MH",
    phone: "+919876543210",
    isDefault: false,
  };

  // ============================================================================
  // CRUD OPERATIONS TESTS
  // ============================================================================

  describe("getAll", () => {
    it("should fetch all addresses successfully", async () => {
      const mockResponse = { addresses: [mockAddressBE] };
      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await addressService.getAll();

      expect(mockApiService.get).toHaveBeenCalledWith("/user/addresses");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: mockAddressBE.id,
        addressLine1: mockAddressBE.addressLine1,
      });
    });

    it("should return empty array when no addresses exist", async () => {
      const mockResponse = { addresses: [] };
      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await addressService.getAll();

      expect(result).toEqual([]);
    });

    it("should handle API errors gracefully", async () => {
      const error = new Error("Network error");
      mockApiService.get.mockRejectedValue(error);

      await expect(addressService.getAll()).rejects.toThrow("Network error");
    });

    it("should handle multiple addresses correctly", async () => {
      const mockResponse = {
        addresses: [
          mockAddressBE,
          { ...mockAddressBE, id: "addr_124", isDefault: false },
          { ...mockAddressBE, id: "addr_125", isDefault: false },
        ],
      };
      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await addressService.getAll();

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe("addr_123");
      expect(result[1].id).toBe("addr_124");
      expect(result[2].id).toBe("addr_125");
    });
  });

  describe("getById", () => {
    it("should fetch address by ID successfully", async () => {
      mockApiService.get.mockResolvedValue(mockAddressBE);

      const result = await addressService.getById("addr_123");

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/user/addresses/addr_123"
      );
      expect(result).toMatchObject({
        id: mockAddressBE.id,
        addressLine1: mockAddressBE.addressLine1,
      });
    });

    it("should handle non-existent address ID", async () => {
      const error = new Error("Address not found");
      mockApiService.get.mockRejectedValue(error);

      await expect(addressService.getById("invalid_id")).rejects.toThrow(
        "Address not found"
      );
    });

    it("should handle empty string ID", async () => {
      mockApiService.get.mockResolvedValue(mockAddressBE);

      await addressService.getById("");

      expect(mockApiService.get).toHaveBeenCalledWith("/user/addresses/");
    });
  });

  describe("create", () => {
    it("should create new address successfully", async () => {
      mockApiService.post.mockResolvedValue(mockAddressBE);

      const result = await addressService.create(mockAddressFormFE);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/user/addresses",
        expect.objectContaining({
          addressLine1: mockAddressFormFE.addressLine1,
          city: mockAddressFormFE.city,
        })
      );
      expect(result).toMatchObject({
        id: mockAddressBE.id,
        addressLine1: mockAddressBE.addressLine1,
      });
    });

    it("should handle validation errors from API", async () => {
      const error = new Error("Invalid address data");
      mockApiService.post.mockRejectedValue(error);

      await expect(addressService.create(mockAddressFormFE)).rejects.toThrow(
        "Invalid address data"
      );
    });

    it("should create address with minimal required fields", async () => {
      const minimalAddress: AddressFormFE = {
        addressLine1: "123 Main St",
        city: "Delhi",
        state: "Delhi",
        postalCode: "110001",
        country: "India",
        countryCode: "IN",
        phone: "+919876543210",
      };

      const minimalBE = {
        ...mockAddressBE,
        addressLine1: "123 Main St",
        city: "Delhi",
        state: "Delhi",
        postalCode: "110001",
        id: "addr_new",
      };
      delete (minimalBE as any).addressLine2;

      mockApiService.post.mockResolvedValue(minimalBE);

      const result = await addressService.create(minimalAddress);

      expect(result.addressLine1).toBe("123 Main St");
      expect(result.addressLine2).toBeUndefined();
    });

    it("should create address with all optional fields", async () => {
      const fullAddress: AddressFormFE = {
        ...mockAddressFormFE,
        addressLine2: "Floor 5",
        stateCode: "MH",
        isDefault: true,
      };

      mockApiService.post.mockResolvedValue({
        ...mockAddressBE,
        addressLine2: "Floor 5",
      });

      const result = await addressService.create(fullAddress);

      expect(result.addressLine2).toBe("Floor 5");
    });
  });

  describe("update", () => {
    it("should update address successfully", async () => {
      const updates = { addressLine1: "456 New Street" };
      const updatedAddress = { ...mockAddressBE, ...updates };
      mockApiService.patch.mockResolvedValue(updatedAddress);

      const result = await addressService.update("addr_123", updates);

      expect(mockApiService.patch).toHaveBeenCalledWith(
        "/user/addresses/addr_123",
        updates
      );
      expect(result.addressLine1).toBe("456 New Street");
    });

    it("should handle partial updates", async () => {
      const partialUpdate = { city: "Pune" };
      mockApiService.patch.mockResolvedValue({
        ...mockAddressBE,
        city: "Pune",
      });

      const result = await addressService.update("addr_123", partialUpdate);

      expect(result.city).toBe("Pune");
      expect(mockApiService.patch).toHaveBeenCalledWith(
        "/user/addresses/addr_123",
        partialUpdate
      );
    });

    it("should handle update errors", async () => {
      const error = new Error("Update failed");
      mockApiService.patch.mockRejectedValue(error);

      await expect(
        addressService.update("addr_123", { city: "Pune" })
      ).rejects.toThrow("Update failed");
    });

    it("should update multiple fields at once", async () => {
      const updates = {
        addressLine1: "New Street",
        city: "Bangalore",
        state: "Karnataka",
        postalCode: "560001",
      };
      mockApiService.patch.mockResolvedValue({ ...mockAddressBE, ...updates });

      const result = await addressService.update("addr_123", updates);

      expect(result.addressLine1).toBe("New Street");
      expect(result.city).toBe("Bangalore");
      expect(result.state).toBe("Karnataka");
    });
  });

  describe("delete", () => {
    it("should delete address successfully", async () => {
      mockApiService.delete.mockResolvedValue(undefined);

      await addressService.delete("addr_123");

      expect(mockApiService.delete).toHaveBeenCalledWith(
        "/user/addresses/addr_123"
      );
    });

    it("should handle deletion of non-existent address", async () => {
      const error = new Error("Address not found");
      mockApiService.delete.mockRejectedValue(error);

      await expect(addressService.delete("invalid_id")).rejects.toThrow(
        "Address not found"
      );
    });

    it("should not return any value after successful deletion", async () => {
      mockApiService.delete.mockResolvedValue(undefined);

      const result = await addressService.delete("addr_123");

      expect(result).toBeUndefined();
    });
  });

  describe("setDefault", () => {
    it("should set address as default successfully", async () => {
      const defaultAddress = { ...mockAddressBE, isDefault: true };
      mockApiService.patch.mockResolvedValue(defaultAddress);

      const result = await addressService.setDefault("addr_123");

      expect(mockApiService.patch).toHaveBeenCalledWith(
        "/user/addresses/addr_123",
        { isDefault: true }
      );
      expect(result.isDefault).toBe(true);
    });

    it("should handle errors when setting default", async () => {
      const error = new Error("Failed to set default");
      mockApiService.patch.mockRejectedValue(error);

      await expect(addressService.setDefault("addr_123")).rejects.toThrow(
        "Failed to set default"
      );
    });

    it("should work with valid address ID", async () => {
      mockApiService.patch.mockResolvedValue({
        ...mockAddressBE,
        isDefault: true,
      });

      const result = await addressService.setDefault("addr_123");

      expect(result.id).toBe("addr_123");
      expect(result.isDefault).toBe(true);
    });
  });

  // ============================================================================
  // ADDRESS LOOKUP METHODS TESTS
  // ============================================================================

  describe("lookupPincode", () => {
    it("should lookup valid Indian pincode successfully", async () => {
      const mockPincodeDetails = {
        pincode: "400001",
        city: "Mumbai",
        state: "Maharashtra",
        stateCode: "MH",
        district: "Mumbai",
        country: "India",
        countryCode: "IN",
      };
      mockApiService.get.mockResolvedValue(mockPincodeDetails);

      const result = await addressService.lookupPincode("400001");

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/address/pincode/400001"
      );
      expect(result).toEqual(mockPincodeDetails);
    });

    it("should return null for invalid pincode", async () => {
      const error = new Error("Pincode not found");
      mockApiService.get.mockRejectedValue(error);

      const result = await addressService.lookupPincode("999999");

      expect(result).toBeNull();
      expect(mockLogError).toHaveBeenCalledWith(error, {
        component: "AddressService.lookupPincode",
        pincode: "999999",
      });
    });

    it("should handle network errors gracefully", async () => {
      const error = new Error("Network timeout");
      mockApiService.get.mockRejectedValue(error);

      const result = await addressService.lookupPincode("400001");

      expect(result).toBeNull();
      expect(mockLogError).toHaveBeenCalled();
    });

    it("should handle 6-digit pincode format", async () => {
      const mockDetails = {
        pincode: "110001",
        city: "Delhi",
        state: "Delhi",
        stateCode: "DL",
        district: "Central Delhi",
        country: "India",
        countryCode: "IN",
      };
      mockApiService.get.mockResolvedValue(mockDetails);

      const result = await addressService.lookupPincode("110001");

      expect(result?.pincode).toBe("110001");
      expect(result?.city).toBe("Delhi");
    });

    it("should log error with correct context on failure", async () => {
      const error = new Error("API Error");
      mockApiService.get.mockRejectedValue(error);

      await addressService.lookupPincode("123456");

      expect(mockLogError).toHaveBeenCalledWith(error, {
        component: "AddressService.lookupPincode",
        pincode: "123456",
      });
    });
  });

  describe("lookupPostalCode", () => {
    it("should lookup valid international postal code", async () => {
      const mockPostalDetails = {
        postalCode: "10001",
        city: "New York",
        state: "New York",
        stateCode: "NY",
        country: "United States",
        countryCode: "US",
        places: [
          {
            name: "New York",
            latitude: "40.7506",
            longitude: "-73.9971",
          },
        ],
      };
      mockApiService.get.mockResolvedValue(mockPostalDetails);

      const result = await addressService.lookupPostalCode("US", "10001");

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/address/postal-code/US/10001"
      );
      expect(result).toEqual(mockPostalDetails);
    });

    it("should return null for invalid postal code", async () => {
      const error = new Error("Postal code not found");
      mockApiService.get.mockRejectedValue(error);

      const result = await addressService.lookupPostalCode("US", "00000");

      expect(result).toBeNull();
      expect(mockLogError).toHaveBeenCalledWith(error, {
        component: "AddressService.lookupPostalCode",
        countryCode: "US",
        postalCode: "00000",
      });
    });

    it("should handle different country codes", async () => {
      const mockUKPostal = {
        postalCode: "SW1A1AA",
        city: "London",
        state: "England",
        country: "United Kingdom",
        countryCode: "GB",
      };
      mockApiService.get.mockResolvedValue(mockUKPostal);

      const result = await addressService.lookupPostalCode("GB", "SW1A1AA");

      expect(result?.countryCode).toBe("GB");
      expect(result?.city).toBe("London");
    });

    it("should log error with correct context on failure", async () => {
      const error = new Error("API Error");
      mockApiService.get.mockRejectedValue(error);

      await addressService.lookupPostalCode("CA", "M5H2N2");

      expect(mockLogError).toHaveBeenCalledWith(error, {
        component: "AddressService.lookupPostalCode",
        countryCode: "CA",
        postalCode: "M5H2N2",
      });
    });
  });

  describe("autocompleteCities", () => {
    it("should autocomplete cities successfully", async () => {
      const mockCities = [
        { city: "Mumbai", state: "Maharashtra", stateCode: "MH" },
        { city: "Mysore", state: "Karnataka", stateCode: "KA" },
      ];
      mockApiService.post.mockResolvedValue(mockCities);

      const result = await addressService.autocompleteCities({
        query: "Mu",
        country: "India",
      });

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/address/autocomplete/cities",
        { query: "Mu", country: "India" }
      );
      expect(result).toEqual(mockCities);
    });

    it("should handle state-specific city search", async () => {
      const mockCities = [
        { city: "Mumbai", state: "Maharashtra", stateCode: "MH" },
        { city: "Pune", state: "Maharashtra", stateCode: "MH" },
      ];
      mockApiService.post.mockResolvedValue(mockCities);

      const result = await addressService.autocompleteCities({
        query: "M",
        state: "Maharashtra",
        country: "India",
      });

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/address/autocomplete/cities",
        { query: "M", state: "Maharashtra", country: "India" }
      );
      expect(result).toHaveLength(2);
    });

    it("should respect limit parameter", async () => {
      const mockCities = [
        { city: "Mumbai", state: "Maharashtra", stateCode: "MH" },
        { city: "Mysore", state: "Karnataka", stateCode: "KA" },
        { city: "Madurai", state: "Tamil Nadu", stateCode: "TN" },
      ];
      mockApiService.post.mockResolvedValue(mockCities.slice(0, 2));

      const result = await addressService.autocompleteCities({
        query: "M",
        country: "India",
        limit: 2,
      });

      expect(result).toHaveLength(2);
    });

    it("should return empty array on error", async () => {
      const error = new Error("Service unavailable");
      mockApiService.post.mockRejectedValue(error);

      const result = await addressService.autocompleteCities({
        query: "X",
        country: "India",
      });

      expect(result).toEqual([]);
      expect(mockLogError).toHaveBeenCalled();
    });

    it("should handle empty query gracefully", async () => {
      mockApiService.post.mockResolvedValue([]);

      const result = await addressService.autocompleteCities({
        query: "",
        country: "India",
      });

      expect(result).toEqual([]);
    });
  });

  // ============================================================================
  // VALIDATION METHODS TESTS
  // ============================================================================

  describe("validateAddress", () => {
    it("should validate complete address successfully", async () => {
      const validAddress: Partial<AddressFormFE> = {
        addressLine1: "123 Test Street",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "India",
      };

      const result = addressService.validateAddress(validAddress);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject address with short addressLine1", async () => {
      const invalidAddress: Partial<AddressFormFE> = {
        addressLine1: "123",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "India",
      };

      const result = addressService.validateAddress(invalidAddress);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Address line 1 must be at least 5 characters"
      );
    });

    it("should reject address with missing city", async () => {
      const invalidAddress: Partial<AddressFormFE> = {
        addressLine1: "123 Test Street",
        state: "Maharashtra",
        postalCode: "400001",
        country: "India",
      };

      const result = addressService.validateAddress(invalidAddress);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("City is required");
    });

    it("should reject address with missing state", async () => {
      const invalidAddress: Partial<AddressFormFE> = {
        addressLine1: "123 Test Street",
        city: "Mumbai",
        postalCode: "400001",
        country: "India",
      };

      const result = addressService.validateAddress(invalidAddress);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("State is required");
    });

    it("should reject address with missing postal code", async () => {
      const invalidAddress: Partial<AddressFormFE> = {
        addressLine1: "123 Test Street",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
      };

      const result = addressService.validateAddress(invalidAddress);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Postal code is required");
    });

    it("should reject address with missing country", async () => {
      const invalidAddress: Partial<AddressFormFE> = {
        addressLine1: "123 Test Street",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
      };

      const result = addressService.validateAddress(invalidAddress);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Country is required");
    });

    it("should return multiple errors for multiple issues", async () => {
      const invalidAddress: Partial<AddressFormFE> = {
        addressLine1: "123",
        city: "",
      };

      const result = addressService.validateAddress(invalidAddress);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it("should handle whitespace-only values as invalid", async () => {
      const invalidAddress: Partial<AddressFormFE> = {
        addressLine1: "     ",
        city: "   ",
        state: "  ",
        postalCode: "  ",
        country: "  ",
      };

      const result = addressService.validateAddress(invalidAddress);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should accept address with optional addressLine2", async () => {
      const validAddress: Partial<AddressFormFE> = {
        addressLine1: "123 Test Street",
        addressLine2: "Apt 4B",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "India",
      };

      const result = addressService.validateAddress(validAddress);

      expect(result.isValid).toBe(true);
    });
  });

  // ============================================================================
  // FORMATTING METHODS TESTS
  // ============================================================================

  describe("formatAddress", () => {
    it("should format complete address correctly", () => {
      const address: AddressFE = mockAddressFE;

      const result = addressService.formatAddress(address);

      expect(result).toBe(
        "123 Test Street, Apt 4B, Mumbai, Maharashtra, 400001, India"
      );
    });

    it("should format address without addressLine2", () => {
      const address: AddressFE = {
        ...mockAddressFE,
        addressLine2: undefined,
      };

      const result = addressService.formatAddress(address);

      expect(result).toBe(
        "123 Test Street, Mumbai, Maharashtra, 400001, India"
      );
      expect(result).not.toContain("undefined");
    });

    it("should handle minimal address fields", () => {
      const address: Partial<AddressFE> = {
        addressLine1: "123 Street",
        city: "Delhi",
        postalCode: "110001",
        country: "India",
      };

      const result = addressService.formatAddress(address as AddressFE);

      expect(result).toBe("123 Street, Delhi, 110001, India");
    });

    it("should handle empty address gracefully", () => {
      const address: Partial<AddressFE> = {};

      const result = addressService.formatAddress(address as AddressFE);

      expect(result).toBe("");
    });

    it("should not include empty string fields", () => {
      const address: Partial<AddressFE> = {
        addressLine1: "123 Street",
        addressLine2: "",
        city: "Mumbai",
        state: "",
        postalCode: "400001",
        country: "India",
      };

      const result = addressService.formatAddress(address as AddressFE);

      expect(result).not.toContain(",,");
    });
  });

  // ============================================================================
  // INDIAN STATE CODES TESTS
  // ============================================================================

  describe("getIndianStateCodes", () => {
    it("should return all Indian state codes", () => {
      const stateCodes = addressService.getIndianStateCodes();

      expect(stateCodes).toBeInstanceOf(Array);
      expect(stateCodes.length).toBeGreaterThan(0);
    });

    it("should include Maharashtra", () => {
      const stateCodes = addressService.getIndianStateCodes();

      const maharashtra = stateCodes.find((s) => s.code === "MH");
      expect(maharashtra).toBeDefined();
      expect(maharashtra?.name).toBe("Maharashtra");
    });

    it("should include Delhi", () => {
      const stateCodes = addressService.getIndianStateCodes();

      const delhi = stateCodes.find((s) => s.code === "DL");
      expect(delhi).toBeDefined();
      expect(delhi?.name).toBe("Delhi");
    });

    it("should include all major states", () => {
      const stateCodes = addressService.getIndianStateCodes();

      const majorStates = ["MH", "DL", "KA", "TN", "UP", "GJ"];
      majorStates.forEach((code) => {
        const state = stateCodes.find((s) => s.code === code);
        expect(state).toBeDefined();
      });
    });

    it("should return consistent results", () => {
      const result1 = addressService.getIndianStateCodes();
      const result2 = addressService.getIndianStateCodes();

      expect(result1).toEqual(result2);
    });

    it("should have correct structure for each state", () => {
      const stateCodes = addressService.getIndianStateCodes();

      stateCodes.forEach((state) => {
        expect(state).toHaveProperty("code");
        expect(state).toHaveProperty("name");
        expect(typeof state.code).toBe("string");
        expect(typeof state.name).toBe("string");
        expect(state.code.length).toBeGreaterThan(0);
        expect(state.name.length).toBeGreaterThan(0);
      });
    });

    it("should include union territories", () => {
      const stateCodes = addressService.getIndianStateCodes();

      const unionTerritories = ["CH", "PY", "LD", "AN"];
      unionTerritories.forEach((code) => {
        const territory = stateCodes.find((s) => s.code === code);
        expect(territory).toBeDefined();
      });
    });

    it("should have 36 states and union territories", () => {
      const stateCodes = addressService.getIndianStateCodes();

      expect(stateCodes.length).toBe(36);
    });
  });

  // ============================================================================
  // EDGE CASES AND ERROR HANDLING
  // ============================================================================

  describe("Edge Cases", () => {
    it("should handle undefined response from API", async () => {
      mockApiService.get.mockResolvedValue(undefined);

      await expect(addressService.getAll()).rejects.toThrow();
    });

    it("should handle null values in address data", async () => {
      const addressWithNulls = {
        ...mockAddressBE,
        addressLine2: null,
        stateCode: null,
      };
      mockApiService.get.mockResolvedValue(addressWithNulls);

      const result = await addressService.getById("addr_123");

      expect(result).toBeDefined();
    });

    it("should handle very long address lines", async () => {
      const longAddress = "A".repeat(500);
      const address: AddressFormFE = {
        ...mockAddressFormFE,
        addressLine1: longAddress,
      };

      const validation = addressService.validateAddress(address);

      expect(validation.isValid).toBe(true);
    });

    it("should handle special characters in addresses", async () => {
      const specialAddress: AddressFormFE = {
        ...mockAddressFormFE,
        addressLine1: "123 St. Mary's Ave, O'Brien Rd",
      };

      mockApiService.post.mockResolvedValue({
        ...mockAddressBE,
        addressLine1: specialAddress.addressLine1,
      });

      const result = await addressService.create(specialAddress);

      expect(result.addressLine1).toContain("'");
    });

    it("should handle concurrent requests", async () => {
      mockApiService.get.mockResolvedValue({ addresses: [mockAddressBE] });

      const promises = [
        addressService.getAll(),
        addressService.getAll(),
        addressService.getAll(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result).toHaveLength(1);
      });
    });
  });
});
