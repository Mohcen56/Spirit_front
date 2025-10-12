export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
}

export interface Membership {
  id: number;
  user: User;
  is_premium: boolean;
  expiry_date?: string;
}

export interface Category {
  id: number;
  name: string;
  locked: boolean;
  is_premium: boolean;
  description?: string;
  image?: string;
  collection_id?: number;
  total_questions?: number;
  user_played_questions?: number; // Number of questions played by the current user
}

export interface Collection {
  id: number;
  name: string;
  order: number;
  categories: Category[];
  categories_count?: number;
}

export interface Question {
  id: number;
  category: Category;
  text: string;
  text_ar?: string;
  answer: string;
  answer_ar?: string;
  image?: string;
  answer_image?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  played_by_team?: number | null;
}

export interface Team {
  id: number;
  name: string;
  score: number;
  avatar: string;
}

export interface Game {
  id: number;
  player: User;
  mode: string;
  date_played: string;
  categories: Category[];
  teams: Team[];
  played_questions?: PlayedQuestion[];
}

export interface PlayedQuestion {
  id: number;
  game: Game;
  question: Question;
  team: Team;
  correct: boolean;
}

export interface GameState {
  currentGame?: Game;
  currentTeamIndex: number;
  currentQuestion?: Question;
  questionsRemaining: number;
  phase: 'setup' | 'board' | 'question' | 'answer' | 'team-selection' | 'results';
}