"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  Shield,
  Share2,
  ChevronRight,
  Loader2,
  Package,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import RecentlyViewed from "@/components/products/RecentlyViewed";
import toast from "react-hot-toast";
import { getProductImageUrl, getProductImages } from "@/utils/product";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  images: Array<{ url: string; alt: string; order: number }>;
  category: string;
  categorySlug?: string;
  tags: string[];
  status: string;
  rating?: number;
  reviewCount?: number;
  quantity: number;
  sku: string;
  features?: string[];
  specifications?: { [key: string]: string };
  seller?: {
    id: string;
    name?: string;
    storeName?: string;
    isVerified?: boolean;
  };
  weight?: number;
  weightUnit?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  returnable?: boolean;
  returnPeriod?: number;
  condition?: string;
  createdAt?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addItem } = useCart();
  const {
    addItem: addToWishlist,
    isInWishlist,
    removeItem: removeFromWishlist,
  } = useWishlist();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [variantProducts, setVariantProducts] = useState<Product[]>([]);
  const [imageZoom, setImageZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${slug}`);

      if (!response.ok) {
        throw new Error("Product not found");
      }

      const data = await response.json();
      setProduct(data.product);

      // Fetch variant products (same leaf-level category) and related products
      if (data.product.category) {
        fetchVariantProducts(data.product.category, data.product.id);
        fetchRelatedProducts(data.product.category, data.product.id);
      }

      // Track recently viewed
      trackRecentlyViewed(data.product);
    } catch (error: any) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category: string, excludeId: string) => {
    try {
      const response = await fetch(
        `/api/products?category=${category}&limit=4`
      );
      if (response.ok) {
        const data = await response.json();
        const filtered = data.products.filter(
          (p: Product) => p.id !== excludeId
        );
        setRelatedProducts(filtered.slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const fetchVariantProducts = async (category: string, excludeId: string) => {
    try {
      // Fetch products from the same leaf-level category (variants)
      const response = await fetch(
        `/api/products?category=${category}&limit=8`
      );
      if (response.ok) {
        const data = await response.json();
        // Filter out current product and limit to 6 variants
        const filtered = data.products.filter(
          (p: Product) => p.id !== excludeId
        );
        setVariantProducts(filtered.slice(0, 6));
      }
    } catch (error) {
      console.error("Error fetching variant products:", error);
    }
  };

  const trackRecentlyViewed = (product: Product) => {
    try {
      // Get recently viewed from localStorage
      const recentlyViewedStr = localStorage.getItem("recentlyViewed");
      let recentlyViewed: Product[] = recentlyViewedStr
        ? JSON.parse(recentlyViewedStr)
        : [];

      // Remove if already exists
      recentlyViewed = recentlyViewed.filter((p) => p.id !== product.id);

      // Add to beginning
      recentlyViewed.unshift({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        images: getProductImages(product),
        category: product.category,
      } as Product);

      // Keep only last 10
      recentlyViewed = recentlyViewed.slice(0, 10);

      // Save back
      localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
    } catch (error) {
      console.error("Error tracking recently viewed:", error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.quantity === 0) {
      toast.error("Product is out of stock");
      return;
    }

    if (quantity > product.quantity) {
      toast.error(`Only ${product.quantity} items available`);
      return;
    }

    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: getProductImageUrl(product, 0),
      sku: product.sku,
      addedAt: new Date(),
    });

    toast.success(`Added ${quantity} item(s) to cart`);
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    const wishlistProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: getProductImageUrl(product, 0) || "/assets/placeholder.png",
      slug: product.slug,
    };

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(wishlistProduct);
      toast.success("Added to wishlist");
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  const handleImageZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleImageZoomClose = () => {
    setImageZoom(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Product Not Found
          </h1>
          <Link
            href="/products"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.quantity === 0;
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100
      )
    : 0;
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <Link
            href="/"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            href="/products"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            Products
          </Link>
          {product.categorySlug && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link
                href={`/products?category=${product.category}`}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                {product.categorySlug}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image with Zoom */}
            <div
              className="relative aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-zoom-in group"
              onMouseEnter={() => setImageZoom(true)}
              onMouseLeave={() => setImageZoom(false)}
              onMouseMove={handleImageZoom}
            >
              <Image
                src={
                  getProductImages(product)[selectedImage]?.url ||
                  "/assets/placeholder.png"
                }
                alt={getProductImages(product)[selectedImage]?.alt || product.name}
                fill
                className={`object-cover transition-transform duration-200 ${
                  imageZoom ? "scale-150" : "scale-100"
                }`}
                style={
                  imageZoom
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }
                    : undefined
                }
                priority
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white font-semibold rounded z-10">
                  -{discountPercent}% OFF
                </span>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <span className="px-4 py-2 bg-gray-900 text-white font-semibold rounded">
                    Out of Stock
                  </span>
                </div>
              )}
              {/* Zoom hint */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Hover to zoom
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {getProductImages(product).length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {getProductImages(product).slice(0, 5).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-blue-600"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || `${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h1>
              {product.rating && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating!)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {product.rating.toFixed(1)}
                  </span>
                  {product.reviewCount && (
                    <span className="text-gray-500 dark:text-gray-400">
                      ({product.reviewCount} reviews)
                    </span>
                  )}
                </div>
              )}
              {product.sku && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  SKU: {product.sku}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Stock Status */}
            <div>
              {isOutOfStock ? (
                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded font-medium">
                  Out of Stock
                </span>
              ) : product.quantity < 10 ? (
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded font-medium">
                  Only {product.quantity} left!
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded font-medium">
                  In Stock
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Quantity:
                </span>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.max(1, Math.min(product.quantity, val)));
                    }}
                    className="w-16 text-center border-x border-gray-300 dark:border-gray-600 bg-transparent py-2 focus:outline-none"
                    min="1"
                    max={product.quantity}
                  />
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.quantity, quantity + 1))
                    }
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    disabled={quantity >= product.quantity}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 py-3 px-6 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Buy Now
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`p-3 border-2 rounded-lg transition-colors ${
                  inWishlist
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-red-500"
                }`}
              >
                <Heart
                  className={`w-6 h-6 ${
                    inWishlist
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    Free Shipping
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    On orders over ₹1000
                  </p>
                </div>
              </div>
              {product.returnable && (
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      Easy Returns
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {product.returnPeriod || 7} days return policy
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    Secure Payment
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    100% secure
                  </p>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            {product.seller && (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Sold by
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {product.seller.storeName ||
                      product.seller.name ||
                      "Seller"}
                  </p>
                  {product.seller.isVerified && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-12">
          <div className="space-y-6">
            {/* Description */}
            {product.description && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Description
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Key Features
                </h2>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-600 dark:text-gray-400"
                    >
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            {product.specifications &&
              Object.keys(product.specifications).length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Specifications
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {key}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {value}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Product Variants - Same Category Products */}
        {variantProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  More Products in This Category
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Explore other options from the same category
                </p>
              </div>
              <Link
                href={`/products?category=${product.category}`}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {variantProducts.map((variant) => {
                const variantHasDiscount =
                  variant.compareAtPrice &&
                  variant.compareAtPrice > variant.price;
                const variantDiscountPercent = variantHasDiscount
                  ? Math.round(
                      ((variant.compareAtPrice! - variant.price) /
                        variant.compareAtPrice!) *
                        100
                    )
                  : 0;

                return (
                  <div
                    key={variant.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
                  >
                    <Link
                      href={`/products/${variant.slug}`}
                      className="block relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden"
                    >
                      <Image
                        src={
                          variant.images[0]?.url || "/assets/placeholder.png"
                        }
                        alt={variant.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {variantHasDiscount && (
                        <span className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                          -{variantDiscountPercent}% OFF
                        </span>
                      )}
                      {variant.quantity === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="px-3 py-1 bg-gray-900 text-white text-sm font-semibold rounded">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </Link>
                    <div className="p-4">
                      <Link
                        href={`/products/${variant.slug}`}
                        className="block mb-2"
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {variant.name}
                        </h3>
                      </Link>
                      {variant.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(variant.rating!)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            ({variant.reviewCount || 0})
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(variant.price)}
                        </span>
                        {variantHasDiscount && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            {formatPrice(variant.compareAtPrice!)}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/products/${variant.slug}`}
                        className="block w-full py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <Link
                  key={relProduct.id}
                  href={`/products/${relProduct.slug}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <Image
                      src={
                        relgetProductImageUrl(product, 0) || "/assets/placeholder.png"
                      }
                      alt={relProduct.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {relProduct.name}
                    </h3>
                    {relProduct.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(relProduct.rating!)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          ({relProduct.reviewCount || 0})
                        </span>
                      </div>
                    )}
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(relProduct.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed Products */}
        <RecentlyViewed limit={4} excludeId={product.id} className="" />
      </div>
    </div>
  );
}
