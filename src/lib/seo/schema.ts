/**
 * @fileoverview TypeScript Module
 * @module src/lib/seo/schema
 * @description This file contains functionality related to schema
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Schema.org structured data utilities
 * These create JSON-LD markup for better SEO and rich snippets
 */

import { siteConfig } from "./metadata";

/**
 * Organization schema for the business
 */
/**
 * Performs generate organization schema operation
 *
 * @returns {any} The organizationschema result
 *
 * @example
 * generateOrganizationSchema();
 */

/**
 * Performs generate organization schema operation
 *
 * @returns {any} The organizationschema result
 *
 * @example
 * generateOrganizationSchema();
 */

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    /** Name */
    name: siteConfig.name,
    /** Url */
    url: siteConfig.url,
    /** Logo */
    logo: `${siteConfig.url}/logo.png`,
    /** Description */
    description: siteConfig.description,
    /** Address */
    address: {
      "@type": "PostalAddress",
      /** Address Country */
      addressCountry: "IN",
      /** Address Region */
      addressRegion: "India",
    },
    /** Contact Point */
    contactPoint: [
      {
        "@type": "ContactPoint",
        /** Telephone */
        telephone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91-9876543210",
        /** Contact Type */
        contactType: "customer service",
        /** Area Served */
        areaServed: "IN",
        /** Available Language */
        availableLanguage: ["English", "Hindi"],
      },
    ],
    /** Same As */
    sameAs: [
      siteConfig.links.twitter,
      siteConfig.links.facebook,
      siteConfig.links.instagram,
    ],
  };
}

/**
 * WebSite schema for the site
 */
/**
 * Performs generate web site schema operation
 *
 * @returns {any} The websiteschema result
 *
 * @example
 * generateWebSiteSchema();
 */

/**
 * Performs generate web site schema operation
 *
 * @returns {any} The websiteschema result
 *
 * @example
 * generateWebSiteSchema();
 */

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    /** Name */
    name: siteConfig.name,
    /** Url */
    url: siteConfig.url,
    /** Description */
    description: siteConfig.description,
    /** Potential Action */
    potentialAction: {
      "@type": "SearchAction",
      /** Target */
      target: {
        "@type": "EntryPoint",
        /** Url Template */
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Product schema for product pages
 */
/**
 * Performs generate product schema operation
 *
 * @returns {any} The productschema result
 *
 * @example
 * generateProductSchema();
 */

/**
 * Performs generate product schema operation
 *
 * @returns {any} The productschema result
 *
 * @example
 * generateProductSchema();
 */

export function generateProductSchema({
  name,
  description,
  image,
  sku,
  brand,
  price,
  currency = "INR",
  availability = "InStock",
  condition = "NewCondition",
  url,
  rating,
  reviewCount,
}: {
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Image */
  image: string;
  /** Sku */
  sku: string;
  /** Brand */
  brand?: string;
  /** Price */
  price: number;
  /** Currency */
  currency?: string;
  /** Availability */
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  /** Condition */
  condition?: "NewCondition" | "UsedCondition" | "RefurbishedCondition";
  /** Url */
  url: string;
  /** Rating */
  rating?: number;
  /** Review Count */
  reviewCount?: number;
}) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    sku,
    /** Brand */
    brand: brand
      ? {
          "@type": "Brand",
          /** Name */
          name: brand,
        }
      : undefined,
    /** Offers */
    offers: {
      "@type": "Offer",
      url,
      /** Price Currency */
      priceCurrency: currency,
      /** Price */
      price: price.toString(),
      availability: `https://schema.org/${availability}`,
      itemCondition: `https://schema.org/${condition}`,
      /** Seller */
      seller: {
        "@type": "Organization",
        /** Name */
        name: siteConfig.name,
      },
      /** Shipping Details */
      shippingDetails: {
        "@type": "OfferShippingDetails",
        /** Shipping Destination */
        shippingDestination: {
          "@type": "DefinedRegion",
          /** Address Country */
          addressCountry: "IN",
        },
        /** Delivery Time */
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          /** Handling Time */
          handlingTime: {
            "@type": "QuantitativeValue",
            /** Min Value */
            minValue: 1,
            /** Max Value */
            maxValue: 2,
            /** Unit Code */
            unitCode: "DAY",
          },
          /** Transit Time */
          transitTime: {
            "@type": "QuantitativeValue",
            /** Min Value */
            minValue: 2,
            /** Max Value */
            maxValue: 7,
            /** Unit Code */
            unitCode: "DAY",
          },
        },
      },
    },
  };

  // Add aggregateRating if available
  if (rating && reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      /** Rating Value */
      ratingValue: rating.toString(),
      /** Review Count */
      reviewCount: reviewCount.toString(),
      /** Best Rating */
      bestRating: "5",
      /** Worst Rating */
      worstRating: "1",
    };
  }

  return schema;
}

