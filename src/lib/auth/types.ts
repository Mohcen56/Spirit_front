// Shared types for authentication
// This file is safe to import in both client and server components

export interface ServerUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar: string;  // Required to match User type from game.ts
  is_premium?: boolean;
  premium_expiry?: string | null;
}

export interface AuthSession {
  user: ServerUser;
  isAuthenticated: true;
  isPremium: boolean;
}

export interface NoAuthSession {
  user: null;
  isAuthenticated: false;
  isPremium: false;
}

export type Session = AuthSession | NoAuthSession;

export interface LoginResult {
  success: boolean;
  error?: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface RegisterResult {
  success: boolean;
  error?: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}
