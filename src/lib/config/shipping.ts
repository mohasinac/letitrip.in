/**
 * Shipping Gateway Configuration
 */

export const SHIPROCKET_CONFIG = {
  BASE_URL: process.env.SHIPROCKET_BASE_URL || "https://apiv2.shiprocket.in/v1",
  EMAIL: process.env.SHIPROCKET_EMAIL!,
  PASSWORD: process.env.SHIPROCKET_PASSWORD!,
  CHANNEL_ID: process.env.SHIPROCKET_CHANNEL_ID!,

  // Default pickup location
  DEFAULT_PICKUP_LOCATION: "Primary",

  // Supported weight units
  WEIGHT_UNIT: "kg",
  DIMENSION_UNIT: "cm",

  // API endpoints
  ENDPOINTS: {
    AUTH: "/auth/login",
    CREATE_ORDER: "/orders/create/adhoc",
    CANCEL_ORDER: "/orders/cancel",
    TRACK_ORDER: "/courier/track/awb",
    SERVICEABILITY: "/courier/serviceability",
    RATE_CALCULATOR: "/courier/rate-calculator",
    PICKUP_LOCATIONS: "/settings/company/pickup",
    COURIER_PARTNERS: "/courier/partners",
  },

  // Default package dimensions (in cm)
  DEFAULT_DIMENSIONS: {
    length: 20,
    breadth: 15,
    height: 10,
  },

  // Minimum weight (in kg)
  MIN_WEIGHT: 0.1,

  // Maximum COD amount
  MAX_COD_AMOUNT: 50000, // INR
};

export const validateShiprocketConfig = () => {
  const requiredVars = [
    "SHIPROCKET_EMAIL",
    "SHIPROCKET_PASSWORD",
    "SHIPROCKET_CHANNEL_ID",
  ];
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Shiprocket environment variables: ${missing.join(", ")}`,
    );
  }
};

export const SHIPPING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PICKED_UP: "picked_up",
  IN_TRANSIT: "in_transit",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  RTO: "rto",
  CANCELLED: "cancelled",
} as const;

export const COURIER_PARTNERS = [
  "BlueDart",
  "Delhivery",
  "DTDC",
  "Ecom Express",
  "FedEx",
  "Shadowfax",
  "Xpressbees",
] as const;
