"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { HeaderContext } from "@/contexts/HeaderContext";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const [headerData, setHeaderData] = useState({ title: "", backHref: "/" });

  return (
    <HeaderContext.Provider value={{ ...headerData, setHeader: setHeaderData }}>
      <Header title={headerData.title} backHref={headerData.backHref} />
      <main>{children}</main>
    </HeaderContext.Provider>
  );
}
