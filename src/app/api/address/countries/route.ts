/**
 * Countries List API Route
 * GET /api/address/countries
 *
 * Returns list of all countries with their codes.
 * Public endpoint - no authentication required.
 */

import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

interface Country {
  code: string;
  name: string;
  dialCode: string;
  currency: string;
  currencySymbol: string;
}

// Comprehensive list of countries
const COUNTRIES: Country[] = [
  {
    code: "IN",
    name: "India",
    dialCode: "+91",
    currency: "INR",
    currencySymbol: "₹",
  },
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    currency: "USD",
    currencySymbol: "$",
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    currency: "GBP",
    currencySymbol: "£",
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "+61",
    currency: "AUD",
    currencySymbol: "A$",
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    currency: "CAD",
    currencySymbol: "C$",
  },
  {
    code: "SG",
    name: "Singapore",
    dialCode: "+65",
    currency: "SGD",
    currencySymbol: "S$",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "+971",
    currency: "AED",
    currencySymbol: "د.إ",
  },
  {
    code: "DE",
    name: "Germany",
    dialCode: "+49",
    currency: "EUR",
    currencySymbol: "€",
  },
  {
    code: "FR",
    name: "France",
    dialCode: "+33",
    currency: "EUR",
    currencySymbol: "€",
  },
  {
    code: "IT",
    name: "Italy",
    dialCode: "+39",
    currency: "EUR",
    currencySymbol: "€",
  },
  {
    code: "ES",
    name: "Spain",
    dialCode: "+34",
    currency: "EUR",
    currencySymbol: "€",
  },
  {
    code: "NL",
    name: "Netherlands",
    dialCode: "+31",
    currency: "EUR",
    currencySymbol: "€",
  },
  {
    code: "BE",
    name: "Belgium",
    dialCode: "+32",
    currency: "EUR",
    currencySymbol: "€",
  },
  {
    code: "CH",
    name: "Switzerland",
    dialCode: "+41",
    currency: "CHF",
    currencySymbol: "CHF",
  },
  {
    code: "SE",
    name: "Sweden",
    dialCode: "+46",
    currency: "SEK",
    currencySymbol: "kr",
  },
  {
    code: "NO",
    name: "Norway",
    dialCode: "+47",
    currency: "NOK",
    currencySymbol: "kr",
  },
  {
    code: "DK",
    name: "Denmark",
    dialCode: "+45",
    currency: "DKK",
    currencySymbol: "kr",
  },
  {
    code: "FI",
    name: "Finland",
    dialCode: "+358",
    currency: "EUR",
    currencySymbol: "€",
  },
  {
    code: "JP",
    name: "Japan",
    dialCode: "+81",
    currency: "JPY",
    currencySymbol: "¥",
  },
  {
    code: "CN",
    name: "China",
    dialCode: "+86",
    currency: "CNY",
    currencySymbol: "¥",
  },
  {
    code: "KR",
    name: "South Korea",
    dialCode: "+82",
    currency: "KRW",
    currencySymbol: "₩",
  },
  {
    code: "HK",
    name: "Hong Kong",
    dialCode: "+852",
    currency: "HKD",
    currencySymbol: "HK$",
  },
  {
    code: "TW",
    name: "Taiwan",
    dialCode: "+886",
    currency: "TWD",
    currencySymbol: "NT$",
  },
  {
    code: "MY",
    name: "Malaysia",
    dialCode: "+60",
    currency: "MYR",
    currencySymbol: "RM",
  },
  {
    code: "TH",
    name: "Thailand",
    dialCode: "+66",
    currency: "THB",
    currencySymbol: "฿",
  },
  {
    code: "ID",
    name: "Indonesia",
    dialCode: "+62",
    currency: "IDR",
    currencySymbol: "Rp",
  },
  {
    code: "PH",
    name: "Philippines",
    dialCode: "+63",
    currency: "PHP",
    currencySymbol: "₱",
  },
  {
    code: "VN",
    name: "Vietnam",
    dialCode: "+84",
    currency: "VND",
    currencySymbol: "₫",
  },
  {
    code: "NZ",
    name: "New Zealand",
    dialCode: "+64",
    currency: "NZD",
    currencySymbol: "NZ$",
  },
  {
    code: "ZA",
    name: "South Africa",
    dialCode: "+27",
    currency: "ZAR",
    currencySymbol: "R",
  },
  {
    code: "BR",
    name: "Brazil",
    dialCode: "+55",
    currency: "BRL",
    currencySymbol: "R$",
  },
  {
    code: "MX",
    name: "Mexico",
    dialCode: "+52",
    currency: "MXN",
    currencySymbol: "Mex$",
  },
  {
    code: "AR",
    name: "Argentina",
    dialCode: "+54",
    currency: "ARS",
    currencySymbol: "$",
  },
  {
    code: "CL",
    name: "Chile",
    dialCode: "+56",
    currency: "CLP",
    currencySymbol: "$",
  },
  {
    code: "CO",
    name: "Colombia",
    dialCode: "+57",
    currency: "COP",
    currencySymbol: "$",
  },
  {
    code: "PE",
    name: "Peru",
    dialCode: "+51",
    currency: "PEN",
    currencySymbol: "S/",
  },
  {
    code: "RU",
    name: "Russia",
    dialCode: "+7",
    currency: "RUB",
    currencySymbol: "₽",
  },
  {
    code: "TR",
    name: "Turkey",
    dialCode: "+90",
    currency: "TRY",
    currencySymbol: "₺",
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    dialCode: "+966",
    currency: "SAR",
    currencySymbol: "﷼",
  },
  {
    code: "EG",
    name: "Egypt",
    dialCode: "+20",
    currency: "EGP",
    currencySymbol: "£",
  },
  {
    code: "NG",
    name: "Nigeria",
    dialCode: "+234",
    currency: "NGN",
    currencySymbol: "₦",
  },
  {
    code: "KE",
    name: "Kenya",
    dialCode: "+254",
    currency: "KES",
    currencySymbol: "KSh",
  },
  {
    code: "IL",
    name: "Israel",
    dialCode: "+972",
    currency: "ILS",
    currencySymbol: "₪",
  },
  {
    code: "PL",
    name: "Poland",
    dialCode: "+48",
    currency: "PLN",
    currencySymbol: "zł",
  },
  {
    code: "CZ",
    name: "Czech Republic",
    dialCode: "+420",
    currency: "CZK",
    currencySymbol: "Kč",
  },
  {
    code: "AT",
    name: "Austria",
    dialCode: "+43",
    currency: "EUR",
    currencySymbol: "€",
  },
  {
    code: "IE",
    name: "Ireland",
    dialCode: "+353",
    currency: "EUR",
    currencySymbol: "€",
  },
  {
    code: "PT",
    name: "Portugal",
    dialCode: "+351",
    currency: "EUR",
    currencySymbol: "€",
  },
  {
    code: "GR",
    name: "Greece",
    dialCode: "+30",
    currency: "EUR",
    currencySymbol: "€",
  },
];

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
        countries: filteredCountries,
        count: filteredCountries.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      component: "CountriesAPI",
      method: "GET",
      context: "Failed to retrieve countries list",
    });

    return NextResponse.json(
      {
        error: error.message || "Failed to retrieve countries list",
        countries: [],
      },
      { status: 500 }
    );
  }
}
