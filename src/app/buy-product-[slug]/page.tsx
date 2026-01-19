/**
 * Product Details Page
 *
 * Detailed product page with media gallery, specifications, reviews, and related products.
 * Server-side rendered for SEO optimization.
 *
 * URL Format: /buy-product-{slug}
 * Example: /buy-product-iphone-15-pro-max-256gb
 *
 * Features:
 * - Media gallery with lightbox viewer
 * - Product details and specifications
 * - Add to cart/buy now actions
 * - Product variants and similar products
 * - Customer reviews section
 * - SEO metadata with structured data
 *
 * @page /buy-product-[slug] - Product details
 */

import { Breadcrumb, ProductCard } from "@letitrip/react-library";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// Types
interface PageProps {
  params: {
    slug: string;
  };
  searchParams: {
    variant?: string;
  };
}

/**
 * Generate dynamic metadata for SEO
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);

  if (!product) {
    return {
      title: "Product Not Found | Let It Rip",
      description: "The product you're looking for doesn't exist.",
    };
  }

  const title = `${product.name} | Let It Rip`;
  const description =
    product.shortDescription ||
    `Buy ${product.name} at ₹${product.price.toLocaleString()}. ${
      product.condition
    } condition. ${product.inStock ? "In stock" : "Out of stock"}.`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.category,
      product.condition,
      "buy online",
      "India",
      ...(product.tags || []),
    ],
    openGraph: {
      title,
      description,
      type: "product",
      images: product.images?.map((img: string) => ({
        url: img,
        alt: product.name,
      })),
    },
  };
}

/**
 * Fetch product details from API
 */
async function getProduct(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/products/${slug}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      console.error("Failed to fetch product:", res.status);
      return null;
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

/**
 * Fetch similar products (same category)
 */
async function getSimilarProducts(categorySlug: string, currentSlug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    const res = await fetch(
      `${baseUrl}/api/products?categorySlug=${categorySlug}&limit=8`,
      {
        next: { revalidate: 600 },
      },
    );

    if (!res.ok) return [];

    const data = await res.json();
    // Filter out current product
    return (data.data?.products || []).filter(
      (p: any) => p.slug !== currentSlug,
    );
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return [];
  }
}

/**
 * Fetch product reviews
 */
async function getReviews(productSlug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    const res = await fetch(
      `${baseUrl}/api/reviews?productSlug=${productSlug}&limit=5`,
      {
        next: { revalidate: 300 },
      },
    );

    if (!res.ok) return [];

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export default async function ProductDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  // Fetch related data
  const [similarProducts, reviews] = await Promise.all([
    getSimilarProducts(product.categorySlug, product.slug),
    getReviews(product.slug),
  ]);

  // Calculate discount percentage
  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb
          currentPath={`/buy-product-${params.slug}`}
          LinkComponent={Link as any}
        />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Media Gallery */}
          <div>
            <div className="sticky top-24">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
                <img
                  src={product.images?.[0] || "/placeholder-product.jpg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.featured && (
                  <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </div>
                )}
                {discountPercent > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    -{discountPercent}%
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images
                    .slice(0, 4)
                    .map((img: string, idx: number) => (
                      <div
                        key={idx}
                        className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition"
                      >
                        <img
                          src={img}
                          alt={`${product.name} - ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div>
            {/* Shop Link */}
            <Link
              href={`/shop-${product.shopSlug}`}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-2 inline-block"
            >
              {product.shopName}
            </Link>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(product.rating)
                          ? "text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {product.rating} ({product.reviewCount || 0} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-2xl text-gray-500 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {product.originalPrice && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  You save ₹
                  {(product.originalPrice - product.price).toLocaleString()} (
                  {discountPercent}%)
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">
                    In Stock ({product.stock} available)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Condition & Icons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium">
                {product.condition}
              </span>
              {product.returnable && (
                <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                  Returnable
                </span>
              )}
              {product.isDamaged && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-sm font-medium">
                  Damaged
                </span>
              )}
              {product.isIncomplete && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm font-medium">
                  Incomplete
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                disabled={product.stock === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Add to Cart
              </button>
              <button
                disabled={product.stock === 0}
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Buy Now
              </button>
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Overview
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {product.shortDescription}
                </p>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Specifications
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <dl className="space-y-2">
                    {Object.entries(product.specifications).map(
                      ([key, value]: [string, any]) => (
                        <div
                          key={key}
                          className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                        >
                          <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {key}
                          </dt>
                          <dd className="text-sm text-gray-900 dark:text-white">
                            {value}
                          </dd>
                        </div>
                      ),
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full Description */}
        {product.description && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Product Description
            </h2>
            <div className="prose dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          </section>
        )}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Similar Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarProducts.slice(0, 4).map((similarProduct: any) => (
                <ProductCard
                  key={similarProduct.id}
                  id={similarProduct.id}
                  name={similarProduct.name}
                  slug={similarProduct.slug}
                  price={similarProduct.price}
                  originalPrice={similarProduct.originalPrice}
                  image={similarProduct.images?.[0]}
                  images={similarProduct.images}
                  rating={similarProduct.rating}
                  reviewCount={similarProduct.reviewCount}
                  inStock={similarProduct.stock > 0}
                  featured={similarProduct.featured}
                  condition={similarProduct.condition}
                  shopName={similarProduct.shopName}
                  shopSlug={similarProduct.shopSlug}
                  variant="public"
                  LinkComponent={Link as any}
                  ImageComponent={"img" as any}
                  formatPrice={(price) => `₹${price.toLocaleString()}`}
                  formatDiscount={(discount) => `-${discount}%`}
                />
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Customer Reviews ({product.reviewCount || 0})
              </h2>
              <Link
                href={`/reviews?product=${product.slug}`}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-6">
              {reviews.slice(0, 3).map((review: any) => (
                <div
                  key={review.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {review.userName}
                        </span>
                        {review.verifiedPurchase && (
                          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
