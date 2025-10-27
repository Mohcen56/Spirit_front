"use client";

import { createContext, useState, useContext } from "react";
import Header from "@/components/Header";

const HeaderContext = createContext({
  title: "",
  backHref: "/",
  setHeader: (data: { title: string; backHref: string }) => {},
});

export function useHeader() {
  return useContext(HeaderContext);
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const [headerData, setHeaderData] = useState({ title: "", backHref: "/" });

  return (
    <HeaderContext.Provider value={{ ...headerData, setHeader: setHeaderData }}>
      <Header title={headerData.title} backHref={headerData.backHref} />
      <main>{children}</main>
    </HeaderContext.Provider>
  );
}
