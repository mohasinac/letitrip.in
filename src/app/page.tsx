export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to JustForView
        </h1>
        <p className="text-center text-lg mb-4">Modern E-commerce Platform</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="p-6 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Products</h2>
            <p className="text-gray-600">
              Browse our collection of amazing products
            </p>
          </div>
          <div className="p-6 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Categories</h2>
            <p className="text-gray-600">
              Explore different product categories
            </p>
          </div>
          <div className="p-6 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Cart</h2>
            <p className="text-gray-600">Manage your shopping cart</p>
          </div>
          <div className="p-6 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Orders</h2>
            <p className="text-gray-600">Track and manage your orders</p>
          </div>
        </div>
      </div>
    </main>
  );
}