/**
 * FAQ schema for FAQ pages
 */
/**
 * Performs generate f a q schema operation
 *
 * @param {Array<{ question} faqs - The faqs
 *
 * @returns {string} The faqschema result
 *
 * @example
 * generateFAQSchema([]);
 */

/**
 * Performs generate f a q schema operation
 *
 * @param {Array<{ question} /** Faqs */
  faqs - The /**  faqs */
  faqs
 *
 * @returns {string} The faqschema result
 *
 * @example
 * generateFAQSchema([]);
 */

/**
 * Performs generate f a q schema operation
 *
 * @param {Array<{ question} faqs - The faqs
 *
 * @returns {any} The generatefaqschema result
 *
 * @example
 * generateFAQSchema({});
 */
export function generateFAQSchema(
  /** Faqs */
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    /** Main Entity */
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      /** Name */
      name: faq.question,
      /** Accepted Answer */
      acceptedAnswer: {
        "@type": "Answer",
        /** Text */
        text: faq.answer,
      },
    })),
  };
}

/**
 * Breadcrumb schema
 */
/**
 * Performs generate breadcrumb schema operation
 *
 * @param {Array<{ name} items - The items
 *
 * @returns {string} The breadcrumbschema result
 *
 * @example
 * generateBreadcrumbSchema([]);
 */

/**
 * Performs generate breadcrumb schema o/**
 * Performs generate breadcrumb schema operation
 *
 * @param {Array<{ name} items - The items
 *
 * @returns {any} The generatebreadcrumbschema result
 *
 * @example
 * generateBreadcrumbSchema({});
 */
peration
 *
 * @param {Array<{ name} /** Items */
  items - The /**  items */
  items
 *
 * @returns {string} The breadcrumbschema result
 *
 * @example
 * generateBreadcrumbSchema([]);
 */

export function generateBreadcrumbSchema(
  /** Items */
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    /** Item List Element */
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      /** Position */
      position: index + 1,
      /** Name */
      name: item.name,
      /** Item */
      item: item.url.startsWith("http")
        ? item.url
        : `${siteConfig.url}${item.url}`,
    })),
  };
}

/**
 * LocalBusiness schema for the seller
 */
/**
 * Performs generate local business schema operation
 *
 * @returns {any} The localbusinessschema result
 *
 * @example
 * generateLocalBusinessSchema();
 */

/**
 * Performs generate local business schema operation
 *
 * @returns {any} The localbusinessschema result
 *
 * @example
 * generateLocalBusinessSchema();
 */

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": siteConfig.url,
    /** Name */
    name: siteConfig.name,
    /** Description */
    description: siteConfig.description,
    /** Url */
    url: siteConfig.url,
    /** Logo */
    logo: `${siteConfig.url}/logo.png`,
    /** Image */
    image: `${siteConfig.url}/og-image.jpg`,
    /** Telephone */
    telephone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91-9876543210",
    /** Email */
    email: "support@letitrip.com",
    /** Address */
    address: {
      "@type": "PostalAddress",
      /** Address Country */
      addressCountry: "IN",
      /** Address Region */
      addressRegion: "India",
    },
    /** Geo */
    geo: {
      "@type": "GeoCoordinates",
      // Add actual coordinates when available
    },
    /** Opening Hours Specification */
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        /** Day Of Week */
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        /** Opens */
        opens: "10:00",
        /** Closes */
        closes: "19:00",
      },
    ],
    /** Price Range */
    priceRange: "₹₹",
    /** Accepts Reservations */
    acceptsReservations: "False",
    /** Payment Accepted */
    paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking, Wallets, COD",
    /** Currencies Accepted */
    currenciesAccepted: "INR",
  };
}

