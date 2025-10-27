"use client";

import { useEffect, useState } from "react";

interface Membership {
  is_premium: boolean;
  user?: { id: number };
}

export function useMembership() {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const storedMembership = localStorage.getItem("membership");
        if (storedMembership) {
          const membershipData = JSON.parse(storedMembership);
          setMembership(membershipData);
          if (membershipData.user?.id) {
            setCurrentUserId(membershipData.user.id);
          }
        }
      }
    } catch {
      setError("An error occurred while loading membership data");
    }
  }, []);

  return { membership, currentUserId, error , setError };
}
