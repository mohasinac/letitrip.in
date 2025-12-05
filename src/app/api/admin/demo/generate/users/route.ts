/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/demo/generate/users/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * DEMO_PREFIX constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for demo prefix
 */
const DEMO_PREFIX = "DEMO_";

const INDIAN_FIRST_NAMES = [
  "Aarav",
  "Vivaan",
  "Aditya",
  "Arjun",
  "Sai",
  "Krishna",
  "Ishaan",
  "Rohan",
  "Rahul",
  "Ravi",
  "Ananya",
  "Aadhya",
  "Diya",
  "Priya",
  "Kavya",
  "Saanvi",
  "Anika",
  "Pari",
  "Myra",
  "Sara",
  "Amit",
  "Suresh",
  "Vikram",
  "Karan",
  "Akash",
  "Nikhil",
  "Sanjay",
  "Raj",
  "Dev",
  "Jay",
  "Pooja",
  "Neha",
  "Shreya",
  "Anjali",
  "Ritika",
  "Meera",
  "Nisha",
  "Sneha",
  "Divya",
  "Tanvi",
/**
 * INDIAN_LAST_NAMES constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for indian last names
 */
  "Om",
  "Ved",
  "Yash",
  "Aryan",
  "Dhruv",
  "Kabir",
  "Shaurya",
  "Rehan",
  "Zain",
  "Ali",
];

const INDIAN_LAST_NAMES = [
  "Sharma",
  "Verma",
  "Gupta",
  "Singh",
  "Kumar",
  "Patel",
  "Shah",
  "Joshi",
  "Iyer",
  "Nair",
  "Reddy",
  "Rao",
  "Menon",
  "Pillai",
  "Agarwal",
  "Banerjee",
  "Das",
  "Ghosh",
  "Sen",
  "Malhotra",
];

