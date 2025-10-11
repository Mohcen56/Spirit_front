'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authAPI } from '@/lib/api/index';
import { User } from '@/types/game';
import { Play, Trophy, History, LogOut } from 'lucide-react';
import UserProfile from '@/components/UserProfile';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        console.log('User data received:', userData);
        console.log('User avatar:', userData.avatar);
        setUser(userData);
      } catch {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      router.push('/login');
    } catch {
      // Force redirect even if logout fails
      router.push('/login');
    }
  };

  const handleProfileSave = async (data: { username: string; email: string; avatar: string; avatarFile?: File; password?: string; currentPassword?: string }) => {
    try {
      let updatedUser = user;

      // Update basic profile information
      if (data.username !== user?.username || data.email !== user?.email) {
        console.log('Updating profile info...');
        const profileResult = await authAPI.updateProfile({
          username: data.username,
          email: data.email,
        });
        
        if (!profileResult.success) {
          throw new Error(profileResult.error || 'Failed to update profile');
        }
        updatedUser = profileResult.user;
      }

      // Update profile picture if a new file was selected
      if (data.avatarFile) {
        console.log('Updating profile picture...');
        const avatarResult = await authAPI.updateProfilePicture(data.avatarFile);
        
        console.log('Avatar update result:', avatarResult);
        
        if (!avatarResult.success) {
          throw new Error(avatarResult.error || 'Failed to update profile picture');
        }
        if (updatedUser) {
          console.log('Updating user avatar from:', updatedUser.avatar, 'to:', avatarResult.avatar_url);
          updatedUser = { ...updatedUser, avatar: avatarResult.avatar_url };
        }
      }

      // Change password if provided
      if (data.password && data.currentPassword) {
        console.log('Changing password...');
        const passwordResult = await authAPI.changePassword(data.currentPassword, data.password);
        
        if (!passwordResult.success) {
          throw new Error(passwordResult.error || 'Failed to change password');
        }
      }

      // Update user state with new data
      console.log('Setting user state to:', updatedUser);
      setUser(updatedUser);
      
      // Close profile view
      setShowProfile(false);
      
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Profile save error:', error);
      // You might want to show an error message to the user here
      alert(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-custom-bg flex items-center justify-center">
        <div className="text-gray-800 text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-custom-bg">
      {showProfile && user ? (
        <UserProfile
          user={user}
          onBack={() => setShowProfile(false)}
          onSave={handleProfileSave}
        />
      ) : (
        <>
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={() => setShowProfile(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer overflow-hidden border-2 border-white shadow-lg"
              aria-label="Open profile settings"
            >
              {user.avatar && user.avatar !== '/avatars/tanjiro.jpeg' ? (
                <Image
                  src={user.avatar}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    console.log('Custom avatar failed to load:', user.avatar);
                    // Fallback to default avatar
                    (e.target as HTMLImageElement).src = '/avatars/tanjiro.jpeg';
                  }}
                />
              ) : (
                <Image
                  src="/avatars/tanjiro.jpeg"
                  alt="Default Profile"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-full"
                />
              )}
            </button>
            <div className="text-gray-800">
              <h1 className="text-xl font-bold">Brainigo</h1>
              <p className="text-sm text-gray-600">Welcome, {user.username}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-gray-800 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to Quiz Game
            </h2>
            <p className="text-xl text-gray-600">
              Test your knowledge and have fun with your friends
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Start New Game */}
            <Link href="/categories">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 hover:bg-white/90 transition-all duration-200 transform hover:scale-105 cursor-pointer group shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-gradient-to-r from-green-400 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">New Game</h3>
                  <p className="text-gray-600 text-sm">Start a new game and choose question categories</p>
                </div>
              </div>
            </Link>

            {/* View Results */}
            <Link href="/results">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 hover:bg-white/90 transition-all duration-200 transform hover:scale-105 cursor-pointer group shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Results</h3>
                  <p className="text-gray-600 text-sm">View current game results</p>
                </div>
              </div>
            </Link>

            {/* Game History */}
            <Link href="/history">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 hover:bg-white/90 transition-all duration-200 transform hover:scale-105 cursor-pointer group shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <History className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">History</h3>
                  <p className="text-gray-600 text-sm">Previous games history and statistics</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Your Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-500">Games Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-500">Correct Answers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">0</div>
                <div className="text-sm text-gray-500">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">--</div>
                <div className="text-sm text-gray-500">Best Score</div>
              </div>
            </div>
          </div>
        </div>
      </main>
        </>
      )}
    </div>
  );
}
