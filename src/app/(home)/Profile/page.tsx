"use client";
import { useRouter } from "next/navigation";
import UserProfile from "@/components/User/UserProfile";
import { useAuthGate } from "@/hooks/useAuthGate";
import { authAPI } from "@/lib/api/auth";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, isLoading } = useAuthGate();

  const handleSave = async (data: {
    username: string;
    email: string;
    avatar: string;
    avatarFile?: File;
    password?: string;
    currentPassword?: string;
  }) => {
    try {
      // 1) Update basic profile fields if changed
      if (
        (data.username && data.username !== user!.username) ||
        (data.email && data.email !== user!.email)
      ) {
        const res = await authAPI.updateProfile({
          username: data.username,
          email: data.email,
        });
        if (!res.success) throw new Error(res.error || "Failed to update profile");
        if (res.user) setUser(res.user);
      }

      // 2) Update avatar if a new file was selected
      if (data.avatarFile) {
        const res = await authAPI.updateProfilePicture(data.avatarFile);
        if (!res.success) throw new Error(res.error || "Failed to update avatar");
        if (res.user) setUser(res.user);
      }

      // 3) Change password if provided
      if (data.password) {
        const res = await authAPI.changePassword(data.currentPassword || "", data.password);
        if (!res.success) throw new Error(res.error || "Failed to change password");
      }

      // Optional: show a toast/snackbar here
      console.log("Profile saved successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save profile";
      console.error(message);
      // Optional: show error toast
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        Loading profile...
      </div>
    );
  }

  return (
    <UserProfile
      user={user}
      onBack={() => router.back()}
      onSave={handleSave}
    />
  );
}
