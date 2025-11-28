/**
 * Seller Messages Page
 *
 * @status PLACEHOLDER - Feature pending implementation
 * @epic E023 - Messaging System
 *
 * This page will allow sellers to:
 * - View buyer inquiries
 * - Respond to messages
 * - Manage conversations
 * - Track response times
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages | Seller Dashboard",
  description: "Manage buyer communications",
};

export default function SellerMessagesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">
          🚧 Coming Soon
        </h2>
        <p className="text-yellow-700">
          The seller messaging feature is under development. Soon you&apos;ll be
          able to:
        </p>
        <ul className="list-disc list-inside mt-2 text-yellow-700">
          <li>View buyer inquiries about your products</li>
          <li>Respond to messages directly</li>
          <li>See order-related conversations</li>
          <li>Track your response time metrics</li>
          <li>Use quick reply templates</li>
        </ul>
      </div>

      <div className="mt-8 text-center text-gray-500">
        <p>No messages to display.</p>
        <p className="text-sm mt-2">
          When buyers contact you, their messages will appear here.
        </p>
      </div>
    </div>
  );
}
