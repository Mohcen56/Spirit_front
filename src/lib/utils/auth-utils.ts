/**
 * Centralized authentication utilities
 * Reduces redundant localStorage access across the application
 */

import type { User } from '@/types/game';

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

export const setCurrentUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeCurrentUser = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
};

// Membership storage removed; user now carries premium fields.
export const removeMembership = (): void => {
  if (typeof window === 'undefined') return;
  // Cleanup legacy key if present
  localStorage.removeItem('membership');
};

export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  removeAuthToken();
  removeCurrentUser();
  removeMembership();
};
