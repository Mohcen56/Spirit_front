"use client";

import React, { useEffect, useState } from "react";
import { CreativePricing } from "@/components/ui/creative-pricing";
import type { PricingTier } from "@/components/ui/creative-pricing";
import { Pencil, Star } from "lucide-react"
import { useHeader } from "@/contexts/HeaderContext";
import { createCheckout, redirectToCheckout } from "@/lib/payments";
import { useRouter } from "next/navigation";
import { useMembership } from "@/hooks/useMembership";
import { useAuthGate } from "@/hooks/useAuthGate";
import { PremiumDashboard } from "@/components/Premium/PremiumDashboard";

 

const sampleTiers: PricingTier[] = [
  {
    name: "Free",
    icon: <Pencil className="w-6 h-6" />,
    price: 0,
    description: "Try 6 base categories — no cost ",
    color: "blue",
    href: "/dashboard",
    features: [
      "Access 6 base categories",
      "No repeated questions",
      "Create & play your own category",
      
      
    ],
  },
  {
    name: "Lifetime Premium",
    icon: <Star className="w-6 h-6" />,
    price: 40,
    originalPrice: 50,    
    description: "Unlock ALL content now and ALL future updates",
    color: "yellow",
    features: [
      "No ads",
      "All current categories unlocked",
      "All future categories and game updates included",
      "Access all community categories",
      "Early Supporter Badge",
    ],
    popular: true,
  },
  // {
  //   name: "Plus",
  //   icon: <Sparkles className="w-6 h-6" />,
  //   price: 15,
  //   description: "A step above Free, but With ads",
  //   color: "purple",
  //   features: [
  //     "Unlock 10+ categories",
  //     "Weekly new category drops",
  //     "Access all community categories",
  //   ],
  // },
];

export default function PlansPage() {
    const { setHeader } = useHeader();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const { membership } = useMembership();
  const { user } = useAuthGate();
    
     useEffect(() => {
    setHeader({ title: "Level Up Your Trivia Experience", backHref: "/dashboard" });
  }, [setHeader]);

  // Show Premium Dashboard if user is premium
  if (membership?.is_premium || user?.is_premium) {
    return <PremiumDashboard />;
  }

  const handlePurchase = async (tier: PricingTier) => {
    // Skip for free tier
    if (tier.price === 0) {
      router.push("/dashboard");
      return;
    }

    setIsProcessing(true);

    try {
      // Get variant ID from environment variable
      const variantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID;
      
      if (!variantId) {
        alert("⚠️ Payment system configuration missing.\n\nPlease add NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID to your .env.local file.\n\nSee backend/LEMON_SQUEEZY_SETUP.md for setup instructions.");
        setIsProcessing(false);
        return;
      }

      // Create checkout session
      const { checkout_url } = await createCheckout(variantId, "premium");
      
      // Redirect to Lemon Squeezy checkout
      redirectToCheckout(checkout_url);
      
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      
      // Extract error message safely
      let errorMessage = "Failed to start checkout. Please try again or contact support.";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string; error?: string } } };
        errorMessage = axiosError.response?.data?.detail 
          || axiosError.response?.data?.error 
          || errorMessage;
      }
      
      alert(`❌ Checkout Error\n\n${errorMessage}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <CreativePricing
        title="Level Up Your Trivia Experience"
        description="Enjoy premium perks with our Lifetime Premium plan."
        tiers={sampleTiers}
        onSelectTier={handlePurchase}
        isProcessing={isProcessing}
      />
      <p className="text-center text-sm text-gray-500 mt-6">
        Psst… sometimes we surprise our {" "} <a
    href="https://instagram.com/Trivia.Spirit"
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-500 underline"
  >
    Instagram
  </a>{" "} followers with secret discount codes 👀
      </p>
    </div>
  );
}


