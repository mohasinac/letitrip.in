import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seller Dashboard - JustForView",
  description: "Manage your products, orders, and grow your business",
};

export default function SellerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
