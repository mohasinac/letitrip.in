export default function CouponsPage() {
  return (
    <main id="coupons-page" className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Available Coupons
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <h3 className="font-bold text-xl mb-2 text-gray-900">1200 JPY OFF</h3>
          <p className="text-gray-700 mb-4 font-medium">
            Amazon Japan ¥1,200 off
          </p>
          <button className="bg-yellow-500 text-gray-900 px-4 py-2 rounded hover:bg-yellow-600 font-bold">
            Claim
          </button>
        </div>
      </div>
    </main>
  );
}
