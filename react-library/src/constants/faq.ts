// FAQ Constants for the library
export interface FAQCategory {
  id: string;
  name: string;
  icon?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags?: string[];
}

export const FAQ_CATEGORIES: FAQCategory[] = [
  { id: "general", name: "General", icon: "HelpCircle" },
  { id: "account", name: "Account", icon: "User" },
  { id: "orders", name: "Orders", icon: "ShoppingBag" },
  { id: "payments", name: "Payments", icon: "CreditCard" },
  { id: "shipping", name: "Shipping", icon: "Truck" },
  { id: "returns", name: "Returns & Refunds", icon: "RotateCcw" },
  { id: "sellers", name: "For Sellers", icon: "Store" },
  { id: "auctions", name: "Auctions", icon: "Gavel" },
  { id: "technical", name: "Technical", icon: "Settings" },
];

export const SAMPLE_FAQS: FAQ[] = [
  {
    id: "1",
    question: "How do I create an account?",
    answer:
      "You can create an account by clicking the Sign Up button and filling out the registration form.",
    category: "account",
    tags: ["registration", "signup"],
  },
  {
    id: "2",
    question: "What payment methods do you accept?",
    answer:
      "We accept credit cards, debit cards, UPI, net banking, and digital wallets.",
    category: "payments",
    tags: ["payment", "methods"],
  },
  // Add more sample FAQs as needed
];

export function getFAQsByCategory(categoryId: string): FAQ[] {
  return SAMPLE_FAQS.filter((faq) => faq.category === categoryId);
}
