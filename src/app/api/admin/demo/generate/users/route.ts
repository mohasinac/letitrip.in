import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

const DEMO_PREFIX = "DEMO_";

const INDIAN_FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Arjun", "Sai", "Krishna", "Ishaan", "Rohan", "Rahul", "Ravi",
  "Ananya", "Aadhya", "Diya", "Priya", "Kavya", "Saanvi", "Anika", "Pari", "Myra", "Sara",
  "Amit", "Suresh", "Vikram", "Karan", "Akash", "Nikhil", "Sanjay", "Raj", "Dev", "Jay",
  "Pooja", "Neha", "Shreya", "Anjali", "Ritika", "Meera", "Nisha", "Sneha", "Divya", "Tanvi",
  "Om", "Ved", "Yash", "Aryan", "Dhruv", "Kabir", "Shaurya", "Rehan", "Zain", "Ali",
];

const INDIAN_LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Shah", "Joshi", "Iyer", "Nair",
  "Reddy", "Rao", "Menon", "Pillai", "Agarwal", "Banerjee", "Das", "Ghosh", "Sen", "Malhotra",
];

const INDIAN_CITIES = [
  { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  { city: "Delhi", state: "Delhi", pincode: "110001" },
  { city: "Bangalore", state: "Karnataka", pincode: "560001" },
  { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  { city: "Kolkata", state: "West Bengal", pincode: "700001" },
  { city: "Pune", state: "Maharashtra", pincode: "411001" },
  { city: "Ahmedabad", state: "Gujarat", pincode: "380001" },
  { city: "Hyderabad", state: "Telangana", pincode: "500001" },
  { city: "Jaipur", state: "Rajasthan", pincode: "302001" },
  { city: "Lucknow", state: "Uttar Pradesh", pincode: "226001" },
];

const STREETS = ["Marine Drive", "MG Road", "Park Street", "Anna Salai", "FC Road", "Brigade Road", "Linking Road", "Gandhi Nagar", "Civil Lines", "Mall Road"];

// Beyblade-themed display name prefixes for sellers
const BLADER_PREFIXES = [
  "BladeMaster", "SpinKing", "DragonBlader", "StormRider", "PhoenixBurst", "LegendarySpinner",
  "BurstChampion", "MetalFury", "GalaxyPegasus", "LDragoMaster", "ValkyriePro", "SprigganElite",
  "FafnirAce", "LonginusKing", "AchillesHero", "DiabolosDark", "BelialBlader", "RageWarrior",
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

// Role distribution for 100 users
const USER_ROLES = { admin: 2, moderator: 3, support: 5, seller: 50, user: 40 };

export async function POST() {
  try {
    const db = getFirestoreAdmin();
    const timestamp = new Date();
    const createdUsers: Array<{ id: string; role: string; name: string; email: string; password: string }> = [];

    let userIndex = 0;
    for (const [role, count] of Object.entries(USER_ROLES)) {
      for (let i = 0; i < count; i++) {
        const firstName = INDIAN_FIRST_NAMES[userIndex % INDIAN_FIRST_NAMES.length];
        const lastName = INDIAN_LAST_NAMES[userIndex % INDIAN_LAST_NAMES.length];
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${userIndex}@demo.letitrip.in`;
        const city = INDIAN_CITIES[userIndex % INDIAN_CITIES.length];

        const userRef = db.collection(COLLECTIONS.USERS).doc();
        
        // Generate Beyblade-themed display name for sellers, use full name for others
        const displayName = role === "seller" 
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
          name: `${DEMO_PREFIX}${fullName}`,
          display_name: displayName,
          email,
          role,
          isActive: true,
          isVerified: true,
          phone: `+91-${9000000000 + userIndex}`,
          avatar: AVATAR_IMAGES[userIndex % AVATAR_IMAGES.length],
          cover_image: `https://images.unsplash.com/photo-${1550000000000 + userIndex * 1000}?w=1200&h=400&fit=crop`,
          bio: bioOptions[userIndex % bioOptions.length],
          social_links: {
            twitter: `https://twitter.com/demo_${firstName.toLowerCase()}`,
            instagram: `https://instagram.com/demo_${firstName.toLowerCase()}`,
          },
          preferences: {
            newsletter: Math.random() > 0.3,
            notifications: true,
            language: "en",
            currency: "INR",
          },
          addresses: [{
            id: `addr-${userRef.id}-1`,
            street: `${100 + userIndex} ${STREETS[userIndex % STREETS.length]}`,
            city: city.city,
            state: city.state,
            pincode: city.pincode,
            country: "India",
            isDefault: true,
            label: "Home",
          }],
          createdAt: timestamp,
          updatedAt: timestamp,
          passwordHash: "$2a$10$demoHashForTestingOnlyDemo123",
        });

        createdUsers.push({ id: userRef.id, role, name: fullName, email, password: "Demo@123" });
        userIndex++;
      }
    }

    const sellers = createdUsers.filter(u => u.role === "seller");
    const buyers = createdUsers.filter(u => u.role === "user");
    const admins = createdUsers.filter(u => u.role === "admin");
    const moderators = createdUsers.filter(u => u.role === "moderator");
    const supportStaff = createdUsers.filter(u => u.role === "support");

    const credentials = {
      admins: admins.map(u => ({ email: u.email, password: u.password, name: u.name })),
      moderators: moderators.map(u => ({ email: u.email, password: u.password, name: u.name })),
      support: supportStaff.map(u => ({ email: u.email, password: u.password, name: u.name })),
      sellers: sellers.slice(0, 10).map(u => ({ email: u.email, password: u.password, name: u.name })),
      buyers: buyers.slice(0, 10).map(u => ({ email: u.email, password: u.password, name: u.name })),
    };

    return NextResponse.json({
      success: true,
      step: "users",
      data: {
        count: createdUsers.length,
        usersByRole: {
          admins: admins.length,
          moderators: moderators.length,
          support: supportStaff.length,
          sellers: sellers.length,
          buyers: buyers.length,
        },
        sellers: sellers.map(s => ({ id: s.id, name: s.name })),
        buyers: buyers.map(b => ({ id: b.id, name: b.name })),
        credentials,
      },
    });
  } catch (error: unknown) {
    console.error("Demo users error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate users";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
