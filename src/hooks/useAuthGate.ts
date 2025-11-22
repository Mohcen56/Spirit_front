import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api/auth';
import type { User } from '@/types/game';
import { logger } from '@/lib/utils/logger';

export function useAuthGate({ redirectIfGuest }: { redirectIfGuest?: string } = {}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('authToken');

      // 🔹 Short-circuit safely (don't call API if no token)
      if (!token) {
        logger.log('No token, skipping getCurrentUser');
        setLoading(false); // ✅ stop loading
        if (redirectIfGuest) router.replace(redirectIfGuest);
        return;
      }

      try {
        const current = await authAPI.getCurrentUser();
        setUser(current);
      } catch {
        if (redirectIfGuest) router.replace(redirectIfGuest);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, redirectIfGuest]);

  const logout = async () => {
    await authAPI.logout();
    router.replace('/login');
  };

  return { user, setUser, isLoading, logout };
}
