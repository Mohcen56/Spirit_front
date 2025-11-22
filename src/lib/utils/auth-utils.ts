/**
 * Centralized authentication utilities
 * Reduces redundant localStorage access across the application
 */

import type { User, Membership } from '@/types/game';

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

export const getMembership = (): Membership | null => {
  if (typeof window === 'undefined') return null;
  const membershipData = localStorage.getItem('membership');
  return membershipData ? JSON.parse(membershipData) : null;
};

export const setMembership = (membership: Membership): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('membership', JSON.stringify(membership));
};

export const removeMembership = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('membership');
};

export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  removeAuthToken();
  removeCurrentUser();
  removeMembership();
};
