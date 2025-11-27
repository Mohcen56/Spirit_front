"use client";

import { useEffect, useState } from "react";
import { authAPI } from "@/lib/api/auth";
import { getCurrentUser as getUserFromStorage } from "@/lib/utils/auth-utils";

interface MembershipLike {
  is_premium: boolean;
  user?: { id: number };
  expiry_date?: string | null;
}

export function useMembership() {
  const [membership, setMembership] = useState<MembershipLike | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
              const ml: MembershipLike = {
                is_premium: !!user.is_premium,
                user: user.id ? { id: user.id } : undefined,
                expiry_date: (user as any).premium_expiry ?? null,
              };
              setMembership(ml);
              setCurrentUserId(user.id ?? null);
              // For backward compatibility, keep updating localStorage key (can be removed later)
              localStorage.setItem("membership", JSON.stringify(ml));
              return; // Use fresh data if available
            }
          } catch {
            // fall through to localStorage
          }
        }

        // Fallback: derive from stored user
        const storedUser = getUserFromStorage();
        if (storedUser) {
          const ml: MembershipLike = {
            is_premium: !!storedUser.is_premium,
            user: storedUser.id ? { id: storedUser.id } : undefined,
            expiry_date: (storedUser as any).premium_expiry ?? null,
          };
          setMembership(ml);
          setCurrentUserId(storedUser.id ?? null);
          return;
        }
        // Fallback to legacy localStorage membership if present
        const legacy = localStorage.getItem("membership");
        if (legacy) {
          try {
            const membershipData = JSON.parse(legacy);
            setMembership(membershipData);
            if (membershipData.user?.id) setCurrentUserId(membershipData.user.id);
          } catch {}
        }
      } catch {
        setError("An error occurred while loading membership data");
      }
    };

    bootstrap();

    // Stay in sync with localStorage updates from other parts of the app
    const onStorage = (e: StorageEvent) => {
      if (e.key === "user" && e.newValue) {
        try {
          const user = JSON.parse(e.newValue);
          const ml: MembershipLike = {
            is_premium: !!user.is_premium,
            user: user.id ? { id: user.id } : undefined,
            expiry_date: user.premium_expiry ?? null,
          };
          setMembership(ml);
          if (user.id) setCurrentUserId(user.id);
        } catch {}
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { membership, currentUserId, error, setError };
}
