import { api } from './base';
import { Question } from '@/types/game';
import { normalizeApiResponse } from '@/lib/utils/utils';

/**
 * Questions API - Question retrieval and management
 */
export const questionsAPI = {
  /**
   * Get available questions for a specific game
   */
  getAvailableQuestions: async (gameId: number): Promise<Question[]> => {
    try {
      const response = await api.get(`/api/gameplay/games/${gameId}/available_questions/`);
      return normalizeApiResponse<Question>(response.data);
    } catch (error) {
      console.error('Error fetching available questions:', error);
      throw error;
    }
  },

  /**
   * Get questions filtered by category ID
   */
  getQuestionsByCategory: async (categoryId: number | string): Promise<Question[]> => {
    try {
      const response = await api.get(`/api/content/questions/?category_id=${categoryId}`);
      return normalizeApiResponse<Question>(response.data);
    } catch (error) {
      console.error('Error fetching questions by category:', error);
      return []; // Return empty array on error instead of throwing
    }
  },

  /**
   * Get a random question from selected categories
   */
  getRandomQuestion: async (categoryIds: number[]) => {
    const query = categoryIds.map((id) => `category_ids=${id}`).join('&');
    const response = await api.get(`/api/content/questions/random/?${query}&count=1`);
    return response.data[0];
  },

  /**
   * Delete a specific question
   */
  deleteQuestion: async (questionId: number) => {
    try {
      await api.delete(`/api/content/questions/${questionId}/`);
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
};
