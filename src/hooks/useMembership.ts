"use client";

import { useEffect, useState } from "react";
import { authAPI } from "@/lib/api/auth";
import { getCurrentUser as getUserFromStorage } from "@/lib/utils/auth-utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials, markLoaded } from "@/store/authSlice";

interface MembershipLike {
  is_premium: boolean;
  user?: { id: number };
  expiry_date?: string | null;
}

export function useMembership() {
  const dispatch = useAppDispatch();
  const { user: reduxUser, isLoaded } = useAppSelector((state) => state.auth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip if already loaded AND we have user data
    if (isLoaded && reduxUser) return;

    const bootstrap = async () => {
      try {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("authToken");

        // Try to fetch fresh user when authenticated
        if (token) {
          try {
            const profile = await authAPI.getProfile();
            const user = profile.user;
            if (user) {
              dispatch(setCredentials({ token, user }));
              // For backward compatibility, keep updating localStorage key (can be removed later)
              const ml: MembershipLike = {
                is_premium: !!user.is_premium,
                user: user.id ? { id: user.id } : undefined,
                expiry_date: (user as any).premium_expiry ?? null,
              };
              localStorage.setItem("membership", JSON.stringify(ml));
              return;
            }
          } catch {
            // fall through to localStorage
          }
        }

        // Fallback: derive from stored user
        const storedUser = getUserFromStorage();
        if (storedUser) {
          dispatch(setCredentials({ token, user: storedUser }));
          return;
        }
        
        // No user found - mark as loaded anyway
        dispatch(markLoaded());
      } catch {
        setError("An error occurred while loading membership data");
        dispatch(markLoaded());
      }
    };

    bootstrap();

    // Stay in sync with localStorage updates from other parts of the app
    const onStorage = (e: StorageEvent) => {
      if (e.key === "user" && e.newValue) {
        try {
          const user = JSON.parse(e.newValue);
          const token = localStorage.getItem("authToken");
          dispatch(setCredentials({ token, user }));
        } catch {}
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [dispatch, isLoaded, reduxUser]);

  // Helper to validate premium status with expiry check
  const computeIsPremium = (user: { is_premium?: boolean; premium_expiry?: string | null } | null): boolean => {
    const flag = !!user?.is_premium;
    const expiry: string | null | undefined = user?.premium_expiry ?? null;
    if (!flag) return false;
    // If premium flag is set but no expiry, trust backend (lifetime/perpetual premium)
    if (!expiry) return true;
    // If expiry exists, validate it's a future date
    try {
      const exp = new Date(expiry);
      return !isNaN(exp.getTime()) && exp.getTime() > Date.now();
    } catch {
      return false;
    }
  };

  // Derive membership from redux user with expiry validation
  const membership: MembershipLike | null = reduxUser ? {
    is_premium: computeIsPremium(reduxUser),
    user: reduxUser.id ? { id: reduxUser.id } : undefined,
    expiry_date: (reduxUser as { premium_expiry?: string | null }).premium_expiry ?? null,
  } : null;

  const currentUserId = reduxUser?.id ?? null;

  return { membership, currentUserId, error, setError, isLoaded };
}
