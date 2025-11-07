"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, } from "lucide-react";

import UserDropdown from "./User/UserProfileDropdown";


interface HeaderProps {
  title: string;
  backHref: string;
}

export default function Header({ title, backHref }: HeaderProps) {
 

  
  return (
    <header className="bg-cyan-600 shadow-lg">
      <div className="w-full px-4 lg:px-8 py-4">
        <div className="relative flex items-center justify-between">
          {/* Left: Back and Logo */}
          <div className="flex items-center space-x-1 lg:space-x-4">
            <Link
              href={backHref}
              className="flex items-center space-x-1 lg:space-x-3 text-white hover:text-primary-100 transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </Link>
            <div className="h-8 w-px bg-white/30"></div>
            <div className="flex items-center space-x-3">
               <UserDropdown />
              
            </div>
          </div>

          {/* Centered title */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <h1 className="lg:text-xl font-bold text-white">{title}</h1>
          </div>

          {/* Right: logo */}
          <div className="flex p-0">
                <Image
                  src="/logo/mylogo.svg"
                  alt="Trivia Logo"
                  width={50}
                  height={50}
                  className="mx-auto"
                />
              </div>
        </div>
      </div>
    </header>
  );
}
