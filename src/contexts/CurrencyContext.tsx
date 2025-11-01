"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  convertPrice: (price: number) => number;
  formatPrice: (price: number) => string;
  exchangeRates: Record<string, number>;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

const SUPPORTED_CURRENCIES = ["INR", "USD", "EUR", "GBP"];

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState("INR");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load currency preference from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem("preferred_currency");
    if (savedCurrency && SUPPORTED_CURRENCIES.includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  // Fetch exchange rates from API (you can replace with your preferred API)
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        // Example: https://api.exchangerate-api.com/v4/latest/INR
        // For now, using static rates
        const rates = {
          INR: 1,
          USD: 0.012,
          EUR: 0.011,
          GBP: 0.0095,
        };
        setExchangeRates(rates);
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
        // Keep using default rates
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch rates on mount and every 24 hours
    fetchExchangeRates();
    const interval = setInterval(fetchExchangeRates, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const setCurrency = (newCurrency: string) => {
    if (SUPPORTED_CURRENCIES.includes(newCurrency)) {
      setCurrencyState(newCurrency);
      localStorage.setItem("preferred_currency", newCurrency);
    }
  };

  const convertPrice = (price: number): number => {
    if (!price || isNaN(price)) return 0;
    const rate = exchangeRates[currency] || 1;
    const converted = price * rate;
    // Round to nearest higher value
    return Math.ceil(converted);
  };

  const formatPrice = (price: number): string => {
    const converted = convertPrice(price);

    try {
      const formatter = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      return formatter.format(converted);
    } catch (error) {
      // Fallback if currency is not supported
      return `${currency} ${converted.toLocaleString()}`;
    }
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    convertPrice,
    formatPrice,
    exchangeRates,
    isLoading,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
};
