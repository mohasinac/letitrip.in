import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../lib/session";

// POST /api/cart/coupon - Apply coupon to cart
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 },
      );
    }

    // Get cart items
    const cartSnapshot = await Collections.cart()
      .where("user_id", "==", user.id)
      .get();

    // Check if cart is empty
    if (cartSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 },
      );
    }

    // Get coupon
    const couponSnapshot = await Collections.coupons()
      .where("code", "==", code.toUpperCase())
      .limit(1)
      .get();

    if (couponSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Invalid coupon code" },
        { status: 404 },
      );
    }

    const couponDoc = couponSnapshot.docs[0];
    const coupon = couponDoc.data();

    // Validate coupon - support both snake_case (DB) and test formats
    const now = new Date();
    const validFrom = coupon.valid_from || coupon.start_date;
    const validUntil = coupon.valid_until || coupon.end_date;
    const isActive = coupon.is_active ?? coupon.status === "active";
    const usageLimit = coupon.usage_limit;
    const timesUsed = coupon.times_used ?? coupon.usage_count ?? 0;
    const minOrderValue =
      coupon.min_order_value ?? coupon.min_purchase_amount ?? 0;

    // Check if active
    if (!isActive) {
      return NextResponse.json(
        { success: false, error: "Coupon is not active" },
        { status: 400 },
      );
    }

    // Check if coupon is not yet valid
    if (validFrom) {
      const startDate = new Date(validFrom);
      if (now < startDate) {
        return NextResponse.json(
          { success: false, error: "Coupon not yet valid" },
          { status: 400 },
        );
      }
    }

    // Check expiry
    if (validUntil) {
      const expiryDate = new Date(validUntil);
      if (now > expiryDate) {
        return NextResponse.json(
          { success: false, error: "Coupon has expired" },
          { status: 400 },
        );
      }
    }

    // Check usage limit
    if (usageLimit && timesUsed >= usageLimit) {
      return NextResponse.json(
        { success: false, error: "Coupon usage limit reached" },
        { status: 400 },
      );
    }

    // Calculate cart total and apply coupon
    const items = await Promise.all(
      cartSnapshot.docs.map(async (doc: any) => {
        const data = doc.data();
        const productDoc = await Collections.products()
          .doc(data.product_id)
          .get();
        const product = productDoc.data();

        return {
          id: doc.id,
          productId: data.product_id,
          categoryId: product?.category_id || "",
          quantity: data.quantity,
          price: product?.price || 0,
        };
      }),
    );

    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );

    // Check if cart is empty
    if (items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cart must have items to apply coupon (minimum requirement not met)",
        },
        { status: 400 },
      );
    }

    // Check minimum purchase amount - support both formats
    if (minOrderValue && subtotal < minOrderValue) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum purchase amount is ₹${minOrderValue}`,
        },
        { status: 400 },
      );
    }

    // Calculate discount based on coupon type - support both formats
    let discount = 0;
    const discountType = coupon.discount_type || coupon.type;
    const discountValue = coupon.discount_value || 0;

    switch (discountType) {
      case "percentage":
        discount = (subtotal * discountValue) / 100;
        if (
          coupon.max_discount_amount &&
          discount > coupon.max_discount_amount
        ) {
          discount = coupon.max_discount_amount;
        }
        break;

      case "flat":
      case "fixed":
        discount = discountValue;
        if (discount > subtotal) {
          discount = subtotal;
        }
        break;

      case "free-shipping":
        // Handled separately in cart summary
        discount = 0;
        break;

      default:
        discount = 0;
    }

    // Calculate final totals
    const shipping =
      coupon.type === "free-shipping" ? 0 : subtotal > 5000 ? 0 : 100;
    const tax = (subtotal - discount) * 0.18;
    const total = subtotal + shipping + tax - discount;

    return NextResponse.json({
      success: true,
      data: {
        couponCode: code.toUpperCase(),
        couponId: couponDoc.id,
        discount,
        subtotal,
        shipping,
        tax,
        total,
      },
      message: "Coupon applied successfully",
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to apply coupon" },
      { status: 500 },
    );
  }
}

// DELETE /api/cart/coupon - Remove coupon from cart
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Get cart items for recalculation
    const cartSnapshot = await Collections.cart()
      .where("user_id", "==", user.id)
      .get();

    const items = await Promise.all(
      cartSnapshot.docs.map(async (doc: any) => {
        const data = doc.data();
        const productDoc = await Collections.products()
          .doc(data.product_id)
          .get();
        const product = productDoc.data();

        return {
          price: product?.price || 0,
          quantity: data.quantity,
        };
      }),
    );

    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );
    const shipping = subtotal > 5000 ? 0 : 100;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax;

    return NextResponse.json({
      success: true,
      data: {
        subtotal,
        shipping,
        tax,
        discount: 0,
        total,
      },
      message: "Coupon removed",
    });
  } catch (error) {
    console.error("Error removing coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove coupon" },
      { status: 500 },
    );
  }
}
