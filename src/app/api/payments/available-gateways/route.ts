/**
 * @fileoverview TypeScript Module
 * @module src/app/api/payments/available-gateways/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Available Payment Gateways API Route
 * GET /api/payments/available-gateways
 *
 * Returns list of enabled payment gateways filtered by country/currency.
 * Public endpoint - no authentication required.
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { PAYMENT_GATEWAYS } from "@/config/payment-gateways.config";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * AvailableGatewayResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for AvailableGatewayResponse
 */
interface AvailableGatewayResponse {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Type */
  type: string;
  /** Logo */
  logo: string;
  /** Capabilities */
  capabilities: {
    /** Refunds */
    refunds: boolean;
    /** Partial Refunds */
    partialRefunds: boolean;
    /** Card Payments */
    cardPayments: boolean;
    /** Net Banking */
    netBanking: boolean;
    /** Upi */
    upi: boolean;
    /** Wallets */
    wallets: boolean;
    /** Emi */
    emi: boolean;
    /** International Cards */
    internationalCards: boolean;
  };
  /** Fees */
  fees: {
    /** Percentage */
    percentage: number;
    /** Fixed */
    fixed: number;
    /** Currency */
    currency: string;
  };
}

/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country") || "IN";
    const currency = searchParams.get("currency") || "INR";
    const amount = parseFloat(searchParams.get("amount") || "0");

    // Get gateway settings from Firestore
    const db = getFirestoreAdmin();
    const settingsDoc = await db
      .collection(COLLECTIONS.SETTINGS)
      .doc("payment-gateways")
      .get();

    if (!settingsDoc.exists) {
      return NextResponse.json(
        {
          /** Gateways */
          gateways: [],
          /** Message */
          message: "No payment gateways configured",
        },
        { status: 200 }
      );
    }

    const settings = settingsDoc.data();

    // Filter available gateways
    const availableGateways: AvailableGatewayResponse[] = [];

    for (const gateway of PAYMENT_GATEWAYS) {
      const gatewaySettings = settings?.[gateway.id];

      // Check if gateway is enabled
      if (!gatewaySettings?.enabled) {
        continue;
      }

      // Check if gateway supports the country
      if (
        !gateway.supportedCountries.includes(country) &&
        !gateway.supportedCountries.includes("*")
      ) {
        continue;
      }

      // Check if gateway supports the currency
      if (
        !gateway.supportedCurrencies.includes(currency as any) &&
        !gateway.supportedCurrencies.includes("*" as any)
      ) {
        continue;
      }

      // Determine fees based on domestic vs international
      const isDomestic = country === "IN" && currency === "INR";
      const fees = isDomestic
        ? gateway.fees.domestic
        : gateway.fees.international;

      availableGateways.push({
        /** Id */
        id: gateway.id,
        /** Name */
        name: gateway.name,
        /** Type */
        type: gateway.type,
        /** Logo */
        logo: gateway.logo,
        /** Capabilities */
        capabilities: gateway.capabilities,
        /** Fees */
        fees: {
          /** Percentage */
          percentage: fees.percentage,
          /** Fixed */
          fixed: fees.fixed,
          /** Currency */
          currency: fees.currency,
        },
      });
    }

    // Sort by priority (lower priority number = higher preference)
    availableGateways.sort((a, b) => {
      const aGateway = PAYMENT_GATEWAYS.find((g) => g.id === a.id);
      const bGateway = PAYMENT_GATEWAYS.find((g) => g.id === b.id);
      return (aGateway?.priority || 999) - (bGateway?.priority || 999);
    });

    // Calculate fees for each gateway if amount provided
    const gatewaysWithFees = availableGateways.map((gateway) => {
      if (amount > 0) {
        const feeAmount =
          (amount * gateway.fees.percentage) / 100 + gateway.fees.fixed;
        const totalAmount = amount + feeAmount;

        return {
          ...gateway,
          /** Calculated Fees */
          calculatedFees: {
            /** Fee Amount */
            feeAmount: parseFloat(feeAmount.toFixed(2)),
            /** Total Amount */
            totalAmount: parseFloat(totalAmount.toFixed(2)),
          },
        };
      }
      return gateway;
    });

    return NextResponse.json(
      {
        /** Gateways */
        gateways: gatewaysWithFees,
        /** Filters */
        filters: {
          country,
          currency,
          amount,
        },
        /** Count */
        count: gatewaysWithFees.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      /** Component */
      component: "AvailableGatewaysAPI",
      /** Method */
      method: "GET",
      /** Context */
      context: "Failed to retrieve available gateways",
    });

    return NextResponse.json(
      {
        /** Error */
        error: error.message || "Failed to retrieve available gateways",
        /** Gateways */
        gateways: [],
      },
      { status: 500 }
    );
  }
}
