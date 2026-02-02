export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {/* Top Title Bar */}
        <header
          id="title-bar"
          className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm"
        >
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">Logo</div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <input
                type="search"
                placeholder="Search..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* User, Cart Icons */}
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
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
              <button className="p-2 hover:bg-gray-100 rounded-full relative">
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
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  0
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Navbar - Desktop */}
        <nav
          id="main-navbar"
          className="sticky top-16 z-40 bg-gray-50 border-b border-gray-200 hidden md:block"
        >
          <div className="container mx-auto px-4">
            <ul className="flex items-center gap-6 h-12">
              <li>
                <a href="/" className="hover:text-blue-600 font-medium">
                  Home
                </a>
              </li>
              <li>
                <a href="/products" className="hover:text-blue-600 font-medium">
                  Products
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-blue-600 font-medium">
                  About
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-blue-600 font-medium">
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
            className="hidden lg:block lg:sticky lg:top-28 lg:h-[calc(100vh-7rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto md:left-0 md:fixed md:right-auto lg:relative
                     max-lg:fixed max-lg:right-0 max-lg:top-0 max-lg:h-full max-lg:z-40 max-lg:shadow-lg"
          >
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                Menu
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/dashboard"
                    className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Profile
                  </a>
                </li>
                <li>
                  <a
                    href="/settings"
                    className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Settings
                  </a>
                </li>
                <li>
                  <a
                    href="/orders"
                    className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Orders
                  </a>
                </li>
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 mb-16 md:mb-0">{children}</main>
        </div>

        {/* Footer */}
        <footer
          id="footer"
          className="bg-gray-800 text-white mt-auto mb-16 md:mb-0"
        >
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold mb-4">About</h4>
                <p className="text-gray-400 text-sm">
                  Your trusted online marketplace.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Links</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="/privacy"
                      className="text-gray-400 hover:text-white"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="text-gray-400 hover:text-white">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Contact</h4>
                <p className="text-gray-400 text-sm">support@example.com</p>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-400">
              © 2026 All rights reserved.
            </div>
          </div>
        </footer>

        {/* Bottom Mobile Navigation */}
        <nav
          id="bottom-navbar"
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-50"
        >
          <ul className="flex items-center justify-around h-16">
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
