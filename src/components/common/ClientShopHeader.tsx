"use client";

interface ClientShopHeaderProps {
  shop: any;
  ImageComponent?: any;
}

export function ClientShopHeader({
  shop,
  ImageComponent,
}: ClientShopHeaderProps) {
  const handleFollow = async () => {
    console.log("Follow shop:", shop.slug);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shop.name,
          text: `Check out ${shop.name} on LetItRip`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share failed:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Shop link copied to clipboard!");
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      {/* Banner Image */}
      <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600"></div>

      {/* Shop Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-6">
        <div className="flex items-center gap-4">
          {/* Shop Logo */}
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            {shop.logo ? (
              <img
                src={shop.logo}
                alt={shop.name}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <span className="text-2xl font-bold text-gray-800">
                {shop.name?.charAt(0) || "S"}
              </span>
            )}
          </div>

          {/* Shop Details */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{shop.name}</h1>
            <p className="text-sm opacity-90">{shop.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span>⭐ {shop.rating || 4.5}</span>
              <span>📦 {shop.productCount || 0} Products</span>
              {shop.verified && (
                <span className="text-green-400">✓ Verified</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleFollow}
              className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100"
            >
              Follow
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-transparent border border-white rounded-lg hover:bg-white hover:text-gray-800"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
