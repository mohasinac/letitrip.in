"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Category, CategoryFormData } from "@/types";
import { categoriesService } from "@/lib/api/services/categories";

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

type CategoriesAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CATEGORIES"; payload: Category[] }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: { id: string; category: Category } }
  | { type: "DELETE_CATEGORY"; payload: string }
  | {
      type: "TOGGLE_CATEGORY_STATUS";
      payload: { id: string; isActive: boolean };
    };

interface CategoriesContextType extends CategoriesState {
  refreshCategories: () => Promise<void>;
  createCategory: (data: CategoryFormData) => Promise<Category>;
  updateCategory: (id: string, data: CategoryFormData) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  toggleCategoryStatus: (
    id: string,
    currentStatus: boolean
  ) => Promise<boolean>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(
  undefined
);

const categoriesReducer = (
  state: CategoriesState,
  action: CategoriesAction
): CategoriesState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_CATEGORIES":
      return {
        ...state,
        categories: action.payload,
        loading: false,
        error: null,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [...state.categories, action.payload].sort(
          (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
        ),
        loading: false,
        error: null,
      };
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories
          .map((cat) =>
            cat.id === action.payload.id ? action.payload.category : cat
          )
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
        loading: false,
        error: null,
      };
    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((cat) => cat.id !== action.payload),
        loading: false,
        error: null,
      };
    case "TOGGLE_CATEGORY_STATUS":
      return {
        ...state,
        categories: state.categories.map((cat) =>
          cat.id === action.payload.id
            ? {
                ...cat,
                isActive: action.payload.isActive,
                updatedAt: new Date().toISOString(),
              }
            : cat
        ),
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

export function CategoriesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(categoriesReducer, {
    categories: [],
    loading: true,
    error: null,
  });

  // Load initial categories
  const refreshCategories = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Get categories from Firebase
      const categoriesData = await categoriesService.getCategories();

      dispatch({ type: "SET_CATEGORIES", payload: categoriesData.categories });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to load categories",
      });
    }
  };

  // Create category
  const createCategory = async (data: CategoryFormData): Promise<Category> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newCategory: Category = {
        id: `cat_${Date.now()}`,
        ...data,
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: data.sortOrder || 0,
      };

      dispatch({ type: "ADD_CATEGORY", payload: newCategory });
      return newCategory;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create category";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Update category
  const updateCategory = async (
    id: string,
    data: CategoryFormData
  ): Promise<Category> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const existingCategory = state.categories.find((cat) => cat.id === id);
      const updatedCategory: Category = {
        ...existingCategory,
        id,
        ...data,
        updatedAt: new Date().toISOString(),
        order: data.sortOrder || 0,
      } as Category;

      dispatch({
        type: "UPDATE_CATEGORY",
        payload: { id, category: updatedCategory },
      });
      return updatedCategory;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update category";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Delete category
  const deleteCategory = async (id: string): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      dispatch({ type: "DELETE_CATEGORY", payload: id });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete category";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Toggle category status
  const toggleCategoryStatus = async (
    id: string,
    currentStatus: boolean
  ): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      const newStatus = !currentStatus;
      dispatch({
        type: "TOGGLE_CATEGORY_STATUS",
        payload: { id, isActive: newStatus },
      });
      return newStatus;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to toggle category status";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Load categories on mount
  useEffect(() => {
    refreshCategories();
  }, []);

  const value: CategoriesContextType = {
    ...state,
    refreshCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useGlobalCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error(
      "useGlobalCategories must be used within a CategoriesProvider"
    );
  }
  return context;
}
