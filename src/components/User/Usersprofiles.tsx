'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { gameAPI } from '@/lib/api/index';
import { VerifyBadge } from '@/components/ui/verify-badge';
import { AnimatedBadge } from '@/components/ui/animatedbadge';
import { useCreatorBadge } from '@/hooks/useCreatorBadge';

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  is_premium?: boolean;
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
  created_by_username?: string;
  created_by_is_premium?: boolean;
  is_approved?: boolean;
}

interface UserProfileProps {
  user: User;
  onBack: () => void;
}

export default function UserProfile({ user, onBack }: UserProfileProps) {
  const router = useRouter();
  const [formData] = useState({
    username: user.username,
    avatar: user.avatar,
  });
  
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || '/avatars/thumbs.svg');
  const [userCategories, setUserCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Fetch categories created by this user
  useEffect(() => {
    const fetchUserCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const allCategories = await gameAPI.getUserCategories();
        
        // Filter to only show categories created by this user
        const filtered = allCategories.filter((cat: Category) => cat.created_by_id === user.id);
        setUserCategories(filtered);
      } catch (error) {
        console.error('Error fetching user categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchUserCategories();
  }, [user.id]);
  
  // Calculate approved categories count and use the creator badge hook
  const approvedCategoriesCount = userCategories.filter(cat => cat.is_approved).length;
  const creatorBadge = useCreatorBadge(approvedCategoriesCount);
  
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
              {avatarPreview && avatarPreview !== '/avatars/thumbs.svg' ? (
                <Image
                  src={avatarPreview}
                  alt="Profile Avatar"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  onError={() => {
                    setAvatarPreview('/avatars/thumbs.svg');
                  }}
                />
              ) : (
                <Image
                  src="/avatars/thumbs.svg"
                  alt="Default Avatar"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          
          {/* Username */}
          <h2 className="text-2xl font-bold text-gray-800 mt-4">
            {formData.username}
          </h2>
          <div className="flex items-center space-x-2">
          {/* Premium Badge */}
          {user.is_premium && (
            <div className="mt-2">
              <VerifyBadge type="premium" size="md" showLabel={true} />
            </div>
          )}

            {/* Creator Level - Animated Badge based on approved categories */}
            {approvedCategoriesCount > 0 && (
              <div className="mt-2 flex">
                <AnimatedBadge
                  text={`${creatorBadge.level} · ${creatorBadge.count}`}
                  icon={creatorBadge.icon}
                  borderColor={creatorBadge.borderColor}
                  shadowColor={creatorBadge.shadowColor}
                />
              </div>
            )}
        </div></div>

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
                <button
                  key={category.id}
                  onClick={() => router.push(`/categories/edit/${category.id}`)}
                  className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer group"
                >
                  {/* Category Image */}
                  <div className="h-4/5 relative">
                    {category.image_url || category.image ? (
                      <Image
                        src={(category.image_url || category.image)!}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:brightness-110 transition-all"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-eastern-blue-500 to-eastern-blue-700 flex items-center justify-center group-hover:from-eastern-blue-600 group-hover:to-eastern-blue-800 transition-all">
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
                  <div className="h-1/5 bg-gradient-to-br from-eastern-blue-500 to-eastern-blue-700 flex items-center justify-center px-2 group-hover:from-eastern-blue-600 group-hover:to-eastern-blue-800 transition-all">
                    <h4 className="text-white font-bold text-sm text-center line-clamp-2">
                      {category.name}
                    </h4>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
