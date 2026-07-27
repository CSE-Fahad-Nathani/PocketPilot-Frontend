import { create } from "zustand";
import categoryService from "../services/categoryService";

const useCategoryStore = create((set) => ({
  categories: [],
  loading: false,

  getCategories: async (cycleId) => {
    set({ loading: true });

    try {
      const response = await categoryService.getCategories(cycleId);

      if (response.success) {
        set({
          categories: response.data,
          loading: false,
        });
      } else {
        set({ loading: false });
      }

      return response;
    } catch (error) {
      set({ loading: false });

      return {
        success: false,
        message: error.message,
      };
    }
  },

  createCategory: async (data) => {
    set({ loading: true });

    try {
      const response = await categoryService.createCategory(data);

      if (response.success) {
        set((state) => ({
          categories: [...state.categories, response.data],
          loading: false,
        }));
      } else {
        set({ loading: false });
      }

      return response;
    } catch (error) {
      set({ loading: false });

      return {
        success: false,
        message: error.message,
      };
    }
  },

  updateCategory: async (data) => {
    set({ loading: true });

    try {
      const response = await categoryService.updateCategory(data);

      if (response.success) {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === response.data.id ? response.data : category
          ),
          loading: false,
        }));
      } else {
        set({ loading: false });
      }

      return response;
    } catch (error) {
      set({ loading: false });

      return {
        success: false,
        message: error.message,
      };
    }
  },

  archiveCategory: async (id) => {
    set({ loading: true });

    try {
      const response = await categoryService.archiveCategory(id);

      if (response.success) {
        set((state) => ({
          categories: state.categories.filter(
            (category) => category.id !== id
          ),
          loading: false,
        }));
      } else {
        set({ loading: false });
      }

      return response;
    } catch (error) {
      set({ loading: false });

      return {
        success: false,
        message: error.message,
      };
    }
  },
}));

export default useCategoryStore;