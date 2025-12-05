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

interface AvailableGatewayResponse {
  id: string;
  name: string;
  type: string;
  logo: string;
  capabilities: {
    refunds: boolean;
    partialRefunds: boolean;
    cardPayments: boolean;
    netBanking: boolean;
    upi: boolean;
    wallets: boolean;
    emi: boolean;
    internationalCards: boolean;
  };
  fees: {
    percentage: number;
    fixed: number;
    currency: string;
  };
}

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
          gateways: [],
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
        id: gateway.id,
        name: gateway.name,
        type: gateway.type,
        logo: gateway.logo,
        capabilities: gateway.capabilities,
        fees: {
          percentage: fees.percentage,
          fixed: fees.fixed,
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
          calculatedFees: {
            feeAmount: parseFloat(feeAmount.toFixed(2)),
            totalAmount: parseFloat(totalAmount.toFixed(2)),
          },
        };
      }
      return gateway;
    });

    return NextResponse.json(
      {
        gateways: gatewaysWithFees,
        filters: {
          country,
          currency,
          amount,
        },
        count: gatewaysWithFees.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      component: "AvailableGatewaysAPI",
      method: "GET",
      context: "Failed to retrieve available gateways",
    });

    return NextResponse.json(
      {
        error: error.message || "Failed to retrieve available gateways",
        gateways: [],
      },
      { status: 500 }
    );
  }
}
