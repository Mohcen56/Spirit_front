'use client';


import {  useEffect, useState } from 'react';
import Link from 'next/link';
import { authAPI } from '@/lib/api/index';
import { Play, History,  } from 'lucide-react';
import UserProfile from '@/components/User/UserProfile';
import { useAuthGate } from '@/hooks/useAuthFate';

import { useHeader } from '../layout';
export default function HomePage() {
  const [showProfile, setShowProfile] = useState(false);
 const { setHeader } = useHeader();
const { user, setUser, isLoading,  } = useAuthGate({ redirectIfGuest: '/login' });

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
 useEffect(() => {
    setHeader({ title: "", backHref: "/" });
  }, [setHeader]);
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
  


      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to trivia spirit
            </h2>
            <p className="text-xl text-gray-600">
              Test your knowledge and have fun with your friends
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2   gap-6">
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

     

            {/* Game History */}
            <Link href="/history">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 hover:bg-white/90 transition-all duration-200 transform hover:scale-105 cursor-pointer group shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <History className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">your games </h3>
                  <p className="text-gray-600 text-sm">Your previous games If you keep playing them</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Stats */}
         
           
          
        </div>
      </main>
        </>
      )}
    </div>
  );
}
