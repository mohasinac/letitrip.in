/**
 * User Messages Page
 *
 * Inbox for user messages and conversations with sellers.
 *
 * @page /user/messages - User messages page
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages | Let It Rip",
  description: "Your message inbox and conversations",
};

export default function UserMessagesPage() {
  const conversations = [
    {
      id: "1",
      seller: "TechStore India",
      lastMessage: "Your order has been shipped!",
      time: "2 hours ago",
      unread: true,
      avatar: "/placeholder-shop.jpg",
    },
    {
      id: "2",
      seller: "Fashion Hub",
      lastMessage: "Thank you for your purchase",
      time: "1 day ago",
      unread: false,
      avatar: "/placeholder-shop.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Messages
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Chat with sellers about your orders and inquiries
            </p>
          </div>

          {/* Messages Interface */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-3 h-[600px]">
              {/* Conversations List */}
              <div className="border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    placeholder="Search messages..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-900 dark:text-white"
                  />
                </div>

                {conversations.length > 0 ? (
                  <div>
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition ${
                          conv.unread ? "bg-blue-50 dark:bg-blue-900/10" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={conv.avatar}
                            alt={conv.seller}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {conv.seller}
                              </h3>
                              {conv.unread && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {conv.lastMessage}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {conv.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Messages
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your conversations will appear here
                    </p>
                  </div>
                )}
              </div>

              {/* Chat Area */}
              <div className="md:col-span-2 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <img
                      src="/placeholder-shop.jpg"
                      alt="Seller"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        TechStore India
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Usually replies in a few hours
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                  <div className="space-y-4">
                    <div className="flex justify-start">
                      <div className="max-w-xs bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                        <p className="text-sm text-gray-900 dark:text-white">
                          Hello! How can I help you today?
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          10:30 AM
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="max-w-xs bg-primary text-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm">
                          I'd like to know about the shipping status
                        </p>
                        <p className="text-xs text-blue-100 mt-1">10:32 AM</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-900 dark:text-white"
                    />
                    <button className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
