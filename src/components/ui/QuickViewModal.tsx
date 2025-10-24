"use client";

import { useState } from "react";
import Image from "next/image";
import {
  XMarkIcon,
  HeartIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  isFeatured?: boolean;
  description?: string;
  inStock?: boolean;
}

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
}: QuickViewModalProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  if (!isOpen || !product) return null;

  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100
      )
    : 0;

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await addToCart({
        productId: product.id,
        quantity,
        price: product.price,
        name: product.name,
        image: product.image,
      });
      onClose();
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // In a real app, this would make an API call to update the wishlist
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square bg-gray-100">
            <Image
              src={product.image || "/placeholder-product.jpg"}
              alt={product.name}
              fill
              className="object-cover"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                -{discount}% OFF
              </span>
            )}
            {product.isFeatured && (
              <span className="absolute top-4 right-14 bg-primary text-white text-sm font-bold px-3 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6 flex flex-col">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">{product.name}</h2>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-primary">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.compareAtPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product.compareAtPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description ||
                    `Experience the thrill of ${product.name}. This premium product offers exceptional quality and performance that Beyblade enthusiasts love. Perfect for both beginners and advanced players.`}
                </p>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Features</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ 100% Authentic Product</li>
                  <li>✅ Premium Quality Materials</li>
                  <li>✅ Fast Shipping Available</li>
                  <li>✅ 30-Day Return Policy</li>
                </ul>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                <div
                  className={`w-2 h-2 rounded-full ${
                    product.inStock !== false ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    product.inStock !== false
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {product.inStock !== false ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <label className="font-medium">Quantity:</label>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.inStock === false}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </button>

                <button
                  onClick={toggleWishlist}
                  className={`btn p-3 transition-colors ${
                    isWishlisted
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "btn-outline hover:bg-red-50 hover:text-red-500"
                  }`}
                >
                  {isWishlisted ? (
                    <HeartSolidIcon className="h-5 w-5" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Additional Info */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>🚚 Free shipping on orders over ₹999</p>
                <p>🔒 Secure payment with SSL encryption</p>
                <p>📱 24/7 customer support available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
