"use client";

import { useState } from "react";
import {
  UnifiedCard,
  CardContent,
  PrimaryButton,
  UnifiedInput,
  UnifiedTextarea,
  UnifiedSelect,
} from "@/components/ui/unified";
import { CheckCircle, MapPin, Phone, Mail, Clock } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import toast from "react-hot-toast";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Contact",
      href: "/contact",
      active: true,
    },
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Submit to contact API
      await apiClient.post("/contact", formData);

      setSent(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      toast.success("Message sent successfully!");
    } catch (error: any) {
      console.error("Contact form error:", error);
      toast.error(error.message || "Failed to send message. Please try again.");
    }

    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8">
        <div className="container max-w-2xl px-4">
          <UnifiedCard className="rounded-xl">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-semibold mb-3">Message Sent!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for contacting us. We'll get back to you within 24
                hours.
              </p>
              <PrimaryButton
                size="lg"
                onClick={() => setSent(false)}
                className="px-8"
              >
                Send Another Message
              </PrimaryButton>
            </CardContent>
          </UnifiedCard>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary/80 py-12 md:py-16 text-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Get in Touch
            </h1>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <UnifiedCard className="rounded-xl">
              <CardContent className="p-6">
                <h2 className="text-3xl font-semibold mb-6">
                  Send us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UnifiedInput
                      label="Full Name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                    <UnifiedInput
                      label="Email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <UnifiedSelect
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Support</option>
                    <option value="product">Product Question</option>
                    <option value="auction">Auction Inquiry</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                  </UnifiedSelect>

                  <UnifiedTextarea
                    label="Message"
                    name="message"
                    required
                    rows={6}
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={handleChange}
                  />

                  <PrimaryButton
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </PrimaryButton>
                </form>
              </CardContent>
            </UnifiedCard>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-semibold mb-6">
                Contact Information
              </h2>

              <div className="space-y-4 mt-6">
                {/* Address */}
                <UnifiedCard className="rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          Our Office
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          123 Business Park, 2nd Floor
                          <br />
                          Andheri East, Mumbai - 400069
                          <br />
                          Maharashtra, India
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </UnifiedCard>

                {/* Phone */}
                <UnifiedCard className="rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          Phone Support
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          <a
                            href="tel:+919876543210"
                            className="text-primary hover:underline"
                          >
                            +91 98765 43210
                          </a>
                          <br />
                          Mon-Sat, 9 AM - 6 PM IST
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </UnifiedCard>

                {/* Email */}
                <UnifiedCard className="rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Email Us</h3>
                        <p className="text-sm text-muted-foreground">
                          <a
                            href="mailto:support@hobbiesspot.com"
                            className="text-primary hover:underline"
                          >
                            support@hobbiesspot.com
                          </a>
                          <br />
                          <a
                            href="mailto:hello@hobbiesspot.com"
                            className="text-primary hover:underline"
                          >
                            hello@hobbiesspot.com
                          </a>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </UnifiedCard>

                {/* Business Hours */}
                <UnifiedCard className="rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div className="w-full">
                        <h3 className="text-lg font-semibold mb-2">
                          Business Hours
                        </h3>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Monday - Friday
                            </span>
                            <span className="text-sm font-medium">
                              9:00 AM - 6:00 PM
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Saturday
                            </span>
                            <span className="text-sm font-medium">
                              10:00 AM - 4:00 PM
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Sunday
                            </span>
                            <span className="text-sm font-medium text-red-500">
                              Closed
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          All times are in Indian Standard Time (IST)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </UnifiedCard>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-4xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {[
              {
                question: "How long does shipping take?",
                answer:
                  "We offer free shipping on orders above ₹1000. Standard delivery takes 3-5 business days, while express delivery takes 1-2 business days.",
              },
              {
                question: "Do you sell authentic products?",
                answer:
                  "Yes, we guarantee 100% authentic products. We work directly with authorized distributors and provide certificates of authenticity where applicable.",
              },
              {
                question: "How do auctions work?",
                answer:
                  "Our live auctions allow you to bid on rare and exclusive items. You can place bids during the auction period, and the highest bidder wins when the auction ends.",
              },
              {
                question: "What is your return policy?",
                answer:
                  "We offer easy returns within 7 days of delivery for unopened items in original condition. For auction items, returns are subject to specific terms mentioned in the auction.",
              },
              {
                question: "How can I track my order?",
                answer:
                  "Once your order ships, you'll receive a tracking number via email and SMS. You can also check your order status in your account dashboard.",
              },
            ].map((faq, index) => (
              <UnifiedCard
                key={index}
                className="rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </UnifiedCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
