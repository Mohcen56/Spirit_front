"use client";

import React, { useEffect } from "react";
import { CreativePricing } from "@/components/ui/creative-pricing";
import type { PricingTier } from "@/components/ui/creative-pricing";
import { Pencil, Star, Sparkles } from "lucide-react"
import { useHeader } from "../layout";

 

const sampleTiers: PricingTier[] = [
  {
    name: "Free",
    icon: <Pencil className="w-6 h-6" />,
    price: 0,
    description: "Try 6 base categories — no cost ",
    color: "amber",
    href: "/dashboard",
    features: [
      "Access 6 base categories",
      "No repeated questions",
      "Create & play your own category",
      
      
    ],
  },
  {
    name: "Pro",
    icon: <Star className="w-6 h-6" />,
    price: 20,
    description: "Ad-free + Weekly new categories",
    color: "blue",
    features: [
      "ads free experience",
      "Unlock 10+ categories",
      "Weekly new category drops",
      "Access all community categories",
    ],
    popular: true,
  },
  {
    name: "Plus",
    icon: <Sparkles className="w-6 h-6" />,
    price: 15,
    description: "A step above Free, but With ads",
    color: "purple",
    features: [
      "Unlock 10+ categories",
      "Weekly new category drops",
      "Access all community categories",
    ],
  },
];

export default function PlansPage() {
    const { setHeader } = useHeader();
    
     useEffect(() => {
    setHeader({ title: "Plans", backHref: "/dashboard" });
  }, [setHeader]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <CreativePricing
        title="Level Up Your Trivia Experience"
        description="Unlock new categories, remove ads, and enjoy premium perks built for true trivia masters."
        tiers={sampleTiers}
      />
    </div>
  );
}


