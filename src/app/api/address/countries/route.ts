/**
 * @fileoverview TypeScript Module
 * @module src/app/api/address/countries/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Countries List API Route
 * GET /api/address/countries
 *
 * Returns list of all countries with their codes.
 * Public endpoint - no authentication required.
 */

import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * Country interface
 * 
 * @interface
 * @description Defines the structure and contract for Country
 */
interface Country {
  /** Code */
  code: string;
  /** Name */
  name: string;
  /** Dial Code */
  dialCode: string;
  /** Currency */
  currency: string;
  /** Currency Symbol */
  currencySymbol: string;
}

// Comprehensive list of countries
const COUNTRIES: Country[] = [
  {
    /** Code */
    code: "IN",
    /** Name */
    name: "India",
    /** Dial Code */
    dialCode: "+91",
    /** Currency */
    currency: "INR",
    /** Currency Symbol */
    currencySymbol: "₹",
  },
  {
    /** Code */
    code: "US",
    /** Name */
    name: "United States",
    /** Dial Code */
    dialCode: "+1",
    /** Currency */
    currency: "USD",
    /** Currency Symbol */
    currencySymbol: "$",
  },
  {
    /** Code */
    code: "GB",
    /** Name */
    name: "United Kingdom",
    /** Dial Code */
    dialCode: "+44",
    /** Currency */
    currency: "GBP",
    /** Currency Symbol */
    currencySymbol: "£",
  },
  {
    /** Code */
    code: "AU",
    /** Name */
    name: "Australia",
    /** Dial Code */
    dialCode: "+61",
    /** Currency */
    currency: "AUD",
    /** Currency Symbol */
    currencySymbol: "A$",
  },
  {
    /** Code */
    code: "CA",
    /** Name */
    name: "Canada",
    /** Dial Code */
    dialCode: "+1",
    /** Currency */
    currency: "CAD",
    /** Currency Symbol */
    currencySymbol: "C$",
  },
  {
    /** Code */
    code: "SG",
    /** Name */
    name: "Singapore",
    /** Dial Code */
    dialCode: "+65",
    /** Currency */
    currency: "SGD",
    /** Currency Symbol */
    currencySymbol: "S$",
  },
  {
    /** Code */
    code: "AE",
    /** Name */
    name: "United Arab Emirates",
    /** Dial Code */
    dialCode: "+971",
    /** Currency */
    currency: "AED",
    /** Currency Symbol */
    currencySymbol: "د.إ",
  },
  {
    /** Code */
    code: "DE",
    /** Name */
    name: "Germany",
    /** Dial Code */
    dialCode: "+49",
    /** Currency */
    currency: "EUR",
    /** Currency Symbol */
    currencySymbol: "€",
  },
  {
    /** Code */
    code: "FR",
    /** Name */
    name: "France",
    /** Dial Code */
    dialCode: "+33",
    /** Currency */
    currency: "EUR",
    /** Currency Symbol */
    currencySymbol: "€",
  },
  {
    /** Code */
    code: "IT",
    /** Name */
    name: "Italy",
    /** Dial Code */
    dialCode: "+39",
    /** Currency */
    currency: "EUR",
    /** Currency Symbol */
    currencySymbol: "€",
  },
  {
    /** Code */
    code: "ES",
    /** Name */
    name: "Spain",
    /** Dial Code */
    dialCode: "+34",
    /** Currency */
    currency: "EUR",
    /** Currency Symbol */
    currencySymbol: "€",
  },
  {
    /** Code */
    code: "NL",
    /** Name */
    name: "Netherlands",
    /** Dial Code */
    dialCode: "+31",
    /** Currency */
    currency: "EUR",
    /** Currency Symbol */
    currencySymbol: "€",
  },
  {
    /** Code */
    code: "BE",
    /** Name */
    name: "Belgium",
    /** Dial Code */
    dialCode: "+32",
    /** Currency */
    currency: "EUR",
    /** Currency Symbol */
    currencySymbol: "€",
  },
  {
    /** Code */
    code: "CH",
    /** Name */
    name: "Switzerland",
    /** Dial Code */
    dialCode: "+41",
    /** Currency */
    currency: "CHF",
    /** Currency Symbol */
    currencySymbol: "CHF",
  },
  {
    /** Code */
    code: "SE",
    /** Name */
    name: "Sweden",
    /** Dial Code */
    dialCode: "+46",
    /** Currency */
    currency: "SEK",
    /** Currency Symbol */
    currencySymbol: "kr",
  },
  {
    /** Code */
    code: "NO",
    /** Name */
    name: "Norway",
    /** Dial Code */
    dialCode: "+47",
    /** Currency */
    currency: "NOK",
    /** Currency Symbol */
    currencySymbol: "kr",
  },
  {
    /** Code */
    code: "DK",
    /** Name */
    name: "Denmark",
    /** Dial Code */
    dialCode: "+45",
    /** Currency */
    currency: "DKK",
    /** Currency Symbol */
    currencySymbol: "kr",
  },
  {
    /** Code */
    code: "FI",
    /** Name */
    name: "Finland",
    /** Dial Code */
    dialCode: "+358",
    /** Currency */
    currency: "EUR",
    /** Currency Symbol */
    currencySymbol: "€",
  },
  {
    /** Code */
    code: "JP",
    /** Name */
    name: "Japan",
    /** Dial Code */
    dialCode: "+81",
    /** Currency */
    currency: "JPY",
    /** Currency Symbol */
    currencySymbol: "¥",
  },
  {
    /** Code */
    code: "CN",
    /** Name */
    name: "China",
    /** Dial Code */
    dialCode: "+86",
    /** Currency */
    currency: "CNY",
    /** Currency Symbol */
    currencySymbol: "¥",
  },
  {
    /** Code */
    code: "KR",
    /** Name */
    name: "South Korea",
    /** Dial Code */
    dialCode: "+82",
    /** Currency */
    currency: "KRW",
    /** Currency Symbol */
    currencySymbol: "₩",
  },
  {
    /** Code */
    code: "HK",
    /** Name */
    name: "Hong Kong",
    /** Dial Code */
    dialCode: "+852",
    /** Currency */
    currency: "HKD",
    /** Currency Symbol */
    currencySymbol: "HK$",
  },
  {
    /** Code */
    code: "TW",
    /** Name */
    name: "Taiwan",
    /** Dial Code */
    dialCode: "+886",
    /** Currency */
    currency: "TWD",
    /** Currency Symbol */
    currencySymbol: "NT$",
  },
  {
    /** Code */
    code: "MY",
    /** Name */
    name: "Malaysia",
    /** Dial Code */
    dialCode: "+60",
    /** Currency */
    currency: "MYR",
    /** Currency Symbol */
    currencySymbol: "RM",
  },
  {
    /** Code */
    code: "TH",
    /** Name */
    name: "Thailand",
    /** Dial Code */
    dialCode: "+66",
    /** Currency */
    currency: "THB",
    /** Currency Symbol */
    currencySymbol: "฿",
  },
  {
    /** Code */
    code: "ID",
    /** Name */
    name: "Indonesia",
    /** Dial Code */
    dialCode: "+62",
    /** Currency */
    currency: "IDR",
    /** Currency Symbol */
    currencySymbol: "Rp",
  },
  {
    /** Code */
    code: "PH",
    /** Name */
    name: "Philippines",
    /** Dial Code */
    dialCode: "+63",
    /** Currency */
    currency: "PHP",
    /** Currency Symbol */
    currencySymbol: "₱",
  },
  {
    /** Code */
    code: "VN",
    /** Name */
    name: "Vietnam",
    /** Dial Code */
    dialCode: "+84",
    /** Currency */
    currency: "VND",
    /** Currency Symbol */
    currencySymbol: "₫",
  },
  {
    /** Code */
    code: "NZ",
    /** Name */
    name: "New Zealand",
    /** Dial Code */
    dialCode: "+64",
    /** Currency */
    currency: "NZD",
    /** Currency Symbol */
    currencySymbol: "NZ$",
  },
  {
    /** Code */
    code: "ZA",
    /** Name */
    name: "South Africa",
    /** Dial Code */
    dialCode: "+27",
    /** Currency */
    currency: "ZAR",
    /** Currency Symbol */
    currencySymbol: "R",
  },
  {
    /** Code */
    code: "BR",
    /** Name */
    name: "Brazil",
    /** Dial Code */
    dialCode: "+55",
    /** Currency */
    currency: "BRL",
    /** Currency Symbol */
    currencySymbol: "R$",
  },
  {
    /** Code */
    code: "MX",
    /** Name */
    name: "Mexico",
    /** Dial Code */
    dialCode: "+52",
    /** Currency */
    currency: "MXN",
    /** Currency Symbol */
    currencySymbol: "Mex$",
  },
  {
    /** Code */
    code: "AR",
    /** Name */
    name: "Argentina",
    /** Dial Code */
    dialCode: "+54",
    /** Currency */
    currency: "ARS",
    /** Currency Symbol */
    currencySymbol: "$",
  },
  {
    /** Code */
    code: "CL",
    /** Name */
    name: "Chile",
    /** Dial Code */
    dialCode: "+56",
    /** Currency */
    currency: "CLP",
    /** Currency Symbol */
    currencySymbol: "$",
  },
  {
    /** Code */
    code: "CO",
    /** Name */
    name: "Colombia",
    /** Dial Code */
    dialCode: "+57",
    /** Currency */
    currency: "COP",
    /** Currency Symbol */
    currencySymbol: "$",
  },
  {
    /** Code */
    code: "PE",
    /** Name */
    name: "Peru",
    /** Dial Code */
    dialCode: "+51",
    /** Currency */
    currency: "PEN",
    /** Currency Symbol */
    currencySymbol: "S/",
  },
  {
    /** Code */
    code: "RU",
    /** Name */
    name: "Russia",
    /** Dial Code */
    dialCode: "+7",
    /** Currency */
    currency: "RUB",
    /** Currency Symbol */
    currencySymbol: "₽",
  },
  {
    /** Code */
    code: "TR",
    /** Name */
    name: "Turkey",
    /** Dial Code */
    dialCode: "+90",
    /** Currency */
    currency: "TRY",
    /** Currency Symbol */
    currencySymbol: "₺",
  },
  {
    /** Code */
    code: "SA",
    /** Name */
    name: "Saudi Arabia",
    /** Dial Code */
    dialCode: "+966",
    /** Currency */
    currency: "SAR",
    /** Currency Symbol */
    currencySymbol: "﷼",
  },
  {
    /** Code */
    code: "EG",
    /** Name */
    name: "Egypt",
    /** Dial Code */
    dialCode: "+20",
    /** Currency */
    currency: "EGP",
    /** Currency Symbol */
    currencySymbol: "£",
  },
  {
    /** Code */
    code: "NG",
    /** Name */
    name: "Nigeria",
    /** Dial Code */
    dialCode: "+234",
    /** Currency */
    currency: "NGN",
    /** Currency Symbol */
    currencySymbol: "₦",
  },
  {
    /** Code */
    code: "KE",
    /** Name */
    name: "Kenya",
    /** Dial Code */
    dialCode: "+254",
    /** Currency */
    currency: "KES",
    /** Currency Symbol */
    currencySymbol: "KSh",
  },
  {
    /** Code */
    code: "IL",
    /** Name */
    name: "Israel",
    /** Dial Code */
    dialCode: "+972",
    /** Currency */
    currency: "ILS",
    /** Currency Symbol */
    currencySymbol: "₪",
  },
  {
    /** Code */
    code: "PL",
    /** Name */
    name: "Poland",
    /** Dial Code */
    dialCode: "+48",
    /** Currency */
    currency: "PLN",
    /** Currency Symbol */
    currencySymbol: "zł",
  },
  {
    /** Code */
    code: "CZ",
    /** Name */
    name: "Czech Republic",
    /** Dial Code */
    dialCode: "+420",
    /** Currency */
    currency: "CZK",
    /** Currency Symbol */
    currencySymbol: "Kč",
  },
  {
    /** Code */
    code: "AT",
    /** Name */
    name: "Austria",
    /** Dial Code */
    dialCode: "+43",
    /** Currency */
    currency: "EUR",
    /** Currency Symbol */
    currencySymbol: "€",
  },
  {
    /** Code */
    code: "IE",
    /** Name */
    name: "Ireland",
    /** Dial Code */
    dialCode: "+353",
    /** Currency */
    currency: "EUR",
    /** Currency Symbol */
    currencySymbol: "€",
  },
  {
    /** Code */
    code: "PT",
    /** Name */
    name: "Portugal",
    /** Dial Code */
    dialCode: "+351",
    /** Currency */
    currency: "EUR",
    /** Currency Symbol */
    currencySymbol: "€",
  },
  {
    /** Code */
    code: "GR",
    /** Name */
    name: "Greece",
    /** Dial Code */
    dialCode: "+30",
    /** Currency */
    currency: "EUR",
    /** Currency Symbol */
    currencySymbol: "€",
  },
];

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
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const code = searchParams.get("code")?.toUpperCase();

    let filteredCountries = COUNTRIES;

    // Filter by code if provided
    if (code) {
      filteredCountries = filteredCountries.filter((c) => c.code === code);
    }

    // Filter by search term if provided
    if (search) {
      filteredCountries = filteredCountries.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.code.toLowerCase().includes(search)
      );
    }

    // Sort by name
    filteredCountries.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(
      {
        /** Countries */
        countries: filteredCountries,
        /** Count */
        count: filteredCountries.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      /** Component */
      component: "CountriesAPI",
      /** Method */
      method: "GET",
      /** Context */
      context: "Failed to retrieve countries list",
    });

    return NextResponse.json(
      {
        /** Error */
        error: error.message || "Failed to retrieve countries list",
        /** Countries */
        countries: [],
      },
      { status: 500 }
    );
  }
}
