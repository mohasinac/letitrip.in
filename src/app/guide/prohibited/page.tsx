import { Metadata } from "next";
import { AlertTriangle, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Prohibited Items | Let It Rip",
  description:
    "List of items that cannot be listed or sold on Let It Rip platform",
};

export default function ProhibitedItemsPage() {
  const prohibitedCategories = [
    {
      category: "Illegal & Restricted Items",
      items: [
        "Weapons, firearms, and ammunition",
        "Explosives and fireworks",
        "Illegal drugs and drug paraphernalia",
        "Counterfeit currency and securities",
        "Stolen goods and property",
        "Lockpicking devices and similar tools",
      ],
    },
    {
      category: "Adult Content",
      items: [
        "Adult videos, magazines, and materials",
        "Escort services",
        "Adult toys (explicit)",
        "Items with explicit imagery",
      ],
    },
    {
      category: "Counterfeit & Replicas",
      items: [
        "Counterfeit designer goods",
        "Fake branded products",
        "Unauthorized replicas",
        "Items infringing intellectual property",
        "Bootleg software and media",
      ],
    },
    {
      category: "Regulated Items",
      items: [
        "Prescription medications",
        "Medical devices without approval",
        "Alcohol and tobacco products",
        "Live animals and pets",
        "Endangered species products",
        "Human remains and body parts",
      ],
    },
    {
      category: "Hazardous Materials",
      items: [
        "Toxic or hazardous chemicals",
        "Flammable liquids and gases",
        "Radioactive materials",
        "Asbestos-containing items",
        "Recalled products",
      ],
    },
    {
      category: "Services & Virtual Items",
      items: [
        "Event tickets (resale above face value)",
        "Lottery tickets and gambling items",
        "Credit card numbers and accounts",
        "Hacked or stolen accounts",
        "Services requiring licenses (without proof)",
      ],
    },
    {
      category: "Offensive Items",
      items: [
        "Hate speech materials",
        "Items promoting violence",
        "Discriminatory content",
        "Items depicting cruelty",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <div className="flex-shrink-0">
              <ShieldAlert className="w-12 h-12 text-red-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Prohibited Items
              </h1>
              <p className="text-gray-600">
                The following items are strictly prohibited from being listed,
                sold, or purchased on Let It Rip. Violations may result in
                account suspension or legal action.
              </p>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">Important Warning</p>
              <p>
                Listing prohibited items may result in immediate removal of your
                listing, account suspension, and potential legal consequences.
                When in doubt, contact support before listing.
              </p>
            </div>
          </div>

          {/* Prohibited Categories */}
          <div className="space-y-6 mb-8">
            {prohibitedCategories.map((category) => (
              <div
                key={category.category}
                className="border-b pb-6 last:border-b-0"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {category.category}
                </h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  {category.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <span className="text-red-600 mt-1">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-3">
              Not Sure If Your Item Is Allowed?
            </h3>
            <p className="text-gray-700 mb-4">
              If you're uncertain whether an item is permitted on our platform,
              please contact our support team before listing. We're here to help
              ensure compliance with our policies.
            </p>
            <a
              href="/support/ticket"
              className="inline-block px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-semibold"
            >
              Contact Support
            </a>
          </div>

          {/* Reporting */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-900 mb-3">
              Reporting Prohibited Items
            </h3>
            <p className="text-gray-600 mb-4">
              If you encounter a listing that violates our policies, please
              report it immediately. We review all reports and take appropriate
              action.
            </p>
            <p className="text-sm text-gray-500">
              Our team monitors listings 24/7 to ensure platform safety and
              compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
