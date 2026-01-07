"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { HeaderContext } from "@/contexts/HeaderContext";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import type { User } from "@/types/game";

interface HomeLayoutClientProps {
  children: React.ReactNode;
  user: User | null;
}

export default function HomeLayoutClient({ children, user }: HomeLayoutClientProps) {
  const [headerData, setHeaderData] = useState({ title: "", backHref: "/" });
  const dispatch = useAppDispatch();

  // Sync server-side user to Redux store on mount and when user changes
  useEffect(() => {
    dispatch(setCredentials({ user }));
  }, [dispatch, user]);

  return (
    <HeaderContext.Provider value={{ ...headerData, setHeader: setHeaderData }}>
      <Header title={headerData.title} backHref={headerData.backHref} user={user} />
      <main>{children}</main>
    </HeaderContext.Provider>
  );
}
