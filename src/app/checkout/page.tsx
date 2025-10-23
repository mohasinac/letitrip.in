"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Shipping
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    // Payment
    paymentMethod: "card",
    saveInfo: false,
  });

  const cartItems = [
    {
      id: "1",
      name: "Premium Beyblade Stadium Pro",
      price: 2999,
      quantity: 1,
    },
    {
      id: "2",
      name: "Metal Fusion Beyblade Set",
      price: 1499,
      quantity: 2,
    },
  ];

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 1000 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePlaceOrder = async () => {
    // Process order
    console.log("Placing order...", formData);
    // Redirect to success page
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="container py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center max-w-md mx-auto">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        step > stepNumber ? "bg-primary" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-2 max-w-md mx-auto px-4">
              <span>Shipping</span>
              <span>Payment</span>
              <span>Review</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="card p-6">
                {/* Step 1: Shipping */}
                {step === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">
                      Shipping Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          className="input w-full"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          className="input w-full"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="input w-full"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          className="input w-full"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">
                          Address *
                        </label>
                        <input
                          type="text"
                          name="address"
                          className="input w-full"
                          placeholder="Street address, apartment, suite, etc."
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          className="input w-full"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          className="input w-full"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          PIN Code *
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          className="input w-full"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Country
                        </label>
                        <select
                          name="country"
                          className="input w-full"
                          value={formData.country}
                          onChange={handleInputChange}
                        >
                          <option value="India">India</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Payment */}
                {step === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={formData.paymentMethod === "card"}
                            onChange={handleInputChange}
                            className="mr-3"
                          />
                          <div className="flex items-center">
                            <span className="font-medium">
                              Credit/Debit Card
                            </span>
                            <div className="ml-4 flex gap-2">
                              <img
                                src="/icons/visa.svg"
                                alt="Visa"
                                className="h-6"
                              />
                              <img
                                src="/icons/mastercard.svg"
                                alt="Mastercard"
                                className="h-6"
                              />
                              <img
                                src="/icons/rupay.svg"
                                alt="RuPay"
                                className="h-6"
                              />
                            </div>
                          </div>
                        </label>
                      </div>

                      <div className="border rounded-lg p-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="upi"
                            checked={formData.paymentMethod === "upi"}
                            onChange={handleInputChange}
                            className="mr-3"
                          />
                          <div className="flex items-center">
                            <span className="font-medium">UPI</span>
                            <div className="ml-4 flex gap-2">
                              <img
                                src="/icons/upi.svg"
                                alt="UPI"
                                className="h-6"
                              />
                              <img
                                src="/icons/paytm.svg"
                                alt="Paytm"
                                className="h-6"
                              />
                              <img
                                src="/icons/phonepe.svg"
                                alt="PhonePe"
                                className="h-6"
                              />
                            </div>
                          </div>
                        </label>
                      </div>

                      <div className="border rounded-lg p-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="netbanking"
                            checked={formData.paymentMethod === "netbanking"}
                            onChange={handleInputChange}
                            className="mr-3"
                          />
                          <span className="font-medium">Net Banking</span>
                        </label>
                      </div>

                      <div className="border rounded-lg p-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={formData.paymentMethod === "cod"}
                            onChange={handleInputChange}
                            className="mr-3"
                          />
                          <span className="font-medium">Cash on Delivery</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            (₹50 extra charge)
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="saveInfo"
                          checked={formData.saveInfo}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span className="text-sm">
                          Save this information for next time
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Review Order</h2>

                    {/* Shipping Info */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">Shipping Address</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium">
                          {formData.firstName} {formData.lastName}
                        </p>
                        <p>{formData.address}</p>
                        <p>
                          {formData.city}, {formData.state} {formData.pincode}
                        </p>
                        <p>{formData.phone}</p>
                        <p>{formData.email}</p>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">Payment Method</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="capitalize">
                          {formData.paymentMethod.replace(/([A-Z])/g, " $1")}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">Order Items</h3>
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium">
                              ₹
                              {(item.price * item.quantity).toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  {step > 1 && (
                    <button
                      onClick={handlePrevStep}
                      className="btn btn-outline"
                    >
                      Previous
                    </button>
                  )}
                  {step < 3 ? (
                    <button
                      onClick={handleNextStep}
                      className="btn btn-primary ml-auto"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      onClick={handlePlaceOrder}
                      className="btn btn-primary ml-auto"
                    >
                      Place Order
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-20">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mb-6 pb-6 border-b">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (GST 18%)</span>
                    <span>₹{tax.toLocaleString("en-IN")}</span>
                  </div>
                  {formData.paymentMethod === "cod" && (
                    <div className="flex justify-between">
                      <span>COD Charges</span>
                      <span>₹50</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>
                    ₹
                    {(
                      total + (formData.paymentMethod === "cod" ? 50 : 0)
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
