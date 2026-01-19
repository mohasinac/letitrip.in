export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to <span className="text-indigo-600 dark:text-indigo-400">LetItRip</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
          Your journey to amazing deals and unique auctions starts here
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/products"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Browse Products
          </a>
          <a
            href="/auctions"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
          >
            View Auctions
          </a>
        </div>
      </div>
    </div>
  );
}
