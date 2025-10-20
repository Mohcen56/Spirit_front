'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { gameAPI } from '@/lib/api/index';

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  image_url?: string;
  questions_count?: number;
  privacy?: 'public' | 'private';
  created_by_id?: number;
  is_approved?: boolean;
}

interface UserProfileProps {
  user: User;
  onBack: () => void;
}

export default function UserProfile({ user, onBack }: UserProfileProps) {
  const [formData] = useState({
    username: user.username,
    avatar: user.avatar,
  });
  
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || '/avatars/tanjiro.jpeg');
  const [userCategories, setUserCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Fetch categories created by this user
  useEffect(() => {
    const fetchUserCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const allCategories = await gameAPI.getUserCategories();
        const categories = Array.isArray(allCategories) ? allCategories : (allCategories?.results || []);
        
        // Filter to only show categories created by this user
        const filtered = categories.filter((cat: Category) => cat.created_by_id === user.id);
        setUserCategories(filtered);
      } catch (error) {
        console.error('Error fetching user categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchUserCategories();
  }, [user.id]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
        </div>
      </div>

      {/* Profile Form */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
              {avatarPreview && avatarPreview !== '/avatars/tanjiro.jpeg' ? (
                <Image
                  src={avatarPreview}
                  alt="Profile Avatar"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  onError={() => {
                    setAvatarPreview('/avatars/tanjiro.jpeg');
                  }}
                />
              ) : (
                <Image
                  src="/avatars/tanjiro.jpeg"
                  alt="Default Avatar"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
           
            
          </div>
         
            </div>

        {/* Basic Info */}
        <div className="space-y-6 mb-8">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              readOnly
            />
          </div>
        </div>

        {/* Categories Created by User */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Categories Created ({userCategories.length})
          </h3>
          
          {isLoadingCategories ? (
            <div className="text-center py-8 text-gray-500">Loading categories...</div>
          ) : userCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No categories created yet
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {userCategories.map((category) => (
                <div
                  key={category.id}
                  className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                >
                  {/* Category Image */}
                  <div className="h-3/4 relative">
                    {category.image_url || category.image ? (
                      <Image
                        src={(category.image_url || category.image)!}
                        alt={category.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">
                          {category.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Questions Count Badge */}
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
                      {category.questions_count || 0} questions
                    </div>

                    {/* Approval Status */}
                    {!category.is_approved && (
                      <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                        Pending
                      </div>
                    )}

                    {/* Privacy Badge */}
                    {category.privacy === 'private' && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                        Private
                      </div>
                    )}
                  </div>

                  {/* Category Name */}
                  <div className="h-1/4 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center px-2">
                    <h4 className="text-white font-bold text-sm text-center line-clamp-2">
                      {category.name}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
