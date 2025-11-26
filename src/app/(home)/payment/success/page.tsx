"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { authAPI } from "@/lib/api/auth";
import { logger } from "@/lib/utils/logger";
import { useQueryClient } from "@tanstack/react-query";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [countdown, setCountdown] = useState(5);
  const [isRefetching, setIsRefetching] = useState(true);

  useEffect(() => {
    // Force refetch user profile to get updated membership status
    const refetchProfile = async () => {
      try {
        logger.log("🔄 Refetching user profile after payment...");
        
        // Fetch fresh profile data
        const profileData = await authAPI.getProfile();
        logger.log("✅ Profile refetched successfully", profileData);
        
        // Invalidate all user-related queries to force refetch across the app
        await queryClient.invalidateQueries({ 
          queryKey: ['user'], 
          refetchType: 'active' 
        });
        await queryClient.invalidateQueries({ 
          queryKey: ['categories', 'user'], 
          refetchType: 'active' 
        });
        
        logger.log("✅ Cache invalidated, membership should be active now");
        setIsRefetching(false);
      } catch (error) {
        logger.exception(error, { where: "PaymentSuccess.refetchProfile" });
        setIsRefetching(false);
      }
    };

    refetchProfile();

    // Countdown redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, queryClient]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div
          className="relative bg-white border-2 border-zinc-900 rounded-lg 
                     shadow-[8px_8px_0px_0px] shadow-zinc-900 p-8 md:p-12"
        >
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-full bg-green-400 border-2 border-zinc-900 
                         flex items-center justify-center shadow-[4px_4px_0px_0px] shadow-zinc-900"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-handwritten text-4xl md:text-5xl text-center text-zinc-900 mb-4">
            Payment Successful! 🎉
          </h1>

          {/* Description */}
          <p className="font-handwritten text-xl text-center text-zinc-600 mb-8">
            {isRefetching
              ? "Activating your premium membership..."
              : "Welcome to premium! Your account has been upgraded and you now have full access to all categories and features."}
          </p>

          {/* Features unlocked */}
          <div className="bg-amber-50 border-2 border-zinc-900 rounded-lg p-6 mb-8">
            <h2 className="font-handwritten text-2xl text-zinc-900 mb-4">
              What you unlocked:
            </h2>
            <ul className="space-y-3">
              {[
                "All premium categories",
                "Ad-free experience",
                "All future updates included",
                "Early Supporter Badge",
                "Access to community categories",
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="font-handwritten text-lg text-zinc-900">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Redirect info */}
          <div className="text-center mb-6">
            <p className="font-handwritten text-zinc-600 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting to dashboard in {countdown} seconds...
            </p>
          </div>

          {/* Manual redirect button */}
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full h-12 font-handwritten text-lg border-2 border-zinc-900 
                     bg-amber-400 text-zinc-900 hover:bg-amber-300 
                     shadow-[4px_4px_0px_0px] shadow-zinc-900 
                     hover:shadow-[6px_6px_0px_0px] 
                     hover:translate-x-[-2px] hover:translate-y-[-2px] 
                     transition-all"
          >
            Go to Dashboard Now
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 text-6xl animate-bounce">
          🎊
        </div>
        <div className="absolute bottom-10 right-10 text-6xl animate-bounce delay-150">
          🎉
        </div>
      </div>
    </div>
  );
}
