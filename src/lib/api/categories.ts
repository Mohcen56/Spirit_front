import { api } from './base';
import { Category, Collection } from '@/types/game';
import { normalizeApiResponse } from '@/lib/utils/utils';

/**
 * Category API - Official and user-created categories
 */
export const categoriesAPI = {
  /**
   * Get all category data including collections, saved categories, and fallback categories
   */
  getAllCategoryData: async (): Promise<{
    collections: Collection[];
    saved_categories: Category[];
    fallback_categories: Category[];
  }> => {
    try {
      const response = await api.get('/api/content/collections/all_data/');

      // Validate the shape
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response from /all_data/');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching all category data:', error);
      throw error;
    }
  },

  /**
   * Get all official categories
   */
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get('/api/content/categories/');
      return normalizeApiResponse<Category>(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Get all collections with their associated categories
   */
  getCollectionsWithCategories: async (): Promise<Collection[]> => {
    try {
      const response = await api.get('/api/content/collections/with_categories/');
      return response.data;
    } catch (error) {
      console.error('Error fetching collections with categories:', error);
      throw error;
    }
  },
};
