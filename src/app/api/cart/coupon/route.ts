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

    // Validate coupon
    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const endDate = new Date(coupon.end_date);

    if (coupon.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Coupon is not active" },
        { status: 400 },
      );
    }

    if (now < startDate) {
      return NextResponse.json(
        { success: false, error: "Coupon not yet valid" },
        { status: 400 },
      );
    }

    if (now > endDate) {
      return NextResponse.json(
        { success: false, error: "Coupon has expired" },
        { status: 400 },
      );
    }

    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
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

    // Check minimum purchase amount
    if (coupon.min_purchase_amount && subtotal < coupon.min_purchase_amount) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum purchase amount is ₹${coupon.min_purchase_amount}`,
        },
        { status: 400 },
      );
    }

    // Calculate discount based on coupon type
    let discount = 0;
    const discountValue = coupon.discount_value || 0;

    switch (coupon.type) {
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
