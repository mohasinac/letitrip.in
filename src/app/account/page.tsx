"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("profile");

  // Mock user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 9876543210",
    avatar: "/avatars/user-1.jpg",
    joinedDate: "January 2024",
    totalOrders: 12,
    totalSpent: 45750,
  };

  const orders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "delivered",
      total: 2999,
      items: [{ name: "Premium Beyblade Stadium", quantity: 1, price: 2999 }],
    },
    {
      id: "ORD-002",
      date: "2024-01-10",
      status: "shipped",
      total: 1499,
      items: [{ name: "Metal Fusion Set", quantity: 1, price: 1499 }],
    },
  ];

  const addresses = [
    {
      id: "1",
      type: "Home",
      name: "John Doe",
      address: "123 Main Street, Apartment 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      phone: "+91 9876543210",
      isDefault: true,
    },
    {
      id: "2",
      type: "Office",
      name: "John Doe",
      address: "456 Business Park, Office 12",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400002",
      phone: "+91 9876543210",
      isDefault: false,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Delivered
          </span>
        );
      case "shipped":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            Shipped
          </span>
        );
      case "processing":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
            Processing
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            {status}
          </span>
        );
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "orders", label: "Orders", icon: "📦" },
    { id: "addresses", label: "Addresses", icon: "📍" },
    { id: "wishlist", label: "Wishlist", icon: "❤️" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card p-6">
                {/* User Info */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="font-semibold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Member since {user.joinedDate}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="font-bold text-lg">{user.totalOrders}</div>
                    <div className="text-xs text-muted-foreground">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">
                      ₹{user.totalSpent.toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-muted-foreground">Spent</div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                        activeTab === tab.id
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t">
                  <button className="w-full btn btn-outline text-red-600 border-red-200 hover:bg-red-50">
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="card p-6">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div>
                    <h1 className="text-2xl font-bold mb-6">
                      Profile Information
                    </h1>
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            className="input w-full"
                            defaultValue={user.name}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            className="input w-full"
                            defaultValue={user.email}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            className="input w-full"
                            defaultValue={user.phone}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Date of Birth
                          </label>
                          <input type="date" className="input w-full" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Bio
                        </label>
                        <textarea
                          className="input w-full h-24"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      <div className="flex gap-4">
                        <button type="submit" className="btn btn-primary">
                          Save Changes
                        </button>
                        <button type="button" className="btn btn-outline">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && (
                  <div>
                    <h1 className="text-2xl font-bold mb-6">Order History</h1>
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold">#{order.id}</h3>
                              <p className="text-sm text-muted-foreground">
                                Placed on{" "}
                                {new Date(order.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(order.status)}
                              <p className="text-lg font-bold mt-1">
                                ₹{order.total.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            {order.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-sm"
                              >
                                <span>
                                  {item.name} × {item.quantity}
                                </span>
                                <span>
                                  ₹{item.price.toLocaleString("en-IN")}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-4">
                            <Link
                              href={`/orders/${order.id}`}
                              className="btn btn-outline text-sm"
                            >
                              View Details
                            </Link>
                            {order.status === "delivered" && (
                              <button className="btn btn-outline text-sm">
                                Reorder
                              </button>
                            )}
                            {order.status === "delivered" && (
                              <button className="btn btn-outline text-sm">
                                Leave Review
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Addresses Tab */}
                {activeTab === "addresses" && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-2xl font-bold">Saved Addresses</h1>
                      <button className="btn btn-primary">
                        Add New Address
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-6 ${
                            address.isDefault
                              ? "border-primary bg-primary/5"
                              : ""
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold flex items-center gap-2">
                                {address.type}
                                {address.isDefault && (
                                  <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                                    Default
                                  </span>
                                )}
                              </h3>
                            </div>
                          </div>

                          <div className="text-sm space-y-1">
                            <p className="font-medium">{address.name}</p>
                            <p>{address.address}</p>
                            <p>
                              {address.city}, {address.state} {address.pincode}
                            </p>
                            <p>{address.phone}</p>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <button className="btn btn-outline text-sm">
                              Edit
                            </button>
                            <button className="btn btn-outline text-sm text-red-600">
                              Delete
                            </button>
                            {!address.isDefault && (
                              <button className="btn btn-outline text-sm">
                                Set Default
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Wishlist Tab */}
                {activeTab === "wishlist" && (
                  <div>
                    <h1 className="text-2xl font-bold mb-6">Wishlist</h1>
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        Your wishlist is empty
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Save items you like for later
                      </p>
                      <Link href="/products" className="btn btn-primary">
                        Browse Products
                      </Link>
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === "settings" && (
                  <div>
                    <h1 className="text-2xl font-bold mb-6">
                      Account Settings
                    </h1>
                    <div className="space-y-8">
                      {/* Password */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Change Password
                        </h3>
                        <form className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Current Password
                            </label>
                            <input
                              type="password"
                              className="input w-full max-w-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              className="input w-full max-w-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              className="input w-full max-w-md"
                            />
                          </div>
                          <button type="submit" className="btn btn-primary">
                            Update Password
                          </button>
                        </form>
                      </div>

                      {/* Notifications */}
                      <div className="pt-8 border-t">
                        <h3 className="text-lg font-semibold mb-4">
                          Notifications
                        </h3>
                        <div className="space-y-4">
                          <label className="flex items-center justify-between">
                            <span>Email notifications</span>
                            <input
                              type="checkbox"
                              defaultChecked
                              className="toggle"
                            />
                          </label>
                          <label className="flex items-center justify-between">
                            <span>SMS notifications</span>
                            <input type="checkbox" className="toggle" />
                          </label>
                          <label className="flex items-center justify-between">
                            <span>Order updates</span>
                            <input
                              type="checkbox"
                              defaultChecked
                              className="toggle"
                            />
                          </label>
                          <label className="flex items-center justify-between">
                            <span>Promotional emails</span>
                            <input type="checkbox" className="toggle" />
                          </label>
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="pt-8 border-t">
                        <h3 className="text-lg font-semibold mb-4 text-red-600">
                          Danger Zone
                        </h3>
                        <button className="btn btn-outline text-red-600 border-red-200 hover:bg-red-50">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
