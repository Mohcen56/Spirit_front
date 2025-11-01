import { api } from './base';
import { Category } from '@/types/game';
import { normalizeApiResponse } from '@/lib/utils/utils';

/**
 * User Categories API - User-created custom categories
 */
export const userCategoriesAPI = {
  /**
   * Create a new user category with optional questions
   */
  createUserCategory: async (formData: FormData) => {
    try {
      const response = await api.post('/api/content/user-categories/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all categories created by the current user
   */
  getMyCategories: async () => {
    try {
      const response = await api.get('/api/content/user-categories/my_categories/');
      return response.data;
    } catch (error) {
      console.error('Error fetching my categories:', error);
      throw error;
    }
  },

  /**
   * Get all user-created categories (public + user's own)
   */
  getUserCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get('/api/content/user-categories/');
      return normalizeApiResponse<Category>(response.data);
    } catch (error) {
      console.error('Error fetching user categories:', error);
      throw error;
    }
  },

  /**
   * Get a single user category by ID (for editing)
   */
  getUserCategory: async (categoryId: number | string) => {
    try {
      const response = await api.get(`/api/content/user-categories/${categoryId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user category:', error);
      throw error;
    }
  },

  /**
   * Update an existing user category (PATCH)
   */
  updateUserCategory: async (categoryId: number | string, formData: FormData) => {
    try {
      const response = await api.patch(`/api/content/user-categories/${categoryId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a user category
   */
  deleteUserCategory: async (categoryId: number | string) => {
    try {
      await api.delete(`/api/content/user-categories/${categoryId}/`);
      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add questions to an existing user category
   */
  addQuestionsToCategory: async (categoryId: number, formData: FormData) => {
    try {
      const response = await api.post(`/api/content/user-categories/${categoryId}/add_questions/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Save a category to user's collection
   */
  saveCategory: async (categoryId: number) => {
    try {
      const response = await api.post(`/api/content/user-categories/${categoryId}/add_to_collection/`, {});
      return response.data;
    } catch (error) {
      console.error('Error saving category:', error);
      throw error;
    }
  },

  /**
   * Remove a category from user's collection
   */
  unsaveCategory: async (categoryId: number) => {
    try {
      const response = await api.post(`/api/content/user-categories/${categoryId}/remove_from_collection/`, {});
      return response.data;
    } catch (error) {
      console.error('Error unsaving category:', error);
      throw error;
    }
  },

  /**
   * Get all categories saved by the current user
   */
  getMySavedCategories: async () => {
    try {
      const response = await api.get('/api/content/user-categories/my_saved_categories/');
      return response.data;
    } catch (error) {
      console.error('Error fetching saved categories:', error);
      throw error;
    }
  },

  /**
   * Add a category to user's collection (alias for saveCategory)
   */
  addCategoryToCollection: async (categoryId: number) => {
    try {
      const response = await api.post(`/api/content/user-categories/${categoryId}/add_to_collection/`, {});
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new category (alias for createUserCategory)
   */
  createCategory: async (formData: FormData) => {
    try {
      const response = await api.post('/api/content/user-categories/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
