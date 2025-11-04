/**
 * API-based Categories Hook
 * Provides category data through API service calls
 */

import { useState, useEffect } from "react";
import { CategoryService, Category } from "@/lib/api";

export function useApiCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await CategoryService.getCategories();
        setCategories(data);
      } catch (err: any) {
        console.error("API categories error:", err);
        setError(err.message || "Failed to load categories");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

export function useApiCategory(categoryId: string | null) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) {
      setLoading(false);
      setCategory(null);
      return;
    }

    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await CategoryService.getCategory(categoryId);
        setCategory(data);
      } catch (err: any) {
        console.error("API category error:", err);
        setError(err.message || "Failed to load category");
        setCategory(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  return { category, loading, error };
}