const INDIAN_CITIES = [
  { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  { city: "Delhi", state: "Delhi", pincode: "110001" },
  { city: "Bangalore", state: "Karnataka", pincode: "560001" },
  { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  { city: "Kolkata", state: "West Bengal", pincode: "700001" },
  { city: "Pune", state: "Maharashtra", pincode: "411001" },
  { city: "Ah/**
 * STREETS constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for streets
 */
medabad", state: "Gujarat", pincode: "380001" },
  { city: "Hyderabad", state: "Telangana", pincode: "500001" },
  { city: "Jaipur", state: "Rajasthan", pincode: "302001" },
  { city: "Lucknow", state: "Uttar Pradesh", pincode: "226001" },
];

const STREETS = [
  "Marine Drive",
  "MG Road",
  "Park Street",
  "Anna Salai",
  "FC Road",
  "Brigade Road",
  "Linking Road",
  "Gandhi Nagar",
  "Civil Lines",
  "Mall Road",
];

// Beyblade-themed display name prefixes for sellers
const BLADER_PREFIXES = [
  "BladeMaster",
  "S/**
 * AVATAR_IMAGES constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for avatar images
 */
pinKing",
  "DragonBlader",
  "StormRider",
  "PhoenixBurst",
  "LegendarySpinner",
  "BurstChampion",
  "MetalFury",
  "GalaxyPegasus",
  "LDragoMaster",
  "ValkyriePro",
  "SprigganElite",
  "FafnirAce",
  "LonginusKing",
  "AchillesHero",
  "DiabolosDark",
  "BelialBlader",
  "RageWarrior",
];

// Avatar images for different user types
const AVATAR_IMAGES = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1502323777036-f29e3972f3e4?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1557862921-37829c790f19?w=150&h=150&fit=crop",
];

// Role distribution percentages (for 10 users base)
// Admin is always 1 (Mohsin) regardless of scale
const USER_ROLES_BASE = {
  /** Admin */
  admin: 1,
  /** Moderator */
  moderator: 3,
  /** Support */
  support: 5,
  /** Seller */
  seller: 5,
  /** User */
  user: 4,
};

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {Request} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Perfor/**
 * USER_ROLES constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for user roles
 */
ms p o s t operation
 *
 * @param {Request} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const scale = body.scale || 10;

    // Calculate actual user counts based on scale
    // Admin is always 1 (Mohsin) regardless of scale
    const USER_ROLES = {
      admin: 1, // Always 1 admin - Mohsin
      /** Moderator */
      moderator: Math.max(
        1,
        Math.round((USER_ROLES_BASE.moderator * scale) / 10),
      ),
      /** Support */
      support: Math.max(1, Math.round((USER_ROLES_BASE.support * scale) / 10)),
      /** Seller */
      seller: Math.max(1, Math.round((USER_ROLES_BASE.seller * scale) / 10)),
      /** User */
      user: Math.max(1, Math.round((USER_ROLES_BASE.user * scale) / 10)),
    };

    const db = getFirestoreAdmin();
    const timestamp = new Date();
    const createdUsers: Array<{
      /** Id */
      id: string;
      /** Role */
      role: string;
      /** Name */
      name: string;
      /** Email */
      email: string;
      /** Password */
      password: string;
    }> = [];

    let userIndex = 0;
    for (const [role, count] of Object.entries(USER_ROLES)) {
      for (let i = 0; i < count; i++) {
        // Use Mohsin for the admin account, random names for others
        const isAdmin = role === "admin";
        const firstName = isAdmin
          ? "Mohsin"
          : INDIAN_FIRST_NAMES[userIndex % INDIAN_FIRST_NAMES.length];
        const lastName = isAdmin
          ? "AC"
          : INDIAN_LAST_NAMES[userIndex % INDIAN_LAST_NAMES.length];
        const fullName = `${firstName} ${lastName}`;
        const email = isAdmin
          ? "admin@demo.letitrip.in"
          : `${firstName.toLowerCase()}.${lastName.toLowerCase()}${userIndex}@demo.letitrip.in`;
        const city = INDIAN_CITIES[userIndex % INDIAN_CITIES.length];

        const userRef = db.collection(COLLECTIONS.USERS).doc();

        // Generate Beyblade-themed display name for sellers, use full name for others
        const displayName =
          role === "seller"
            ? `${BLADER_PREFIXES[userIndex % BLADER_PREFIXES.length]}_${firstName}`
            : fullName;

        // Beyblade-themed bio based on role
        const bioOptions = [
          `Beyblade collector and enthusiast from ${city.city}. Let it rip! 🌀`,
          `Passionate blader from ${city.city}. Specializing in rare and vintage Beyblades.`,
          `${city.city}-based collector. Metal Fight era enthusiast with 500+ collection!`,
          `Burst Pro League participant from ${city.city}. Trading since 2018!`,
          `Beyblade X Series specialist. Authentic Japanese imports from ${city.city}.`,
          `Vintage HMS and Plastics collector from ${city.city}. 15+ years experience!`,
          `Tournament champion and trader from ${city.city}. Premium stadium setups!`,
        ];

        await userRef.set({
          /** Name */
          name: `${DEMO_PREFIX}${fullName}`,
          display_name: displayName,
          email,
          role,
          /** Is Active */
          isActive: true,
          /** Is Verified */
          isVerified: true,
          /** Phone */
          phone: `+91-${9000000000 + userIndex}`,
          /** Avatar */
          avatar: AVATAR_IMAGES[userIndex % AVATAR_IMAGES.length],
          cover_image: `https://images.unsplash.com/photo-${1550000000000 + userIndex * 1000}?w=1200&h=400&fit=crop`,
          /** Bio */
          bio: bioOptions[userIndex % bioOptions.length],
          social_links: {
            twitter: `https://twitter.com/demo_${firstName.toLowerCase()}`,
            instagram: `https://instagram.com/demo_${firstName.toLowerCase()}`,
          },
          /** Preferences */
          preferences: {
            /** Newsletter */
            newsletter: Math.random() > 0.3,
            /** Notifications */
            notifications: true,
            /** Language */
            language: "en",
            /** Currency */
            currency: "INR",
          },
          /** Addresses */
          addresses: [
            {
              /** Id */
              id: `addr-${userRef.id}-1`,
              /** Street */
              street: `${100 + userIndex} ${STREETS[userIndex % STREETS.length]}`,
              /** City */
              city: city.city,
              /** State */
              state: city.state,
              /** Pincode */
              pincode: city.pincode,
              /** Country */
              country: "India",
              /** Is Default */
              isDefault: true,
              /** Label */
              label: "Home",
            },
          ],
          /** Created At */
          createdAt: timestamp,
          /** Updated At */
          updatedAt: timestamp,
          /** Password Hash */
          passwordHash: "$2a$10$demoHashForTestingOnlyDemo123",
        });

        createdUsers.push({
          /** Id */
          id: userRef.id,
          role,
          /** Name */
          name: fullName,
          email,
          /** Password */
          password: "Demo@123",
        });
        userIndex++;
      }
    }

    /**
 * Performs sellers operation
 *
 * @param {any} (u - The (u
 *
 * @returns {any} The sellers result
 *
 */
const sellers = createdUsers.filter((u) => u.role === "seller");
    const buyers = createdU/**
 * Performs moderators operation
 *
 * @param {any} (u - The (u
 *
 * @returns {any} The moderators result
 *
 */
sers.filter((u) => u.role === "user");
    const admins = createdUsers.filter((u) => u.role === "admin");
    const moderators = createdUsers.filter((u) => u.role === "moderator");
    const supportStaff = createdUsers.filter((u) => u.role === "support");

    const credentials = {
      /** Admins */
      admins: admins.map((u) => ({
        /** Email */
        email: u.email,
        /** Password */
        password: u.password,
        /** Name */
        name: u.name,
      })),
      /** Moderators */
      moderators: moderators.map((u) => ({
        /** Email */
        email: u.email,
        /** Password */
        password: u.password,
        /** Name */
        name: u.name,
      })),
      /** Support */
      support: supportStaff.map((u) => ({
        /** Email */
        email: u.email,
        /** Password */
        password: u.password,
        /** Name */
        name: u.name,
      })),
      /** Sellers */
      sellers: sellers
        .slice(0, 10)
        .map((u) => ({ email: u.email, password: u.password, name: u.name })),
      /** Buyers */
      buyers: buyers
        .slice(0, 10)
        .map((u) => ({ email: u.email, password: u.password, name: u.name })),
    };

    return NextResponse.json({
      /** Success */
      success: true,
      /** Step */
      step: "users",
      /** Data */
      data: {
        /** Count */
        count: createdUsers.length,
        /** Users By Role */
        usersByRole: {
          /** Admins */
          admins: admins.length,
          /** Moderators */
          moderators: moderators.length,
          /** Support */
          support: supportStaff.length,
          /** Sellers */
          sellers: sellers.length,
          /** Buyers */
          buyers: buyers.length,
        },
        /** Sellers */
        sellers: sellers.map((s) => ({ id: s.id, name: s.name })),
        /** Buyers */
        buyers: buyers.map((b) => ({ id: b.id, name: b.name })),
        credentials,
      },
    });
  } catch (error: unknown) {
    console.error("Demo users error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate users";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
