export default function ShopsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">All Shops</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          "Anime Figures",
          "Mercari",
          "Rakuten Rakuma",
          "JDirectItems Fleemarket",
          "Surugaya",
          "Amazon Japan",
          "Yahoo Auctions",
          "Mandarake",
        ].map((shop) => (
          <div
            key={shop}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="font-semibold text-gray-800 text-lg">{shop}</h3>
          </div>
        ))}
      </div>
    </main>
  );
}
