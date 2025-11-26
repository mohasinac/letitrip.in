/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";

jest.mock("@/app/api/lib/firebase/collections");

const mockCollections = Collections as jest.MockedObject<typeof Collections>;

describe("/api/orders/[id]/track", () => {
  const createContext = (id: string) => ({
    params: Promise.resolve({ id }),
  });

  let mockDoc: any;
  let mockRef: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDoc = {
      id: "order123",
      exists: true,
      data: jest.fn(),
      get: jest.fn(),
    };

    mockRef = {
      doc: jest.fn(() => mockDoc),
      get: jest.fn(() => Promise.resolve(mockDoc)),
    };

    mockDoc.get.mockResolvedValue(mockDoc);

    mockCollections.orders = jest.fn(() => mockRef);
  });

  describe("GET /api/orders/[id]/track", () => {
    it("should return 404 if order does not exist", async () => {
      mockDoc.exists = false;

      const req = new NextRequest("http://localhost/api/orders/order123/track");
      const context = createContext("order123");

      const response = await GET(req, context);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Not found");
    });

    it("should return pending_shipment if order has no shipment", async () => {
      mockDoc.data.mockReturnValue({
        id: "order123",
        status: "pending",
      });

      const req = new NextRequest("http://localhost/api/orders/order123/track");
      const context = createContext("order123");

      const response = await GET(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe("pending_shipment");
    });

    it("should return in_transit status for shipped order with shipment", async () => {
      mockDoc.data.mockReturnValue({
        id: "order123",
        status: "shipped",
        shipment: {
          carrier: "FedEx",
          tracking_number: "TRACK123",
          eta: "2024-01-15",
        },
      });

      const req = new NextRequest("http://localhost/api/orders/order123/track");
      const context = createContext("order123");

      const response = await GET(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe("in_transit");
      expect(data.data.shipment.carrier).toBe("FedEx");
      expect(data.data.shipment.tracking_number).toBe("TRACK123");
      expect(data.data.shipment.eta).toBe("2024-01-15");
    });

    it("should return delivered status if order is delivered", async () => {
      mockDoc.data.mockReturnValue({
        id: "order123",
        status: "delivered",
        shipment: {
          carrier: "DHL",
          tracking_number: "DHL999",
        },
      });

      const req = new NextRequest("http://localhost/api/orders/order123/track");
      const context = createContext("order123");

      const response = await GET(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe("delivered");
      expect(data.data.shipment).toBeDefined();
    });

    it("should return pending_shipment if order is canceled without shipment", async () => {
      mockDoc.data.mockReturnValue({
        id: "order123",
        status: "canceled",
        shipment: null,
      });

      const req = new NextRequest("http://localhost/api/orders/order123/track");
      const context = createContext("order123");

      const response = await GET(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe("pending_shipment");
    });

    it("should handle order with shipment but pending status", async () => {
      mockDoc.data.mockReturnValue({
        id: "order123",
        status: "pending",
        shipment: {
          carrier: "USPS",
          tracking_number: "USPS123",
        },
      });

      const req = new NextRequest("http://localhost/api/orders/order123/track");
      const context = createContext("order123");

      const response = await GET(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe("pending");
      expect(data.data.shipment.carrier).toBe("USPS");
    });

    it("should return 500 on server error", async () => {
      mockRef.doc.mockImplementation(() => {
        throw new Error("Database error");
      });

      const req = new NextRequest("http://localhost/api/orders/order123/track");
      const context = createContext("order123");

      const response = await GET(req, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to track order");
    });
  });
});
