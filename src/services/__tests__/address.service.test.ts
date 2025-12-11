import type { AddressBE } from "@/types/backend/address.types";
import type { AddressFE, AddressFormFE } from "@/types/frontend/address.types";
import type { PincodeDetails, PostalCodeDetails } from "../address.service";
import { addressService } from "../address.service";
import { apiService } from "../api.service";

jest.mock("../api.service");
jest.mock("@/lib/firebase-error-logger");

describe("AddressService", () => {
  const mockApiService = apiService as jest.Mocked<typeof apiService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiService.get = jest.fn();
    mockApiService.post = jest.fn();
    mockApiService.patch = jest.fn();
    mockApiService.delete = jest.fn();
  });

  describe("getAll", () => {
    it("gets all addresses for user", async () => {
      const mockAddresses: AddressBE[] = [
        {
          id: "addr1",
          userId: "user1",
          fullName: "John Doe",
          phoneNumber: "+919876543210",
          addressType: "home",
          addressLine1: "123 Main St",
          addressLine2: null,
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "IN",
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResponse = { addresses: mockAddresses };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await addressService.getAll();

      expect(apiService.get).toHaveBeenCalledWith("/user/addresses");
      expect(result).toHaveLength(1);
    });

    it("returns empty array when no addresses", async () => {
      const mockResponse = { addresses: [] };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await addressService.getAll();

      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("gets address by ID", async () => {
      const mockAddress: AddressBE = {
        id: "addr1",
        userId: "user1",
        fullName: "John Doe",
        phoneNumber: "+919876543210",
        addressType: "home",
        addressLine1: "123 Main St",
        addressLine2: null,
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "IN",
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockAddress);

      const result = await addressService.getById("addr1");

      expect(apiService.get).toHaveBeenCalledWith("/user/addresses/addr1");
      expect(result.id).toBe("addr1");
    });

    it("handles not found errors", async () => {
      const error = new Error("Address not found");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      await expect(addressService.getById("invalid")).rejects.toThrow(
        "Address not found"
      );
    });
  });

  describe("create", () => {
    it("creates new address", async () => {
      const formData: AddressFormFE = {
        fullName: "Jane Smith",
        phoneNumber: "+919123456789",
        addressType: "home",
        addressLine1: "456 Park Ave",
        addressLine2: "",
        city: "Delhi",
        state: "Delhi",
        postalCode: "110001",
        country: "IN",
        isDefault: false,
      };

      const mockAddress: AddressBE = {
        id: "addr2",
        userId: "user1",
        fullName: "Jane Smith",
        phoneNumber: "+919123456789",
        addressType: "home",
        addressLine1: "456 Park Ave",
        addressLine2: null,
        city: "Delhi",
        state: "Delhi",
        postalCode: "110001",
        country: "IN",
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockAddress);

      const result = await addressService.create(formData);

      expect(apiService.post).toHaveBeenCalledWith(
        "/user/addresses",
        expect.any(Object)
      );
      expect(result.addressLine1).toBe("456 Park Ave");
    });

    it("sets default address", async () => {
      const formData: AddressFormFE = {
        fullName: "Bob Johnson",
        phoneNumber: "+919988776655",
        addressType: "home",
        addressLine1: "789 Street",
        addressLine2: "",
        city: "Bangalore",
        state: "Karnataka",
        postalCode: "560001",
        country: "IN",
        isDefault: true,
      };

      const mockAddress: AddressBE = {
        id: "addr3",
        userId: "user1",
        fullName: "Bob Johnson",
        phoneNumber: "+919988776655",
        addressType: "home",
        addressLine1: "789 Street",
        addressLine2: null,
        city: "Bangalore",
        state: "Karnataka",
        postalCode: "560001",
        country: "IN",
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockAddress);

      const result = await addressService.create(formData);

      expect(result.isDefault).toBe(true);
    });
  });

  describe("update", () => {
    it("updates existing address", async () => {
      const updateData: Partial<AddressFormFE> = {
        addressLine1: "Updated Street",
        city: "Updated City",
      };

      const mockAddress: AddressBE = {
        id: "addr1",
        userId: "user1",
        fullName: "John Doe",
        phoneNumber: "+919876543210",
        addressType: "home",
        addressLine1: "Updated Street",
        addressLine2: null,
        city: "Updated City",
        state: "Maharashtra",
        postalCode: "400001",
        country: "IN",
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockAddress);

      const result = await addressService.update("addr1", updateData);

      expect(apiService.patch).toHaveBeenCalledWith(
        "/user/addresses/addr1",
        updateData
      );
      expect(result.addressLine1).toBe("Updated Street");
    });
  });

  describe("delete", () => {
    it("deletes address", async () => {
      (apiService.delete as jest.Mock).mockResolvedValue(undefined);

      await addressService.delete("addr1");

      expect(apiService.delete).toHaveBeenCalledWith("/user/addresses/addr1");
    });
  });

  describe("setDefault", () => {
    it("sets address as default", async () => {
      const mockAddress: AddressBE = {
        id: "addr1",
        userId: "user1",
        fullName: "John Doe",
        phoneNumber: "+919876543210",
        addressType: "home",
        addressLine1: "123 Main St",
        addressLine2: null,
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "IN",
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockAddress);

      const result = await addressService.setDefault("addr1");

      expect(apiService.patch).toHaveBeenCalledWith("/user/addresses/addr1", {
        isDefault: true,
      });
      expect(result.isDefault).toBe(true);
    });
  });

  describe("lookupPincode", () => {
    it("looks up Indian pincode successfully", async () => {
      const mockDetails: PincodeDetails = {
        pincode: "400001",
        city: "Mumbai",
        state: "Maharashtra",
        stateCode: "MH",
        district: "Mumbai",
        country: "India",
        countryCode: "IN",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockDetails);

      const result = await addressService.lookupPincode("400001");

      expect(apiService.get).toHaveBeenCalledWith("/address/pincode/400001");
      expect(result).toEqual(mockDetails);
    });

    it("throws error for invalid pincode format", async () => {
      // Now we validate pincode format before making API call
      await expect(addressService.lookupPincode("invalid")).rejects.toThrow(
        "[Address] Invalid Indian PIN code format"
      );

      // API should not be called for invalid format
      expect(apiService.get).not.toHaveBeenCalled();
    });

    it("throws error for non-6-digit pincode", async () => {
      await expect(addressService.lookupPincode("12345")).rejects.toThrow(
        "[Address] Invalid Indian PIN code format"
      );
      await expect(addressService.lookupPincode("1234567")).rejects.toThrow(
        "[Address] Invalid Indian PIN code format"
      );
    });

    it("returns null on API error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const result = await addressService.lookupPincode("400001");

      expect(result).toBeNull();
    });
  });

  describe("lookupPostalCode", () => {
    it("looks up international postal code successfully", async () => {
      const mockDetails: PostalCodeDetails = {
        postalCode: "90210",
        city: "Beverly Hills",
        state: "California",
        stateCode: "CA",
        country: "United States",
        countryCode: "US",
        places: [
          {
            name: "Beverly Hills",
            latitude: "34.0901",
            longitude: "-118.4065",
          },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockDetails);

      const result = await addressService.lookupPostalCode("US", "90210");

      expect(apiService.get).toHaveBeenCalledWith(
        "/address/postal-code/US/90210"
      );
      expect(result).toEqual(mockDetails);
    });

    it("returns null for invalid postal code", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("Not found"));

      const result = await addressService.lookupPostalCode("US", "invalid");

      expect(result).toBeNull();
    });
  });

  describe("autocompleteCities", () => {
    it("autocompletes cities with query", async () => {
      const mockCities = [
        { city: "Mumbai", state: "Maharashtra", stateCode: "MH" },
        { city: "Pune", state: "Maharashtra", stateCode: "MH" },
      ];

      (apiService.post as jest.Mock).mockResolvedValue(mockCities);

      const result = await addressService.autocompleteCities({
        query: "mu",
        country: "IN",
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/address/autocomplete/cities",
        { query: "mu", country: "IN" }
      );
      expect(result).toEqual(mockCities);
    });

    it("filters cities by state", async () => {
      const mockCities = [
        { city: "Mumbai", state: "Maharashtra", stateCode: "MH" },
      ];

      (apiService.post as jest.Mock).mockResolvedValue(mockCities);

      await addressService.autocompleteCities({
        query: "mu",
        state: "Maharashtra",
        country: "IN",
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/address/autocomplete/cities",
        { query: "mu", state: "Maharashtra", country: "IN" }
      );
    });

    it("returns empty array on error", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(new Error("API error"));

      const result = await addressService.autocompleteCities({
        query: "test",
        country: "IN",
      });

      expect(result).toEqual([]);
    });
  });

  describe("validateAddress", () => {
    it("validates complete address", () => {
      const address: Partial<AddressFormFE> = {
        addressLine1: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "IN",
      };

      const result = addressService.validateAddress(address);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("rejects short address line", () => {
      const address: Partial<AddressFormFE> = {
        addressLine1: "123",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "IN",
      };

      const result = addressService.validateAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Address line 1 must be at least 5 characters"
      );
    });

    it("requires city", () => {
      const address: Partial<AddressFormFE> = {
        addressLine1: "123 Main Street",
        state: "Maharashtra",
        postalCode: "400001",
        country: "IN",
      };

      const result = addressService.validateAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("City is required");
    });

    it("requires state", () => {
      const address: Partial<AddressFormFE> = {
        addressLine1: "123 Main Street",
        city: "Mumbai",
        postalCode: "400001",
        country: "IN",
      };

      const result = addressService.validateAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("State is required");
    });

    it("requires postal code", () => {
      const address: Partial<AddressFormFE> = {
        addressLine1: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        country: "IN",
      };

      const result = addressService.validateAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Postal code is required");
    });

    it("requires country", () => {
      const address: Partial<AddressFormFE> = {
        addressLine1: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
      };

      const result = addressService.validateAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Country is required");
    });

    it("returns multiple errors", () => {
      const address: Partial<AddressFormFE> = {
        addressLine1: "123",
      };

      const result = addressService.validateAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe("formatAddress", () => {
    it("formats complete address", () => {
      const address: AddressFE = {
        id: "addr1",
        userId: "user1",
        fullName: "John Doe",
        phoneNumber: "+919876543210",
        addressType: "home",
        addressLine1: "123 Main St",
        addressLine2: "Apt 4B",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "IN",
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        formattedAddress: "",
        shortAddress: "",
        typeLabel: "Home",
      };

      const result = addressService.formatAddress(address);

      expect(result).toBe(
        "123 Main St, Apt 4B, Mumbai, Maharashtra, 400001, IN"
      );
    });

    it("formats address without optional fields", () => {
      const address: AddressFE = {
        id: "addr1",
        userId: "user1",
        fullName: "John Doe",
        phoneNumber: "+919876543210",
        addressType: "home",
        addressLine1: "123 Main St",
        addressLine2: null,
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "IN",
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        formattedAddress: "",
        shortAddress: "",
        typeLabel: "Home",
      };

      const result = addressService.formatAddress(address);

      expect(result).toBe("123 Main St, Mumbai, Maharashtra, 400001, IN");
    });

    it("handles minimal address", () => {
      const address: Partial<AddressFormFE> = {
        addressLine1: "123 Street",
        city: "City",
      };

      const result = addressService.formatAddress(address as any);

      expect(result).toBe("123 Street, City");
    });
  });

  describe("getIndianStateCodes", () => {
    it("returns all Indian state codes", () => {
      const states = addressService.getIndianStateCodes();

      expect(states).toHaveLength(36);
      expect(states[0]).toHaveProperty("code");
      expect(states[0]).toHaveProperty("name");
    });

    it("includes Maharashtra", () => {
      const states = addressService.getIndianStateCodes();
      const maharashtra = states.find((s) => s.code === "MH");

      expect(maharashtra).toBeDefined();
      expect(maharashtra?.name).toBe("Maharashtra");
    });

    it("includes Delhi", () => {
      const states = addressService.getIndianStateCodes();
      const delhi = states.find((s) => s.code === "DL");

      expect(delhi).toBeDefined();
      expect(delhi?.name).toBe("Delhi");
    });
  });
});
