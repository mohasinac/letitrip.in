"use client";

import Link from "next/link";
import { CONTACT_INFO } from "@/constants/homepage";

export default function ContactSection() {
  return (
    <section className="py-24 bg-gray-900 text-white shadow-inner">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 drop-shadow-lg">
            Get In Touch
          </h2>
          <p className="text-2xl font-bold max-w-3xl mx-auto drop-shadow-md">
            Have questions? We're here to help you find exactly what you need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="text-center bg-white rounded-2xl p-8 border-4 border-theme-primary hover-glow-theme-strong transition-all duration-300 transform hover:scale-105 shadow-xl">
            <div className="w-20 h-20 bg-theme-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <h3 className="font-bold mb-3 text-xl drop-shadow-sm text-gray-900">
              Phone
            </h3>
            <p className="font-semibold text-lg drop-shadow-sm text-gray-700">
              {CONTACT_INFO.phone}
            </p>
          </div>

          <div className="text-center bg-white rounded-2xl p-8 border-4 border-theme-primary hover-glow-theme-strong transition-all duration-300 transform hover:scale-105 shadow-xl">
            <div className="w-20 h-20 bg-theme-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-bold mb-3 text-xl drop-shadow-sm text-gray-900">
              Email
            </h3>
            <p className="font-semibold text-lg drop-shadow-sm text-gray-700">
              {CONTACT_INFO.email}
            </p>
          </div>

          <div className="text-center bg-white rounded-2xl p-8 border-4 border-theme-primary hover-glow-theme-strong transition-all duration-300 transform hover:scale-105 shadow-xl">
            <div className="w-20 h-20 bg-theme-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="font-bold mb-3 text-xl drop-shadow-sm text-gray-900">
              Address
            </h3>
            <p className="font-semibold text-base drop-shadow-sm text-gray-700">
              {CONTACT_INFO.address.street}
              <br />
              {CONTACT_INFO.address.city}, {CONTACT_INFO.address.state}{" "}
              {CONTACT_INFO.address.zip}
              <br />
              {CONTACT_INFO.address.country}
            </p>
          </div>

          <div className="text-center bg-white rounded-2xl p-8 border-4 border-theme-primary hover-glow-theme-strong transition-all duration-300 transform hover:scale-105 shadow-xl">
            <div className="w-20 h-20 bg-theme-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-bold mb-3 text-xl drop-shadow-sm text-gray-900">
              Business Hours
            </h3>
            <p className="font-semibold text-base drop-shadow-sm text-gray-700">
              {CONTACT_INFO.businessHours.weekdays}
              <br />
              {CONTACT_INFO.businessHours.weekends}
            </p>
          </div>
        </div>

        <div className="text-center mt-16">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-theme-primary rounded-xl hover:bg-theme-secondary transition-all duration-300 shadow-2xl hover:shadow-3xl hover-glow-theme-strong border-4 border-theme-primary"
          >
            Contact Us Today
            <svg
              className="w-6 h-6 ml-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
