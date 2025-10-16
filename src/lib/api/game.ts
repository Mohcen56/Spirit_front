import { api, API_BASE_URL } from './base';
import { Category, Game, Question, Collection } from '@/types/game';

export const gameAPI = {
  getCategories: async (): Promise<Category[]> => {
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      
      // Add authorization header if token exists (for user-specific data)
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await api.get('/api/categories/', { headers });
      
      let categoriesData = response.data;
      if (categoriesData && typeof categoriesData === 'object' && 'results' in categoriesData) {
        categoriesData = categoriesData.results;
      }
      
      if (!Array.isArray(categoriesData)) {
        console.warn('Categories data is not an array, returning empty array');
        return [];
      }
      
      return categoriesData;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getCollectionsWithCategories: async (): Promise<Collection[]> => {
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      
      // Add authorization header if token exists (for user-specific data)
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await api.get('/api/content/collections/with_categories/', { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching collections with categories:', error);
      throw error;
    }
  },
  
  startGame: async (categories: number[], teams: Array<{name: string, avatar: string}>, mode: 'offline' | 'online' = 'offline'): Promise<Game> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/gameplay/games/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category_ids: categories,
          teams: teams,
          mode: mode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const gameData = await response.json();
      return gameData;
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  },

  getGames: async (): Promise<Game[]> => {
    try {
      const response = await api.get('/api/gameplay/games/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  },

  getGame: async (gameId: number): Promise<Game> => {
    try {
      if (isNaN(gameId) || !isFinite(gameId) || gameId <= 0) {
        throw new Error(`Invalid game ID: ${gameId}. Must be a positive number.`);
      }
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/gameplay/games/${gameId}/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching game:', error);
      throw error;
    }
  },

  getAvailableQuestions: async (gameId: number): Promise<Question[]> => {
    try {
      const response = await api.get(`/api/gameplay/games/${gameId}/available_questions/`);
      const data = response.data;
      const questions = data?.results || data?.questions || data;
      return Array.isArray(questions) ? questions : [];
    } catch (error) {
      console.error('Error fetching available questions:', error);
      throw error;
    }
  },

  awardQuestion: async (gameId: number, questionId: number, teamId: number | null) => {
    try {
      const response = await api.post(`/api/gameplay/games/${gameId}/award_question/`, {
        question_id: questionId,
        team_id: teamId
      });
      return response.data;
    } catch (error) {
      console.error('Error awarding question:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/api/gameplay/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  
  updateTeamScore: async (gameId: number, teamId: number, scoreChange: number) => {
    try {
      const response = await api.post(`/api/gameplay/teams/${teamId}/update_score/`, {
        score_change: scoreChange
      });
      return response.data;
    } catch (error) {
      console.error('Error updating team score:', error);
      throw error;
    }
  },

  selectQuestion: async (questionId: number): Promise<Question> => {
    const response = await api.get(`/api/content/questions/${questionId}/`);
    return response.data;
  },

  // User-created categories
  createUserCategory: async (formData: FormData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      const res = await fetch(`${API_BASE_URL}/api/content/user-categories/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('API validation error:', data);
        throw data;
      }

      return data;
    } catch (error) {
      // Re-throw for upstream handling
      throw error;
    }
  },

  getMyCategories: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await api.get('/api/content/user-categories/my_categories/', {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching my categories:', error);
      throw error;
    }
  },

  getUserCategories: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await api.get('/api/content/user-categories/', { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching user categories:', error);
      throw error;
    }
  },

  addQuestionsToCategory: async (categoryId: number, formData: FormData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      const res = await fetch(`${API_BASE_URL}/api/content/user-categories/${categoryId}/add_questions/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('API validation error:', data);
        throw data;
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  createCategory: async (formData: FormData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      const res = await fetch(`${API_BASE_URL}/api/content/user-categories/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('API validation error:', data);
        throw data;
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  addCategoryToCollection: async (categoryId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      const res = await fetch(`${API_BASE_URL}/api/content/user-categories/${categoryId}/add_to_collection/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('API error:', data);
        throw data;
      }

      return data;
    } catch (error) {
      throw error;
    }
  },
};