/**
 * ItemList schema for product listings
 */
/**
 * Performs generate item list schema operation
 *
 * @returns {string} The itemlistschema result
 *
 * @example
 * generateItemListSchema();
 */

/**
 * Performs generate item list schema operation
 *
 * @returns {string} The itemlistschema result
 *
 * @example
 * generateItemListSchema();
 */

export function generateItemListSchema(
  /** Items */
  items: Array<{
    /** Name */
    name: string;
    /** Url */
    url: string;
    /** Image */
    image: string;
    /** Price */
    price: number;
  }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    /** Item List Element */
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      /** Position */
      position: index + 1,
      /** Item */
      item: {
        "@type": "Product",
        /** Name */
        name: item.name,
        /** Url */
        url: item.url,
        /** Image */
        image: item.image,
        /** Offers */
        offers: {
          "@type": "Offer",
          /** Price */
          price: item.price.toString(),
          /** Price Currency */
          priceCurrency: "INR",
        },
      },
    })),
  };
}

/**
 * Review schema
 */
/**
 * Performs generate review schema operation
 *
 * @returns {any} The reviewschema result
 *
 * @example
 * generateReviewSchema();
 */

/**
 * Performs generate review schema operation
 *
 * @returns {any} The reviewschema result
 *
 * @example
 * generateReviewSchema();
 */

export function generateReviewSchema({
  productName,
  reviewBody,
  rating,
  authorName,
  datePublished,
}: {
  /** Product Name */
  productName: string;
  /** Review Body */
  reviewBody: string;
  /** Rating */
  rating: number;
  /** Author Name */
  authorName: string;
  /** Date Published */
  datePublished: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    /** Item Reviewed */
    itemReviewed: {
      "@type": "Product",
      /** Name */
      name: productName,
    },
    /** Review Rating */
    reviewRating: {
      "@type": "Rating",
      /** Rating Value */
      ratingValue: rating.toString(),
      /** Best Rating */
      bestRating: "5",
      /** Worst Rating */
      worstRating: "1",
    },
    reviewBody,
    /** Author */
    author: {
      "@type": "Person",
      /** Name */
      name: authorName,
    },
    datePublished,
  };
}

/**
 * Offer schema for special offers/coupons
 */
/**
 * Performs generate offer schema operation
 *
 * @returns {any} The offerschema result
 *
 * @example
 * generateOfferSchema();
 */

/**
 * Performs generate offer schema operation
 *
 * @returns {any} The offerschema result
 *
 * @example
 * generateOfferSchema();
 */

export function generateOfferSchema({
  name,
  description,
  code,
  discountType,
  discountValue,
  validFrom,
  validThrough,
}: {
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Code */
  code: string;
  /** Discount Type */
  discountType: "percentage" | "fixed";
  /** Discount Value */
  discountValue: number;
  /** Valid From */
  validFrom: string;
  /** Valid Through */
  validThrough: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    name,
    description,
    /** Price Specification */
    priceSpecification: {
      "@type": "PriceSpecification",
      ...(discountType === "percentage"
        ? { price: `-${discountValue}`, priceCurrency: "PERCENT" }
        : { price: `-${discountValue}`, priceCurrency: "INR" }),
    },
    /** Eligible Transaction Volume */
    eligibleTransactionVolume: {
      "@type": "PriceSpecification",
      /** Price Currency */
      priceCurrency: "INR",
    },
    validFrom,
    validThrough,
    /** Seller */
    seller: {
      "@type": "Organization",
      /** Name */
      name: siteConfig.name,
    },
  };
}

/**
 * Helper function to inject JSON-LD script into page
 */
/**
 * Performs generate j s o n l d operation
 *
 * @param {object} schema - The schema
 *
 * @returns {any} The jsonld result
 *
 * @example
 * generateJSONLD(schema);
 */

/**
 * Performs generate j s o n l d operation
 *
 * @param {object} schema - The schema
 *
 * @returns {any} The jsonld result
 *
 * @example
 * generateJSONLD(schema);
 */

export function generateJSONLD(schema: object) {
  return {
    __html: JSON.stringify(schema),
  };
}
