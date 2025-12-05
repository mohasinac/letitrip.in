/**
 * Address Autocomplete API Route
 * GET /api/address/autocomplete?query=search&country=countrycode
 *
 * Provides address suggestions based on partial input.
 * Uses Google Places API (when configured) or falls back to simple matching.
 * Public endpoint - no authentication required.
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

interface AddressSuggestion {
  description: string;
  placeId?: string;
  structuredFormatting?: {
    mainText: string;
    secondaryText: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const country = searchParams.get("country") || "IN";

    // Validate required fields
    if (!query || query.trim().length < 3) {
      return NextResponse.json(
        {
          error: "Query must be at least 3 characters",
          suggestions: [],
        },
        { status: 400 }
      );
    }

    // Get address API settings from Firestore
    const db = getFirestoreAdmin();
    const settingsDoc = await db
      .collection(COLLECTIONS.SETTINGS)
      .doc("address-api")
      .get();

    let suggestions: AddressSuggestion[] = [];

    // Check if Google Places API is configured
    const settings = settingsDoc.data();
    const googleApiKey = settings?.googlePlacesApiKey;

    if (googleApiKey) {
      // Use Google Places Autocomplete API
      try {
        const apiUrl = new URL(
          "https://maps.googleapis.com/maps/api/place/autocomplete/json"
        );
        apiUrl.searchParams.set("input", query);
        apiUrl.searchParams.set("key", googleApiKey);
        apiUrl.searchParams.set(
          "components",
          `country:${country.toLowerCase()}`
        );
        apiUrl.searchParams.set("types", "address");

        const response = await fetch(apiUrl.toString());

        if (response.ok) {
          const data = await response.json();

          if (data.status === "OK" && data.predictions) {
            suggestions = data.predictions.map((prediction: any) => ({
              description: prediction.description,
              placeId: prediction.place_id,
              structuredFormatting: {
                mainText: prediction.structured_formatting.main_text,
                secondaryText: prediction.structured_formatting.secondary_text,
              },
            }));
          }
        }
      } catch (error) {
        console.error("Google Places API error:", error);
        // Fall through to fallback method
      }
    }

    // Fallback: Use simple matching with common Indian cities
    if (suggestions.length === 0) {
      suggestions = getFallbackSuggestions(query, country);
    }

    return NextResponse.json(
      {
        suggestions,
        count: suggestions.length,
        source: googleApiKey ? "google_places" : "fallback",
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      component: "AddressAutocompleteAPI",
      method: "GET",
      context: "Failed to get address suggestions",
    });

    return NextResponse.json(
      {
        error: error.message || "Failed to get address suggestions",
        suggestions: [],
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// FALLBACK SUGGESTIONS
// ============================================================================

function getFallbackSuggestions(
  query: string,
  country: string
): AddressSuggestion[] {
  const queryLower = query.toLowerCase();
  const suggestions: AddressSuggestion[] = [];

  if (country.toUpperCase() === "IN") {
    // Common Indian cities
    const indianCities = [
      "Mumbai, Maharashtra",
      "Delhi, Delhi",
      "Bangalore, Karnataka",
      "Hyderabad, Telangana",
      "Ahmedabad, Gujarat",
      "Chennai, Tamil Nadu",
      "Kolkata, West Bengal",
      "Pune, Maharashtra",
      "Jaipur, Rajasthan",
      "Surat, Gujarat",
      "Lucknow, Uttar Pradesh",
      "Kanpur, Uttar Pradesh",
      "Nagpur, Maharashtra",
      "Indore, Madhya Pradesh",
      "Thane, Maharashtra",
      "Bhopal, Madhya Pradesh",
      "Visakhapatnam, Andhra Pradesh",
      "Vadodara, Gujarat",
      "Ghaziabad, Uttar Pradesh",
      "Ludhiana, Punjab",
      "Agra, Uttar Pradesh",
      "Nashik, Maharashtra",
      "Faridabad, Haryana",
      "Meerut, Uttar Pradesh",
      "Rajkot, Gujarat",
      "Kalyan-Dombivali, Maharashtra",
      "Vasai-Virar, Maharashtra",
      "Varanasi, Uttar Pradesh",
      "Srinagar, Jammu and Kashmir",
      "Aurangabad, Maharashtra",
      "Dhanbad, Jharkhand",
      "Amritsar, Punjab",
      "Navi Mumbai, Maharashtra",
      "Allahabad, Uttar Pradesh",
      "Ranchi, Jharkhand",
      "Howrah, West Bengal",
      "Coimbatore, Tamil Nadu",
      "Jabalpur, Madhya Pradesh",
      "Gwalior, Madhya Pradesh",
      "Vijayawada, Andhra Pradesh",
    ];

    const matched = indianCities
      .filter((city) => city.toLowerCase().includes(queryLower))
      .slice(0, 10);

    suggestions.push(
      ...matched.map((city) => {
        const [cityName, stateName] = city.split(", ");
        return {
          description: city + ", India",
          structuredFormatting: {
            mainText: cityName,
            secondaryText: stateName + ", India",
          },
        };
      })
    );
  } else if (country.toUpperCase() === "US") {
    // Common US cities
    const usCities = [
      "New York, NY",
      "Los Angeles, CA",
      "Chicago, IL",
      "Houston, TX",
      "Phoenix, AZ",
      "Philadelphia, PA",
      "San Antonio, TX",
      "San Diego, CA",
      "Dallas, TX",
      "San Jose, CA",
    ];

    const matched = usCities
      .filter((city) => city.toLowerCase().includes(queryLower))
      .slice(0, 10);

    suggestions.push(
      ...matched.map((city) => {
        const [cityName, stateCode] = city.split(", ");
        return {
          description: city + ", USA",
          structuredFormatting: {
            mainText: cityName,
            secondaryText: stateCode + ", USA",
          },
        };
      })
    );
  }

  return suggestions;
}
