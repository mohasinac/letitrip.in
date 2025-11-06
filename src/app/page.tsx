export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-lg p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to DOORZO
          </h1>
          <p className="text-xl text-gray-800 mb-6 font-medium">
            Your Gateway to Japanese Shopping
          </p>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-8 py-3 rounded-lg font-bold text-lg">
            Start Shopping
          </button>
        </section>

        {/* Featured Products Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Product {item}
                </h3>
                <p className="text-yellow-700 font-bold text-lg">¥{1000 * item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Categories */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Anime", "Gaming", "Fashion", "Electronics"].map((category) => (
              <div
                key={category}
                className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
              >
                <h3 className="font-bold text-gray-900">{category}</h3>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
