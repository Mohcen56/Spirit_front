import { api, API_BASE_URL } from './base';
import { Category, Game, Question, Collection } from '@/types/game';

function authHeaders(extra: Record<string, string> = {}) {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  return { ...headers, ...extra };
}

export const gameAPI = {
  getAllCategoryData: async (): Promise<{
  collections: Collection[];
  saved_categories: Category[];
  fallback_categories: Category[];
}> => {
      try {
        const response = await api.get('/api/content/collections/all_data/', {
          headers: authHeaders(),
        });

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
  
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get('/api/content/categories/');
      
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
 
      
      const response = await api.get('/api/content/collections/with_categories/', { headers: authHeaders() });
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

  finishRound: async (gameId: number, playedQuestionIds: number[]) => {
    try {
      const response = await api.post(`/api/gameplay/games/${gameId}/finish_round/`, {
        played_question_ids: playedQuestionIds,
      });
      return response.data;
    } catch (error) {
      console.error('Error finishing round:', error);
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

  saveCategory: async (categoryId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      const response = await api.post(
        `/api/content/user-categories/${categoryId}/add_to_collection/`,
        {},
        {
          headers: {
            'Authorization': `Token ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error saving category:', error);
      throw error;
    }
  },

  unsaveCategory: async (categoryId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      const response = await api.post(
        `/api/content/user-categories/${categoryId}/remove_from_collection/`,
        {},
        {
          headers: {
            'Authorization': `Token ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error unsaving category:', error);
      throw error;
    }
  },

  getMySavedCategories: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return [];
    }

    try {
      const response = await api.get('/api/content/user-categories/my_saved_categories/', {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching saved categories:', error);
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

  // Get single user category (for editing)
  getUserCategory: async (categoryId: number | string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      const response = await api.get(`/api/content/user-categories/${categoryId}/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user category:', error);
      throw error;
    }
  },

  // Update user category (PATCH)
  updateUserCategory: async (categoryId: number | string, formData: FormData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      const res = await fetch(`${API_BASE_URL}/api/content/user-categories/${categoryId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
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

  // Delete user category
  deleteUserCategory: async (categoryId: number | string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      const res = await fetch(`${API_BASE_URL}/api/content/user-categories/${categoryId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error('API error:', data);
        throw data;
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  // Get questions filtered by category ID (reuses existing pattern from selectQuestion)
  getQuestionsByCategory: async (categoryId: number | string): Promise<Question[]> => {
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await api.get(`/api/content/questions/?category_id=${categoryId}`, { headers });
      
      // Handle paginated response or direct array
      let questionsData = response.data;
      if (questionsData && typeof questionsData === 'object' && 'results' in questionsData) {
        questionsData = questionsData.results;
      }
      
      // Ensure we always return an array
      return Array.isArray(questionsData) ? questionsData : [];
    } catch (error) {
      console.error('Error fetching questions by category:', error);
      return []; // Return empty array on error instead of throwing
    }
  },
getRandomQuestion: async (categoryIds: number[]) => {
  const query = categoryIds.map(id => `category_ids=${id}`).join("&");
  const response = await api.get(`/api/content/questions/random/?${query}&count=1`);
  return response.data[0];
},

  // Delete a question
  deleteQuestion: async (questionId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      const res = await fetch(`${API_BASE_URL}/api/content/questions/${questionId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error('API error:', data);
        throw data;
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  },
};
