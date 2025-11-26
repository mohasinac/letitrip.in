/**
 * @jest-environment node
 */

process.env.FIREBASE_PROJECT_ID = "test-project";
process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
process.env.FIREBASE_PRIVATE_KEY = "test-key";

jest.mock("firebase-admin/app", () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => [{ name: "test" }]),
  getApp: jest.fn(() => ({ name: "test" })),
  cert: jest.fn(),
}));

jest.mock("firebase-admin/auth", () => ({
  getAuth: jest.fn(() => ({})),
}));

jest.mock("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
}));

jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/lib/session");
jest.mock("@/app/api/middleware/ratelimiter");
jest.mock("pdfkit");

import { NextRequest, NextResponse } from "next/server";
import { GET } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";
import { withRateLimit } from "@/app/api/middleware/ratelimiter";
import PDFDocument from "pdfkit";

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;
const mockCollections = Collections as jest.MockedObject<typeof Collections>;
const mockWithRateLimit = withRateLimit as jest.MockedFunction<
  typeof withRateLimit
>;
const MockPDFDocument = PDFDocument as jest.MockedClass<typeof PDFDocument>;

describe("/api/orders/[id]/invoice", () => {
  const createContext = (id: string) => ({
    params: Promise.resolve({ id }),
  });

  let mockDoc: any;
  let mockRef: any;
  let mockPdfInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock withRateLimit to just call the handler
    mockWithRateLimit.mockImplementation(async (req, handler) => {
      return handler(req);
    });

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

    // Mock PDFDocument
    mockPdfInstance = {
      on: jest.fn((event, callback) => {
        if (event === "data") {
          // Simulate PDF data chunks
          setTimeout(() => callback(Buffer.from("PDF chunk 1")), 0);
          setTimeout(() => callback(Buffer.from("PDF chunk 2")), 0);
        }
        if (event === "end") {
          setTimeout(callback, 10);
        }
        return mockPdfInstance;
      }),
      fontSize: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      moveDown: jest.fn().mockReturnThis(),
      fillColor: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };

    MockPDFDocument.mockImplementation(() => mockPdfInstance);
  });

  describe("GET /api/orders/[id]/invoice", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/orders/order123/invoice");
      const context = createContext("order123");

      const response = await GET(req, context);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 404 if order does not exist", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });
      mockDoc.exists = false;

      const req = new NextRequest("http://localhost/api/orders/order123/invoice");
      const context = createContext("order123");

      const response = await GET(req, context);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Not found");
    });

    it("should return 403 if user does not own the order", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user2",
        email: "user2@test.com",
        name: "User 2",
        role: "user",
      });
      mockDoc.data.mockReturnValue({
        user_id: "user1",
        amount: 1000,
      });

      const req = new NextRequest("http://localhost/api/orders/order123/invoice");
      const context = createContext("order123");

      const response = await GET(req, context);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Forbidden");
    });

    it("should allow admin to generate invoice for any order", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "admin1",
        email: "admin@test.com",
        name: "Admin",
        role: "admin",
      });
      mockDoc.data.mockReturnValue({
        user_id: "user1",
        amount: 1000,
        items: [{ name: "Product 1", quantity: 2, price: 500 }],
        billing_address: {
          name: "John Doe",
          line1: "123 Main St",
          city: "Mumbai",
          state: "MH",
          pincode: "400001",
          country: "India",
        },
      });

      const req = new NextRequest("http://localhost/api/orders/order123/invoice");
      const context = createContext("order123");

      const response = await GET(req, context);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/pdf");
      expect(response.headers.get("Content-Disposition")).toContain("invoice-order123.pdf");
    });

    it("should allow seller to generate invoice for orders", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "seller1",
        email: "seller@test.com",
        name: "Seller",
        role: "seller",
      });
      mockDoc.data.mockReturnValue({
        user_id: "user1",
        amount: 2000,
        items: [],
      });

      const req = new NextRequest("http://localhost/api/orders/order123/invoice");
      const context = createContext("order123");

      const response = await GET(req, context);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/pdf");
    });

    it("should allow order owner to generate invoice", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });
      mockDoc.data.mockReturnValue({
        user_id: "user1",
        amount: 1500,
        items: [{ name: "Item A", quantity: 1, price: 1500 }],
        shipping_address: {
          name: "Jane Smith",
          line1: "456 Park Ave",
          city: "Delhi",
          state: "DL",
          pincode: "110001",
          country: "India",
        },
      });

      const req = new NextRequest("http://localhost/api/orders/order123/invoice");
      const context = createContext("order123");

      const response = await GET(req, context);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/pdf");
      expect(mockPdfInstance.end).toHaveBeenCalled();
    });

    it("should calculate tax correctly (18% GST)", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });
      mockDoc.data.mockReturnValue({
        user_id: "user1",
        amount: 1000,
        items: [],
      });

      const req = new NextRequest("http://localhost/api/orders/order123/invoice");
      const context = createContext("order123");

      await GET(req, context);

      // Check that PDF text includes tax calculations
      const textCalls = mockPdfInstance.text.mock.calls.map((call: any) => call[0]);
      const taxText = textCalls.find((text: string) => text.includes("GST (18%)"));
      expect(taxText).toBeDefined();
    });

    it("should include order items in invoice", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });
      mockDoc.data.mockReturnValue({
        user_id: "user1",
        amount: 3000,
        items: [
          { name: "Product A", quantity: 2, price: 1000 },
          { product_name: "Product B", quantity: 1, price: 1000 },
        ],
      });

      const req = new NextRequest("http://localhost/api/orders/order123/invoice");
      const context = createContext("order123");

      await GET(req, context);

      const textCalls = mockPdfInstance.text.mock.calls.map((call: any) => call[0]);
      expect(textCalls.some((text: string) => text.includes("Product A"))).toBe(true);
      expect(textCalls.some((text: string) => text.includes("Product B"))).toBe(true);
    });

    it("should use billing address if available", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });
      mockDoc.data.mockReturnValue({
        user_id: "user1",
        amount: 1000,
        items: [],
        billing_address: {
          name: "Billing Name",
          line1: "Billing Address",
          city: "Bangalore",
        },
        shipping_address: {
          name: "Shipping Name",
          line1: "Shipping Address",
        },
      });

      const req = new NextRequest("http://localhost/api/orders/order123/invoice");
      const context = createContext("order123");

      await GET(req, context);

      const textCalls = mockPdfInstance.text.mock.calls.map((call: any) => call[0]);
      expect(textCalls.some((text: string) => text.includes("Billing Name"))).toBe(true);
      expect(textCalls.some((text: string) => text.includes("Billing Address"))).toBe(true);
    });

    it("should fallback to shipping address if no billing address", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });
      mockDoc.data.mockReturnValue({
        user_id: "user1",
        amount: 1000,
        items: [],
        shipping_address: {
          name: "Shipping Name",
          line1: "Shipping Address",
          city: "Chennai",
        },
      });

      const req = new NextRequest("http://localhost/api/orders/order123/invoice");
      const context = createContext("order123");

      await GET(req, context);

      const textCalls = mockPdfInstance.text.mock.calls.map((call: any) => call[0]);
      expect(textCalls.some((text: string) => text.includes("Shipping Name"))).toBe(true);
    });

    it("should handle orders with no items", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });
      mockDoc.data.mockReturnValue({
        user_id: "user1",
        amount: 500,
        items: [],
      });

      const req = new NextRequest("http://localhost/api/orders/order123/invoice");
      const context = createContext("order123");

      await GET(req, context);

      const textCalls = mockPdfInstance.text.mock.calls.map((call: any) => call[0]);
      expect(textCalls.some((text: string) => text.includes("No items recorded"))).toBe(true);
    });

    it("should apply rate limiting", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const req = new NextRequest("http://localhost/api/orders/order123/invoice");
      const context = createContext("order123");

      await GET(req, context);

      expect(mockWithRateLimit).toHaveBeenCalledWith(
        req,
        expect.any(Function),
        { maxRequests: 20, windowMs: 60 * 1000 }
      );
    });

    it("should return 500 on server error", async () => {
      mockGetCurrentUser.mockRejectedValue(new Error("Database error"));

      const req = new NextRequest("http://localhost/api/orders/order123/invoice");
      const context = createContext("order123");

      const response = await GET(req, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to generate invoice");
    });

    it("should include invoice ID in PDF", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });
      mockDoc.data.mockReturnValue({
        user_id: "user1",
        amount: 1000,
        items: [],
      });

      const req = new NextRequest("http://localhost/api/orders/order123/invoice");
      const context = createContext("order123");

      await GET(req, context);

      const textCalls = mockPdfInstance.text.mock.calls.map((call: any) => call[0]);
      expect(textCalls.some((text: string) => text.includes("INV-order123"))).toBe(true);
      expect(textCalls.some((text: string) => text.includes("Order ID: order123"))).toBe(true);
    });

    it("should set proper PDF headers", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });
      mockDoc.data.mockReturnValue({
        user_id: "user1",
        amount: 1000,
        items: [],
      });

      const req = new NextRequest("http://localhost/api/orders/order123/invoice");
      const context = createContext("order123");

      const response = await GET(req, context);

      expect(response.headers.get("Content-Type")).toBe("application/pdf");
      expect(response.headers.get("Content-Disposition")).toContain("inline");
      expect(response.headers.get("Content-Disposition")).toContain("invoice-order123.pdf");
      expect(response.headers.get("Cache-Control")).toBe("no-store");
    });
  });
});
