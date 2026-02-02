export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/app/globals.css" />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50">
        {/* Top Title Bar */}
        <header id="title-bar" className="sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
                L
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                Logo
              </span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4 md:mx-8 hidden md:block">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search products, categories..."
                  className="w-full px-4 py-2.5 pl-11 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* User, Cart Icons */}
            <div className="flex items-center gap-2">
              <button
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="User account"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
              <button
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors relative"
                aria-label="Shopping cart"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full font-semibold shadow-md">
                  0
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Navbar - Desktop */}
        <nav id="main-navbar" className="sticky top-16 z-40 hidden md:block">
          <div className="container mx-auto px-4">
            <ul className="flex items-center gap-1 h-14">
              <li>
                <a
                  href="/"
                  className="px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  className="px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  Products
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  About
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content Area with Sidebars */}
        <div className="flex flex-1">
          {/* Left Sidebar - Desktop, Right Sidebar - Mobile */}
          <aside
            id="secondary-sidebar"
            className="hidden lg:block lg:sticky lg:top-[7.5rem] lg:h-[calc(100vh-8rem)] w-64 overflow-y-auto scrollbar-thin md:left-0 md:fixed md:right-auto lg:relative
                     max-lg:fixed max-lg:right-0 max-lg:top-0 max-lg:h-full max-lg:z-40 max-lg:shadow-2xl"
          >
            <div className="p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">
                Quick Menu
              </h3>
              <ul className="space-y-1">
                <li>
                  <a
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg group"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <span className="font-medium">Dashboard</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg group"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="font-medium">Profile</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg group"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="font-medium">Settings</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/orders"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg group"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <span className="font-medium">Orders</span>
                  </a>
                </li>
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 mb-16 md:mb-0 bg-gray-50">
            {children}
          </main>
        </div>

        {/* Footer */}
        <footer id="footer" className="mt-auto mb-16 md:mb-0">
          <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
                    L
                  </div>
                  <span className="text-xl font-bold text-white">Logo</span>
                </div>
                <p className="text-gray-400 text-sm max-w-md">
                  Your trusted online marketplace for quality products. Shop
                  with confidence and enjoy fast delivery.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Quick Links</h4>
                <ul className="space-y-2.5 text-sm">
                  <li>
                    <a href="/about">About Us</a>
                  </li>
                  <li>
                    <a href="/privacy">Privacy Policy</a>
                  </li>
                  <li>
                    <a href="/terms">Terms of Service</a>
                  </li>
                  <li>
                    <a href="/faq">FAQ</a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Contact</h4>
                <ul className="space-y-2.5 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    support@example.com
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    +1 (555) 123-4567
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-10 pt-6 text-center">
              <p className="text-sm text-gray-400">
                © 2026 All rights reserved. Built with Next.js
              </p>
            </div>
          </div>
        </footer>

        {/* Bottom Mobile Navigation */}
        <nav
          id="bottom-navbar"
          className="fixed bottom-0 left-0 right-0 md:hidden z-50"
        >
          <ul className="flex items-center justify-around h-16 safe-area-inset-bottom">
            <li className="flex-1">
              <a
                href="/"
                className="flex flex-col items-center justify-center h-full hover:text-blue-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span className="text-xs mt-1">Home</span>
              </a>
            </li>
            <li className="flex-1">
              <a
                href="/products"
                className="flex flex-col items-center justify-center h-full hover:text-blue-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span className="text-xs mt-1">Products</span>
              </a>
            </li>
            <li className="flex-1">
              <a
                href="/about"
                className="flex flex-col items-center justify-center h-full hover:text-blue-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs mt-1">About</span>
              </a>
            </li>
            <li className="flex-1">
              <a
                href="/contact"
                className="flex flex-col items-center justify-center h-full hover:text-blue-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs mt-1">Contact</span>
              </a>
            </li>
          </ul>
        </nav>
      </body>
    </html>
  );
}
