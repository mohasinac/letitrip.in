/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import { resolveShopSlug } from "@/app/api/lib/utils/shop-slug-resolver";

// Mock dependencies
jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/lib/utils/shop-slug-resolver");

const mockResolveShopSlug = resolveShopSlug as jest.MockedFunction<
  typeof resolveShopSlug
>;

describe("GET /api/coupons/validate-code", () => {
  let mockQuery: any;
  let mockSnapshot: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSnapshot = {
      docs: [],
    };

    mockQuery = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue(mockSnapshot),
    };

    (Collections.coupons as jest.Mock).mockReturnValue(mockQuery);
    mockResolveShopSlug.mockResolvedValue("shop1");
  });

  it("should require code parameter", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/coupons/validate-code?shop_slug=test-shop",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Code parameter is required");
  });

  it("should require shop_slug parameter", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/coupons/validate-code?code=SAVE10",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Shop slug parameter is required");
  });

  it("should normalize code (uppercase, trim)", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/coupons/validate-code?code= save10 &shop_slug=test-shop",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.code).toBe("SAVE10");
    expect(mockQuery.where).toHaveBeenCalledWith("code", "==", "SAVE10");
  });

  it("should return 404 when shop not found", async () => {
    mockResolveShopSlug.mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost:3000/api/coupons/validate-code?code=SAVE10&shop_slug=invalid-shop",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Shop not found");
  });

  it("should return available=true when code doesn't exist", async () => {
    mockSnapshot.docs = [];

    const request = new NextRequest(
      "http://localhost:3000/api/coupons/validate-code?code=SAVE10&shop_slug=test-shop",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.available).toBe(true);
    expect(data.code).toBe("SAVE10");
    expect(data.shop_id).toBe("shop1");
  });

  it("should return available=false when code exists", async () => {
    mockSnapshot.docs = [{ id: "coupon1" }];

    const request = new NextRequest(
      "http://localhost:3000/api/coupons/validate-code?code=SAVE10&shop_slug=test-shop",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.available).toBe(false);
  });

  it("should exclude current coupon when exclude_id provided", async () => {
    mockSnapshot.docs = [{ id: "coupon1" }];

    const request = new NextRequest(
      "http://localhost:3000/api/coupons/validate-code?code=SAVE10&shop_slug=test-shop&exclude_id=coupon1",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.available).toBe(true); // Excluded, so available
  });

  it("should mark unavailable when code exists but not excluded", async () => {
    mockSnapshot.docs = [{ id: "coupon1" }, { id: "coupon2" }];

    const request = new NextRequest(
      "http://localhost:3000/api/coupons/validate-code?code=SAVE10&shop_slug=test-shop&exclude_id=coupon1",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.available).toBe(false); // coupon2 still exists
  });

  it("should handle database errors", async () => {
    mockQuery.get.mockRejectedValue(new Error("Database error"));

    const request = new NextRequest(
      "http://localhost:3000/api/coupons/validate-code?code=SAVE10&shop_slug=test-shop",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to validate code");
  });

  it("should query with normalized code and resolved shop_id", async () => {
    mockResolveShopSlug.mockResolvedValue("resolved-shop-id");

    const request = new NextRequest(
      "http://localhost:3000/api/coupons/validate-code?code=save20&shop_slug=my-shop",
    );
    await GET(request);

    expect(mockResolveShopSlug).toHaveBeenCalledWith("my-shop");
    expect(mockQuery.where).toHaveBeenCalledWith("code", "==", "SAVE20");
    expect(mockQuery.where).toHaveBeenCalledWith(
      "shop_id",
      "==",
      "resolved-shop-id",
    );
  });
});
