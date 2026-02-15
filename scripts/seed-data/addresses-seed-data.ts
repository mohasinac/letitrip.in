/**
 * Addresses Seed Data
 * Sample user addresses for development and testing
 *
 * Addresses stored as subcollection: users/{userId}/addresses/{addressId}
 */

export interface AddressSeedData {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  userId: string; // Parent user reference
}

export const addressesSeedData: AddressSeedData[] = [
  // ============================================
  // John Doe's Addresses
  // ============================================
  {
    id: "addr-john-home-1707400001",
    userId: "user-john-doe-johndoe",
    label: "Home",
    fullName: "John Doe",
    phone: "+919876543211",
    addressLine1: "Flat 302, Crystal Towers",
    addressLine2: "MG Road, Andheri East",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400069",
    country: "India",
    isDefault: true,
  },
  {
    id: "addr-john-office-1707400002",
    userId: "user-john-doe-johndoe",
    label: "Office",
    fullName: "John Doe",
    phone: "+919876543211",
    addressLine1: "Tech Park, 5th Floor",
    addressLine2: "Powai Link Road",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400076",
    country: "India",
    isDefault: false,
  },
  {
    id: "addr-john-parents-1707400003",
    userId: "user-john-doe-johndoe",
    label: "Parents' Home",
    fullName: "Rakesh Doe",
    phone: "+912066554433",
    addressLine1: "House No. 45, Sector 12",
    addressLine2: "Near Central Park",
    city: "Pune",
    state: "Maharashtra",
    postalCode: "411038",
    country: "India",
    isDefault: false,
  },

  // ============================================
  // Jane Smith's Addresses
  // ============================================
  {
    id: "addr-jane-home-1707400004",
    userId: "user-jane-smith-janes",
    label: "Home",
    fullName: "Jane Smith",
    phone: "+919876543212",
    addressLine1: "Villa 23, Whitefield Gardens",
    addressLine2: "Marathahalli",
    city: "Bangalore",
    state: "Karnataka",
    postalCode: "560037",
    country: "India",
    isDefault: true,
  },
  {
    id: "addr-jane-work-1707400005",
    userId: "user-jane-smith-janes",
    label: "Work",
    fullName: "Jane Smith",
    phone: "+919876543212",
    addressLine1: "Block C, Tech Hub",
    addressLine2: "Outer Ring Road",
    city: "Bangalore",
    state: "Karnataka",
    postalCode: "560103",
    country: "India",
    isDefault: false,
  },

  // ============================================
  // Mike Johnson's Addresses
  // ============================================
  {
    id: "addr-mike-home-1707400006",
    userId: "user-mike-johnson-mikejon",
    label: "Home",
    fullName: "Mike Johnson",
    phone: "+919876543213",
    addressLine1: "Apartment 12B, Lake View Residency",
    addressLine2: "Salt Lake City",
    city: "Kolkata",
    state: "West Bengal",
    postalCode: "700091",
    country: "India",
    isDefault: true,
  },
  {
    id: "addr-mike-shipping-1707400007",
    userId: "user-mike-johnson-mikejon",
    label: "Alternative Shipping",
    fullName: "Mike Johnson",
    phone: "+919876543213",
    addressLine1: "56 Park Street",
    addressLine2: "Near Coffee House",
    city: "Kolkata",
    state: "West Bengal",
    postalCode: "700016",
    country: "India",
    isDefault: false,
  },

  // ============================================
  // Sarah Lee's Addresses
  // ============================================
  {
    id: "addr-sarah-home-1707400008",
    userId: "user-sarah-lee-sarahl",
    label: "Home",
    fullName: "Sarah Lee",
    phone: "+919876543214",
    addressLine1: "Plot 78, Jubilee Hills",
    addressLine2: "Road No. 36",
    city: "Hyderabad",
    state: "Telangana",
    postalCode: "500033",
    country: "India",
    isDefault: true,
  },
  {
    id: "addr-sarah-office-1707400009",
    userId: "user-sarah-lee-sarahl",
    label: "Office",
    fullName: "Sarah Lee",
    phone: "+919876543214",
    addressLine1: "DLF Cyber City, Tower B",
    addressLine2: "HITEC City",
    city: "Hyderabad",
    state: "Telangana",
    postalCode: "500081",
    country: "India",
    isDefault: false,
  },

  // ============================================
  // David Kumar's Addresses
  // ============================================
  {
    id: "addr-david-home-1707400010",
    userId: "user-david-kumar-davidkumar",
    label: "Home",
    fullName: "David Kumar",
    phone: "+919876543215",
    addressLine1: "House 123, Sector 50",
    addressLine2: "Golf Course Road",
    city: "Gurugram",
    state: "Haryana",
    postalCode: "122018",
    country: "India",
    isDefault: true,
  },
  {
    id: "addr-david-warehouse-1707400011",
    userId: "user-david-kumar-davidkumar",
    label: "Business Warehouse",
    fullName: "David Kumar Enterprises",
    phone: "+911123456789",
    addressLine1: "Warehouse 45, Industrial Area Phase 2",
    addressLine2: "IMT Manesar",
    city: "Gurugram",
    state: "Haryana",
    postalCode: "122051",
    country: "India",
    isDefault: false,
  },

  // ============================================
  // Emily Chen's Addresses
  // ============================================
  {
    id: "addr-emily-home-1707400012",
    userId: "user-emily-chen-emilyc",
    label: "Home",
    fullName: "Emily Chen",
    phone: "+919876543216",
    addressLine1: "Flat 805, Skyline Apartments",
    addressLine2: "Anna Nagar West",
    city: "Chennai",
    state: "Tamil Nadu",
    postalCode: "600040",
    country: "India",
    isDefault: true,
  },
  {
    id: "addr-emily-shop-1707400013",
    userId: "user-emily-chen-emilyc",
    label: "Shop Address",
    fullName: "Emily's Boutique",
    phone: "+914423456789",
    addressLine1: "Shop 12, Phoenix Mall",
    addressLine2: "Velachery Main Road",
    city: "Chennai",
    state: "Tamil Nadu",
    postalCode: "600042",
    country: "India",
    isDefault: false,
  },

  // ============================================
  // Ryan Patel's Addresses
  // ============================================
  {
    id: "addr-ryan-home-1707400014",
    userId: "user-ryan-patel-ryanp",
    label: "Home",
    fullName: "Ryan Patel",
    phone: "+919876543217",
    addressLine1: "Bungalow 45, Satellite Area",
    addressLine2: "Near ISKCON Temple",
    city: "Ahmedabad",
    state: "Gujarat",
    postalCode: "380015",
    country: "India",
    isDefault: true,
  },

  // ============================================
  // Lisa Sharma's Addresses
  // ============================================
  {
    id: "addr-lisa-home-1707400015",
    userId: "user-lisa-sharma-lisas",
    label: "Home",
    fullName: "Lisa Sharma",
    phone: "+919876543218",
    addressLine1: "C-204, Green Valley Apartments",
    addressLine2: "Gomti Nagar",
    city: "Lucknow",
    state: "Uttar Pradesh",
    postalCode: "226010",
    country: "India",
    isDefault: true,
  },
  {
    id: "addr-lisa-parents-1707400016",
    userId: "user-lisa-sharma-lisas",
    label: "Parents",
    fullName: "Rajesh Sharma",
    phone: "+915223344556",
    addressLine1: "House 67, Civil Lines",
    addressLine2: "Near District Court",
    city: "Lucknow",
    state: "Uttar Pradesh",
    postalCode: "226001",
    country: "India",
    isDefault: false,
  },

  // ============================================
  // Admin User's Address (for testing)
  // ============================================
  {
    id: "addr-admin-primary-1707400017",
    userId: "user-admin-user-admin",
    label: "Primary",
    fullName: "Admin User",
    phone: "+919876543210",
    addressLine1: "LetItRip HQ, 10th Floor",
    addressLine2: "BKC, G Block",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400051",
    country: "India",
    isDefault: true,
  },
];
